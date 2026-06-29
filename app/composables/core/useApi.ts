export const useApi = () => {
  const config = useRuntimeConfig()

  const token = useCookie<string | null>('token')

  const api = $fetch.create({
    baseURL: config.public.apiBase,

    onRequest({ options }) {
      if (token.value) {
        options.headers = {
          ...options.headers,
          authorization: `Bearer ${token.value}`
        } as any
      }
    }
  })

  return { api }
}