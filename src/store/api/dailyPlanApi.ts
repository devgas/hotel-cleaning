import { baseApi } from './baseApi'
import type { RoomWithStatus, DailyPlanSummary, RoomType } from '@/types'

interface DailyPlan {
  id: number
  date: string
  rooms: RoomWithStatus[]
}

interface CreatePlanInput {
  date?: string
  rooms: {
    roomId: number
    roomType: RoomType
    priority: boolean
    priorityTime?: string | null
    guestCount?: number
  }[]
}

export const dailyPlanApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTodayPlan: build.query<DailyPlan | null, void>({
      query: () => '/daily-plans/today',
      providesTags: ['DailyPlan', 'DailyPlanRooms'],
    }),
    getPlanByDate: build.query<DailyPlan | null, string>({
      query: (date) => `/daily-plans/${date}`,
      providesTags: ['DailyPlan', 'DailyPlanRooms'],
    }),
    createDailyPlan: build.mutation<{ id: number }, CreatePlanInput>({
      query: (body) => ({ url: '/daily-plans', method: 'POST', body }),
      invalidatesTags: ['DailyPlan', 'DailyPlanRooms'],
    }),
    getHistory: build.query<DailyPlanSummary[], void>({
      query: () => '/daily-plans/history',
      providesTags: ['History'],
    }),
    updateRoomStatus: build.mutation<
      { status: string; updatedBy: string | null; updatedAt: string },
      { id: number; status: string; sendMessageUsed?: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/daily-plan-rooms/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['DailyPlanRooms'],
    }),
    updateRoomType: build.mutation<
      { roomType: RoomType; priority: boolean; priorityTime: string | null; guestCount: number },
      { id: number; roomType: RoomType; priority?: boolean; priorityTime?: string | null; guestCount?: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/daily-plan-rooms/${id}/type`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['DailyPlanRooms'],
    }),
  }),
})

export const {
  useGetTodayPlanQuery,
  useGetPlanByDateQuery,
  useCreateDailyPlanMutation,
  useGetHistoryQuery,
  useUpdateRoomStatusMutation,
  useUpdateRoomTypeMutation,
} = dailyPlanApi
