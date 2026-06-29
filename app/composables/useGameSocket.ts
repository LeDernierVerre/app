import { useSocket } from './core/useSocket'

export const useGameSocket = <
  TAction extends string
>() => {
  const { socket } = useSocket()
  
  const sendAction = <TPayload = unknown>(
    action: TAction,
    payload?: TPayload
  ) => {
    socket.emit('game:action', {
      action,
      payload
    })
  }

  return {
    sendAction
  }
}