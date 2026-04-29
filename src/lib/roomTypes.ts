import type { RoomType } from '@/types'

export type DbRoomType = 'checkout' | 'stayover' | 'big_stayover'

export const roomTypeOptions = ['checkout', 'stayover', 'big-stayover'] as const satisfies readonly RoomType[]

export function isStayoverRoomType(roomType: RoomType | DbRoomType) {
  return roomType === 'stayover' || roomType === 'big-stayover' || roomType === 'big_stayover'
}

export function toDbRoomType(roomType: RoomType): DbRoomType {
  return roomType === 'big-stayover' ? 'big_stayover' : roomType
}

export function fromDbRoomType(roomType: DbRoomType): RoomType {
  return roomType === 'big_stayover' ? 'big-stayover' : roomType
}
