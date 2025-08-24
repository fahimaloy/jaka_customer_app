import { useMainStore } from '../store/mainStore'
import http from './http'

interface Credentials {
  email: string
  password: string
}

export async function getBaseURL({ email, password }: Credentials): Promise<string> {
  const { data } = await http.post('https://app.jakac.com/api/domains', {
    email,
    password,
  })
  return (
    data?.baseURL || data?.base_url || data?.url || data?.domain || ''
  )
}

export async function login({ email, password }: Credentials): Promise<{
  token: string
  locations: unknown
  settings: unknown
}> {
  const baseURL = await getBaseURL({ email, password })
  const { data } = await http.post(`${baseURL}/store-login`, {
    email,
    password,
  })

  const { token, locations, settings } = data
  const store = useMainStore()
  store.token = token
  store.locations = locations
  store.settings = settings

  return { token, locations, settings }
}

