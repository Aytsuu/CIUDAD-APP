import { configureStore } from '@reduxjs/toolkit';
import addRegReducer from '../redux/addRegSlice'

export const store = configureStore({
  reducer: {
    addRegister: addRegReducer
  }
})