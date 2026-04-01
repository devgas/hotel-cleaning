import { baseApi } from './baseApi'

interface Room {
  id: number
  roomNumber: string
}

export const roomsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRooms: build.query<Room[], void>({
      query: () => '/rooms',
      providesTags: ['Rooms'],
    }),
    createRoom: build.mutation<Room, { roomNumber: string }>({
      query: (body) => ({ url: '/rooms', method: 'POST', body }),
      invalidatesTags: ['Rooms'],
    }),
    updateRoom: build.mutation<Room, { id: number; roomNumber: string }>({
      query: ({ id, ...body }) => ({ url: `/rooms/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Rooms'],
    }),
    deleteRoom: build.mutation<{ ok: boolean }, number>({
      query: (id) => ({ url: `/rooms/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Rooms'],
    }),
  }),
})

export const {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = roomsApi
