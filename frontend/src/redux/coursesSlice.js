import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currency: import.meta.env.VITE_CURRENCY || "USD",
  newest: [],
  bestSellers: [],
  topRated: [],
  biggestDiscounts: [],
  allCourses: [],
  recommended: [],
};

const getId = (x) => x?.courseId ?? x?._id ?? x?.id ?? null;

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setHomeCourses: (state, action) => {
      const p = action.payload || {};
      state.newest = Array.isArray(p.newest) ? p.newest : [];
      state.bestSellers = Array.isArray(p.bestSellers) ? p.bestSellers : [];
      state.topRated = Array.isArray(p.topRated) ? p.topRated : [];
      state.biggestDiscounts = Array.isArray(p.biggestDiscounts) ? p.biggestDiscounts : [];
    },
    setAllCourses: (state, action) => {
      state.allCourses = Array.isArray(action.payload) ? action.payload : [];
    },
    appendCourses: (state, action) => {
      const incoming = Array.isArray(action.payload) ? action.payload : [];

      const normalizedIncoming = incoming.filter((x) => getId(x));

      const existingIds = new Set(state.allCourses.map(getId).filter(Boolean));

      const toAdd = normalizedIncoming.filter((x) => !existingIds.has(getId(x)));

      state.allCourses.push(...toAdd);
    },
    setCurrency: (state, action) => {
      state.currency = action.payload || state.currency;
    },
    setRecommendedCourses: (state, action) => {
      state.recommended = action.payload;
    },
  },
});

export const { setHomeCourses, setAllCourses, appendCourses, setCurrency, setRecommendedCourses } = coursesSlice.actions;
export default coursesSlice.reducer;
