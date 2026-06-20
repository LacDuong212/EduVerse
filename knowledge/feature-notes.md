# Feature: Notes (Video Player)

> Tài liệu đầy đủ về hệ thống Note trong Video Player. Đọc file này trước khi sửa/thêm bất kỳ thứ gì liên quan đến note.

---

## Tổng quan

Học viên có thể ghi chú trong khi xem video. Mỗi note được gắn với một timestamp cụ thể. Notes hiển thị ở sidebar bên phải màn hình video, đồng thời xuất hiện dưới dạng marker trên progress bar của video.

---

## Data Model (Backend)

**File:** `backend/src/modules/note/note.model.js`

```
Note {
  userId       : ObjectId (ref User)
  courseId     : ObjectId (ref Course)
  lectureId    : ObjectId (ref Lecture)
  timestamp    : Number   (giây, vị trí trong video)
  content      : String   (max 5000 ký tự)
  tags         : [String] (max 10 tags, mỗi tag max 50 ký tự, lowercase)
  isDeleted    : Boolean  (soft delete, default false)
}
```

**DTO** (`toNoteDto`): `{ id, lectureId, courseId, timestamp, content, tags, createdAt }`

---

## API Endpoints

**File:** `backend/src/modules/note/note.route.js`

| Method | Path | Description |
|--------|------|-------------|
| `GET`    | `/notes/lectures/:lectureId` | Lấy notes theo lecture (sort timestamp ASC) |
| `GET`    | `/notes/courses/:courseId`   | Lấy toàn bộ notes trong course (sort timestamp ASC) |
| `POST`   | `/notes`                     | Tạo note mới |
| `PATCH`  | `/notes/:noteId`             | Cập nhật content + tags |
| `DELETE` | `/notes/:noteId`             | Soft delete |

**Sort:**
- `getNotesByLecture`: `sort({ timestamp: 1 })` — ascending (timeline order)
- `getNotesByCourse`: `sort({ timestamp: 1 })` — ascending (timeline order)

**Validation file:** `backend/src/modules/note/note.validation.js`  
**Service file:** `backend/src/modules/note/note.service.js`  
**Controller file:** `backend/src/modules/note/note.controller.js`

---

## Frontend — File Map

```
frontend/src/app/pages/course/video-player/
├── components/
│   ├── VideoPlayerDetail.jsx          ← lifted state: useNotes() ở đây
│   ├── CoursePlaylistSidebar.jsx      ← toggle sidebar (CSS max-width transition)
│   └── notes/
│       ├── NoteSidebar.jsx            ← main note UI component
│       ├── NoteItem.jsx               ← individual note card (view + edit mode)
│       ├── NoteProgressMarkers.jsx    ← amber dots trên Plyr progress bar
│       └── TagInput.jsx               ← tag chip input
├── hooks/
│   └── useNotes.js                    ← data hook (per-lecture + course-wide)
└── utils/
    └── exportNotes.js                 ← export PDF

frontend/src/app/student/learning/
├── components/
│   ├── CourseDetail.jsx               ← thêm tab "Notes"
│   ├── NotesTab.jsx                   ← Notes tab trong Learning page
└── hooks/
    └── useCourseNotes.js              ← hook riêng cho Notes tab (lazy fetch)
```

---

## State Architecture

### `useNotes` hook — `hooks/useNotes.js`

State được **lift lên** `VideoPlayerDetail` để `NoteProgressMarkers` và `NoteSidebar` dùng chung, tránh fetch trùng.

```js
const notesApi = useNotes({ lectureId, courseId });
// truyền notesApi qua prop xuống CoursePlaylistSidebar → NoteSidebar
// và dùng notesApi.notes cho NoteProgressMarkers
```

**State trong hook:**
- `notes` — notes của lecture hiện tại, sort ASC by timestamp
- `loading` — loading state cho per-lecture fetch
- `submitting` — loading state cho create/edit/delete
- `courseNotes` — notes toàn course (lazy, chỉ load khi chuyển sang All scope)
- `courseNotesLoading` — loading state cho course-wide fetch

**Sync khi mutate:**
- `addNote`: thêm vào cả `notes` (ASC sort) lẫn `courseNotes` nếu đã loaded
- `editNote`: update cả hai states
- `removeNote`: filter cả hai states

---

## Component: `NoteSidebar`

**Props:** `{ notesApi, lectureId, lectureTitle, courseTitle, getCurrentTime, onSeek, onNavigateToLecture, course }`

### Layout (flex column, h-100):
1. **Header** (flex-shrink-0): scope tabs (This Lecture / All) + export button + search bar
2. **Compose box** (flex-shrink-0): luôn visible trong Lecture scope, ẩn trong All scope
3. **Notes list** (flex-grow-1, overflow-auto): danh sách note + bottom spacer
4. **Pinned footer** (flex-shrink-0): Q&A button + Back to Learning Course

### Scope:
- **This Lecture**: hiển thị `notes` (per-lecture), sort ASC
- **All**: hiển thị `courseNotes`, group by lectureId với section/lecture headings

### Search:
- Xuất hiện khi `isAll === true` hoặc `notes.length > 3`
- Filter theo `content` và `tags`

### Compose box behavior:
- Timestamp badge (`@ 1:23`) cập nhật realtime mỗi 500ms từ `getCurrentTime()`
- **Enter** → save note (timestamp = `getCurrentTime()` tại lúc nhấn)
- **Shift+Enter** → xuống dòng
- Không có Save button, không có Cancel button
- Clear content sau khi save thành công

