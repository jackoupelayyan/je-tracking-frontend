import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'

export interface OrderUpdate {
  id: string
  message: string
  location: string | null
  createdAt: string
}

export interface Order {
  id: string
  trackingNumber: string
  organizationName: string
  customerName: string
  customerPhone: string | null
  origin: string
  destination: string
  description: string | null
  status: OrderStatus
  createdAt: string
  updates: OrderUpdate[]
}

export interface Organization {
  id: string
  name: string
  username: string
  createdAt: string
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const login = async (username: string, password: string) => {
  const res = await api.post('/auth/login', { username, password })
  return res.data as { token: string; role: string; orgName: string | null }
}

// ── Public Track ──────────────────────────────────────────────────────────────

export const trackOrder = async (trackingNumber: string): Promise<Order> => {
  const res = await api.get(`/track/${trackingNumber}`)
  return res.data
}

// ── Org ───────────────────────────────────────────────────────────────────────

export const createOrder = async (data: {
  customerName: string
  customerPhone?: string
  origin: string
  destination: string
  description?: string
}): Promise<Order> => {
  const res = await api.post('/org/orders', data)
  return res.data
}

export const getMyOrders = async (): Promise<Order[]> => {
  const res = await api.get('/org/orders')
  return res.data
}

export const addOrderUpdate = async (
  orderId: string,
  message: string,
  location?: string
): Promise<OrderUpdate> => {
  const res = await api.post(`/org/orders/${orderId}/updates`, { message, location })
  return res.data
}

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<Order> => {
  const res = await api.patch(`/org/orders/${orderId}/status`, { status })
  return res.data
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export const createOrg = async (data: {
  name: string
  username: string
  password: string
}): Promise<Organization> => {
  const res = await api.post('/admin/orgs', data)
  return res.data
}

export const getOrgs = async (): Promise<Organization[]> => {
  const res = await api.get('/admin/orgs')
  return res.data
}

export const deleteOrg = async (id: string): Promise<void> => {
  await api.delete(`/admin/orgs/${id}`)
}

export const getAllOrders = async (): Promise<Order[]> => {
  const res = await api.get('/admin/orders')
  return res.data
}

export default api
