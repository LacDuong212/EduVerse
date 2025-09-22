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
      console.log("append", action.payload.length, "before:", state.allCourses.length);
      const newCourses = action.payload.filter(
        (c) => !state.allCourses.some((old) => old._id === c._id)
      );
      console.log("after filter:", newCourses.length);
      state.allCourses = [...state.allCourses, ...newCourses];
      console.log("new total:", state.allCourses.length);
    },
  },
});

export const { setHomeCourses, setAllCourses, appendCourses } = coursesSlice.actions;
export default coursesSlice.reducer;