### Global Enter shortcut:
- Khi không đang focus vào input/textarea/select nào → focus compose textarea
- Chỉ active trong Lecture scope
- Dependency: `[scope]` (không dùng `isAll` để tránh TDZ error)

### Active note + Auto-scroll:
- Interval 500ms: tìm note cuối cùng có `timestamp <= currentTime` (ascending sort)
- Khi `activeNoteId` thay đổi: scroll list để active note nằm ở đầu visible area
- Dùng `getBoundingClientRect()` để tính `scrollTop` chính xác
- **Bottom spacer** = `clientHeight` của list container → đảm bảo note cuối cũng scroll lên đầu được

---

## Component: `NoteItem`

**Props:** `{ note, isActive, onSeek, onEdit, onDelete, submitting }`

- **View mode**: timestamp button (jump to moment) + content + tags + edit/delete icons
- **Edit mode**: textarea + TagInput + Cancel/Save buttons
- `isActive`: highlight với `border-primary` + background `#eef0fd`
- Content: `overflowWrap: "break-word"` + `wordBreak: "break-word"` để xử lý long strings

---

## Component: `NoteProgressMarkers`

**Props:** `{ notes, playerContainerRef, playerKey }`

Inject amber dot markers vào Plyr's `.plyr__progress` element bằng `createPortal`.

**Init flow (single useEffect, retry 200ms):**
1. Retry tìm cả `.plyr__progress` VÀ `<video>` — cả hai cần có mặt trước khi init
2. Sau khi tìm thấy: `setProgressEl`, gắn `loadedmetadata`/`durationchange` listener
3. Nếu video đã load (`readyState >= 1`): lấy duration ngay
4. Cleanup: `clearTimeout` + remove listeners

**Marker style:**
- `width: 8px, height: 8px, borderRadius: 50%` — hình tròn
- `backgroundColor: "#fde68a"` — amber-200 (vàng nhạt)
- `top: 50%, transform: translate(-50%, -50%)` — căn giữa theo chiều dọc
- `zIndex: 3` — nằm trên Plyr range inputs (z-index 2)
- `pointerEvents: none` — không chặn click trên seek bar
- `title` tooltip: `"Note at M:SS"`

**Re-init trigger:** `playerKey` thay đổi (Plyr remount khi chuyển lecture)

---

## Component: `TagInput`

**Props:** `{ tags, onChange, maxTags = 10, disabled }`

- **Enter** hoặc **comma** → commit tag
- **onBlur** → commit tag nếu có text
- Tag được trim, lowercase, slice(0, 50), loại bỏ duplicate
- **×** button để xóa tag
- Hiển thị chip style

---

## Component: `CoursePlaylistSidebar`

Toggle sidebar dùng **CSS max-width transition** (không dùng React Bootstrap Collapse vì Collapse với `h-100` bị bug đo scrollWidth = 0):

```jsx
<div
  className="h-100"
  style={{
    overflow: "hidden",
    maxWidth: isOpen ? 400 : 0,
    transition: "max-width 0.35s ease",
  }}
>
```

- `useToggle(true)` — open by default
- Toggle button: `position: absolute; right: 100%` (CSS class `.plyr-toggler`)
- Tab bar: "Course Content" / "Notes"

---

## Notes Tab (Learning Page)

**File:** `frontend/src/app/student/learning/components/NotesTab.jsx`  
**Hook:** `frontend/src/app/student/learning/hooks/useCourseNotes.js`

- Lazy mount: chỉ render khi `activeTab === "notes"` trong `CourseDetail.jsx`
- Group by lectureId với section + lecture title headings
- "Watch →" button: navigate đến `/student/courses/:courseId/watch/:lecId`
- Search bar (maxWidth 340)
- Export PDF button
- Reuse `NoteItem` component
- Empty state khi 0 notes

---

## Styling Rules

- **KHÔNG dùng `text-muted`** — luôn dùng `text-body` (với `opacity-50` nếu cần mờ)
- Active note background: `#eef0fd`
- Progress marker color: `#fde68a` (amber-200)
- Sidebar width: `w-280px` (mobile) / `w-sm-400px` (≥576px)

---

## Known Gotchas

1. **`isAll` TDZ**: `isAll` được khai báo ở giữa component. Bất kỳ `useEffect` nào dùng `isAll` trong deps phải dùng `scope === "all"` thay thế, hoặc di chuyển xuống sau khai báo.

2. **Plyr init async**: Cả `.plyr__progress` lẫn `<video>` element đều cần retry — Plyr tạo DOM sau khi React render xong.

3. **Sort direction**: `notes` (per-lecture) sort **ASC** (timeline). `courseNotes` sort **ASC** (timeline). Cả hai đều ascending.

4. **Active note logic (ascending sort)**: Vì notes sort ASC, active note là note CUỐI CÙNG có `timestamp <= currentTime`:
   ```js
   for (const n of notes) {
     if (n.timestamp <= t) active = n.id;
     else break;
   }
   ```

5. **Bottom spacer**: `listHeight` đo 1 lần lúc mount. Không reactive với resize — chấp nhận được vì sidebar có fixed height.

6. **`courseNotes` sync**: `addNote` chỉ insert vào `courseNotes` nếu mảng đã có data (`if (!prev.length) return prev`) — tránh trigger fetch sớm.
