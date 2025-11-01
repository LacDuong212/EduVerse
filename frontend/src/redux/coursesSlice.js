import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currency: import.meta.env.VITE_CURRENCY,
  newest: [],
  bestSellers: [],
  topRated: [],
  biggestDiscounts: [],
  allCourses: [],
};

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setHomeCourses: (state, action) => {
      state.newest = action.payload.newest;
      state.bestSellers = action.payload.bestSellers;
      state.topRated = action.payload.topRated;
      state.biggestDiscounts = action.payload.biggestDiscounts;
    },
    setAllCourses: (state, action) => {
      state.allCourses = action.payload;
    },
   appendCourses: (state, action) => {
      const incoming = Array.isArray(action.payload) ? action.payload : [];

      // Lấy id chuẩn, hỗ trợ nhiều schema
      const getId = (x) => x?.courseId ?? x?._id ?? x?.id;

      const existingIds = new Set(state.allCourses.map(getId));

      // ✅ Chỉ lấy những item CHƯA có trong state
      const toAdd = incoming.filter((x) => !existingIds.has(getId(x)));

      // (tuỳ chọn) log cho bạn check:
      // console.log('append', incoming.length, 'before:', state.allCourses.length);
      // console.log('after filter:', toAdd.length);

      state.allCourses.push(...toAdd);

      // console.log('new total:', state.allCourses.length);
    },
  },
});

export const { setHomeCourses, setAllCourses, appendCourses } = coursesSlice.actions;
export default coursesSlice.reducer;
