export type RoomType = 'checkout' | 'stayover'
export type CleaningStatus = 'not_cleaned_yet' | 'cleaned' | 'not_needed'

export interface RoomWithStatus {
  id: number
  roomId: number
  roomNumber: string
  roomType: RoomType
  priority: boolean
  status: CleaningStatus
  updatedBy?: string | null
  updatedAt: string
  dailyPlanRoomId: number
}

export interface DailyPlanSummary {
  date: string
  total: number
  cleaned: number
  notNeeded: number
  notCleaned: number
}

export interface AppSettings {
  defaultLanguage: string
  whatsappEnabled: boolean
  whatsappChatLink: string
  whatsappPhone: string
  whatsappMessageTemplate: string
  whatsappAllowAfterCleaned: boolean
}
