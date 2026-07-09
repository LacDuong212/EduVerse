const Bar = ({ w = "100%", h = 12 }) => (
  <span
    className="placeholder rounded"
    style={{ width: w, height: h, display: "inline-block" }}
  />
);

// Shown while course progress is still loading, so the playlist doesn't briefly
// render lock icons (locks are computed from progress, which is empty mid-load).
export default function PlaylistSkeleton({ sections = 4 }) {
  return (
    <div className="placeholder-glow">
      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <div key={sectionIndex} className="mb-3">
          {/* Section header */}
          <div className="d-flex align-items-center bg-light rounded-2 px-3 py-2 mb-2">
            <Bar w={`${65 - sectionIndex * 5}%`} h={14} />
          </div>

          {/* Lecture rows — only under the first couple of sections */}
          {sectionIndex < 2 && (
            <div className="vstack gap-2 px-2">
              {Array.from({ length: 3 }).map((_, lectureIndex) => (
                <div
                  key={lectureIndex}
                  className="d-flex align-items-center justify-content-between"
                >
                  <div className="d-flex align-items-center gap-2 w-100">
                    <span
                      className="placeholder rounded-circle"
                      style={{ width: 30, height: 30, display: "inline-block" }}
                    />
                    <Bar w={`${60 - lectureIndex * 8}%`} h={12} />
                  </div>
                  <Bar w="32px" h={10} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
