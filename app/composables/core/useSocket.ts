import { useAuth } from "./useAuth"

export const useSocket = () => {
  const { $socket } = useNuxtApp()

  const token = useCookie<string | null>('token')
  const {id} = useAuth()

  const connect = (roomCode: string) => {
    if (
      !token.value
    ) return

    $socket.auth = {
      token: token.value,
      roomCode
    }

    $socket.connect()
    console.log(`[${id.value}] connected to game room: ${roomCode}`)
  }

  const disconnect = () => {
    $socket.disconnect()
  }

  return {
    socket: $socket,
    connect,
    disconnect
  }
}