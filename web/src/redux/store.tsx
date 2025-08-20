// import { configureStore } from '@reduxjs/toolkit';
// import addRegReducer from '../redux/addRegSlice'

// export const store = configureStore({
//   reducer: {
//     addRegister: addRegReducer
//   }
// })

import { configureStore } from '@reduxjs/toolkit';
import addRegReducer from '../redux/addRegSlice'
// import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    addRegister: addRegReducer,
    // auth: authReducer
  }
})

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;