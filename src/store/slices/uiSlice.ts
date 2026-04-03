import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type BoardTab = 'all' | 'priority' | 'checkout' | 'stayover'

interface UIState {
  boardTab: BoardTab
  isOnline: boolean
  locale: 'uk' | 'en'
}

const initialState: UIState = {
  boardTab: 'priority',
  isOnline: true,
  locale: 'uk',
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setBoardTab: (state, action: PayloadAction<BoardTab>) => {
      state.boardTab = action.payload
    },
    setOnline: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload
    },
    setLocale: (state, action: PayloadAction<'uk' | 'en'>) => {
      state.locale = action.payload
    },
  },
})

export const { setBoardTab, setOnline, setLocale } = uiSlice.actions
