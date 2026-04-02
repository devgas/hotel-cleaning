import { baseApi } from './baseApi'
import type { AppSettings } from '@/types'

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSettings: build.query<AppSettings, void>({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),
    updateSettings: build.mutation<{ ok: boolean }, Partial<AppSettings>>({
      query: (body) => ({ url: '/settings', method: 'PUT', body }),
      invalidatesTags: ['Settings'],
    }),
  }),
})

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi
