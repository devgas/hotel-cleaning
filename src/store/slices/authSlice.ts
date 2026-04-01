import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  userId: string | null
  userName: string | null
  hotelId: string | null
}

const initialState: AuthState = {
  userId: null,
  userName: null,
  hotelId: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthState>) => {
      state.userId = action.payload.userId
      state.userName = action.payload.userName
      state.hotelId = action.payload.hotelId
    },
    clearUser: (state) => {
      state.userId = null
      state.userName = null
      state.hotelId = null
    },
  },
})

export const { setUser, clearUser } = authSlice.actions
