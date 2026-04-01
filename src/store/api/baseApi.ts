import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Rooms', 'DailyPlan', 'DailyPlanRooms', 'Settings', 'History'],
  endpoints: () => ({}),
})
