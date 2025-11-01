export const parseYouTubeId = (url) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
  } catch {}
  return null;
};

export const toPlyrSource = (videoUrl, title = "", poster) => {
  const yt = parseYouTubeId(videoUrl);
  if (yt) {
    return {
      type: "video",
      title,
      poster, // poster vẫn được Plyr dùng khi phù hợp
      sources: [{ src: yt, provider: "youtube" }], // 👈 quan trọng
    };
  }
  return {
    type: "video",
    title,
    poster,
    sources: [{ src: videoUrl, type: "video/mp4" }],
  };
};
