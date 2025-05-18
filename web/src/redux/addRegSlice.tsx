import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AddRegState {
  account: boolean | undefined;
  household: boolean | undefined;
  family: boolean | undefined;
}

const initialState: AddRegState = {
  account: undefined,
  household: undefined,
  family: undefined
}

export const addRegSlice = createSlice({
  name: 'addRegistration',
  initialState,
  reducers: {
    accountCreated: (state, action: PayloadAction<boolean | undefined>) => {
      state.account = action.payload
    },
    householdRegistered: (state, action: PayloadAction<boolean | undefined>) => {
      state.household = action.payload
    },
    familyRegistered: (state, action: PayloadAction<boolean | undefined>) => {
      state.family = action.payload
    },
    reset: () => initialState
  }
})

export const { accountCreated, householdRegistered, familyRegistered, reset } = addRegSlice.actions;
export default addRegSlice.reducer;

// Selectors
export const selectAccount = (state: any) => state.addRegister.account
export const selectHousehold = (state: any) => state.addRegister.household
export const selectFamily = (state: any) => state.addRegister.family