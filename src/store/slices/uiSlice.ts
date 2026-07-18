import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { BoardTab } from '@/lib/boardView'

const boardTabs = ['all', 'checkout', 'stayover'] as const

function isBoardTab(value: string): value is BoardTab {
  return boardTabs.includes(value as BoardTab)
}

interface UIState {
  boardTab: BoardTab
  isOnline: boolean
  locale: 'uk' | 'en'
}

const initialState: UIState = {
  boardTab: 'checkout',
  isOnline: true,
  locale: 'uk',
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setBoardTab: (state, action: PayloadAction<BoardTab>) => {
      state.boardTab = isBoardTab(action.payload) ? action.payload : 'all'
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
