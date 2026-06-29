import type { Room } from '~/types/rooms'
import { useApi } from './core/useApi'

export const useRooms = () => {
  const { api } = useApi()

  const currentRoom = ref<Room | null>(null)

  const getRoom = async (code: string) => {
    const res = await api<{ room: Room }>(`/rooms/${code}`, {
      method: 'GET'
    })

    currentRoom.value = res.room
    return res.room
  }

  const createRoom = async (gameId: string) => {
    const res = await api<{ room: Room }>('/rooms', {
      method: 'POST',
      body: { gameId }
    })

    currentRoom.value = res.room
    return res.room
  }

  const joinRoom = async (code: string) => {
    const res = await api<{ room: Room }>(`/rooms/${code}/join`, {
      method: 'PATCH'
    })

    currentRoom.value = res.room
    return res.room
  }

  const leaveRoom = async (code: string) => {
    const res = await api<{ room: Room }>(`/rooms/${code}/leave`, {
      method: 'PATCH'
    })

    currentRoom.value = res.room
    return res.room
  }

  return {
    currentRoom,
    getRoom,
    createRoom,
    joinRoom,
    leaveRoom
  }
}