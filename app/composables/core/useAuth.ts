import { jwtDecode } from 'jwt-decode'
import { useApi } from './useApi'

type AuthTokenPayload = {
  id?: string
}

const getUserIdFromToken = (token: string | null): string | null => {
  if (!token) {
    return null
  }

  try {
    const payload = jwtDecode<AuthTokenPayload>(token)
    return payload.id ?? null;
  } catch {
    return null
  }
}

export const useAuth = () => {
  const { api } = useApi()

  const token = useCookie<string | null>('token')
  const username = useCookie<string | null>('username')
  const userId = useCookie<string | null>('userId')

  const loginAsGuest = async (name: string): Promise<string> => {
    const res = await api<{ token: string }>('/auth/guest', {
      method: 'POST',
      body: { username: name }
    })

    token.value = res.token
    username.value = name.trim()
    userId.value = getUserIdFromToken(res.token)

    return res.token
  }

  const logout = () => {
    token.value = null
    username.value = null
    userId.value = null
  }

  watch(
    token,
    value => {
      userId.value = getUserIdFromToken(value)
    },
    { immediate: true }
  )

  const isAuthenticated = computed(() => !!token.value)
  const hasUsername = computed(() => !!username.value)
  const hasUserId = computed(() => !!userId.value)

  return {
    token,
    username,
    id: userId,
    isAuthenticated,
    hasUsername,
    hasUserId,
    loginAsGuest,
    logout
  }
}