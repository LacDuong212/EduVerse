import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currency: import.meta.env.VITE_CURRENCY,
  newest: [],
  bestSellers: [],
  topRated: [],
  biggestDiscounts: [],
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
  },
});

export const { setHomeCourses } = coursesSlice.actions;
export default coursesSlice.reducer;
