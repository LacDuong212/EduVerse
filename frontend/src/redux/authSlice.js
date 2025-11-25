import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: undefined,
  userData: null,
};

const userSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.isLoggedIn = true;
      state.userData = action.payload;
    },
    setLogout: (state) => {
      state.isLoggedIn = false;
      state.userData = null;
    },
    setUserData: (state, action) => {
      state.userData = action.payload
    }
  },
});

export const { setLogin, setLogout, setUserData } = userSlice.actions;
export default userSlice.reducer;
