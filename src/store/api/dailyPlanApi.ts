import { baseApi } from './baseApi'
import type { RoomWithStatus, DailyPlanSummary } from '@/types'

interface DailyPlan {
  id: number
  date: string
  rooms: RoomWithStatus[]
}

interface CreatePlanInput {
  rooms: { roomId: number; roomType: 'checkout' | 'stayover'; priority: boolean }[]
}

export const dailyPlanApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTodayPlan: build.query<DailyPlan | null, void>({
      query: () => '/daily-plans/today',
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
  }),
})

export const {
  useGetTodayPlanQuery,
  useCreateDailyPlanMutation,
  useGetHistoryQuery,
  useUpdateRoomStatusMutation,
} = dailyPlanApi
