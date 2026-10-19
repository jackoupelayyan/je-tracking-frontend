import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getMyOrders, createOrder, addOrderUpdate, updateOrderStatus,
  type Order, type OrderStatus
} from '../api/client'
import {
  Package, Plus, RefreshCw, Copy, Check, ChevronDown, ChevronUp,
  LogOut, X, Send
} from 'lucide-react'
import Logo from '../components/Logo'

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_TRANSIT: 'bg-blue-100 text-blue-800',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

type Modal = 'create' | 'update' | null

export default function OrgDashboard() {
  const { orgName, logout } = useAuth()
  const navigate = useNavigate()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<Modal>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Create order form
  const [form, setForm] = useState({
    customerName: '', customerPhone: '', origin: '', destination: '', description: ''
  })
  const [creating, setCreating] = useState(false)
  const [newTracking, setNewTracking] = useState<string | null>(null)

  // Update form
  const [updateMsg, setUpdateMsg] = useState('')
  const [updateLoc, setUpdateLoc] = useState('')
  const [updateStatus, setUpdateStatusVal] = useState<OrderStatus>('IN_TRANSIT')
  const [submitting, setSubmitting] = useState(false)

  const loadOrders = async () => {
    setLoading(true)
    try {
      setOrders(await getMyOrders())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const order = await createOrder({
        customerName: form.customerName,
        customerPhone: form.customerPhone || undefined,
        origin: form.origin,
        destination: form.destination,
        description: form.description || undefined,
      })
      setNewTracking(order.trackingNumber)
      await loadOrders()
      setForm({ customerName: '', customerPhone: '', origin: '', destination: '', description: '' })
    } finally {
      setCreating(false)
    }
  }

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder || !updateMsg.trim()) return
    setSubmitting(true)
    try {
      await addOrderUpdate(selectedOrder.id, updateMsg, updateLoc || undefined)
      await updateOrderStatus(selectedOrder.id, updateStatus)
      await loadOrders()
      setUpdateMsg('')
      setUpdateLoc('')
      setModal(null)
    } finally {
      setSubmitting(false)
    }
  }

  const copyTracking = (tracking: string) => {
    navigator.clipboard.writeText(tracking)
    setCopiedId(tracking)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const copyLink = (tracking: string) => {
    const url = `${window.location.origin}/track/${tracking}`
    navigator.clipboard.writeText(url)
    setCopiedId(`link-${tracking}`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size="md" subtitle={orgName || 'Organization Portal'} />
          <div className="flex items-center gap-3">
            <button onClick={loadOrders} className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setModal('create'); setNewTracking(null) }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> New Order
            </button>
            <button onClick={() => { logout(); navigate('/login') }} className="p-2 text-slate-500 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Your Orders</h2>
          <span className="text-sm text-slate-500">{orders.length} orders</span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No orders yet. Create your first order!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-blue-600">{order.trackingNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 truncate">{order.customerName}</p>
                    <p className="text-xs text-slate-500 truncate">{order.origin} → {order.destination}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyTracking(order.trackingNumber)}
                      title="Copy tracking number"
                      className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      {copiedId === order.trackingNumber ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyLink(order.trackingNumber)}
                      title="Copy tracking link"
                      className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-xs font-medium"
                    >
                      {copiedId === `link-${order.trackingNumber}` ? <Check className="w-4 h-4 text-green-500" /> : <span>Copy Link</span>}
                    </button>
                    <button
                      onClick={() => { setSelectedOrder(order); setUpdateStatusVal(order.status); setModal('update') }}
                      className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Add update"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      {expandedId === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {expandedId === order.id && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50">
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      {order.customerPhone && (
                        <div><span className="text-slate-500">Phone: </span><span className="font-medium">{order.customerPhone}</span></div>
                      )}
                      {order.description && (
                        <div className="col-span-2"><span className="text-slate-500">Description: </span><span className="font-medium">{order.description}</span></div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Updates</p>
                    {order.updates.length === 0 ? (
                      <p className="text-xs text-slate-400">No updates posted yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {order.updates.map(u => (
                          <div key={u.id} className="flex gap-2 text-xs">
                            <span className="text-slate-400 flex-shrink-0">{new Date(u.createdAt).toLocaleString()}</span>
                            <span className="text-slate-700">{u.message}</span>
                            {u.location && <span className="text-slate-400 flex-shrink-0">· {u.location}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Order Modal */}
      {modal === 'create' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">New Order</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-slate-400 hover:text-slate-700" /></button>
            </div>
            {newTracking ? (
              <div className="p-6 text-center">
                <CheckIcon />
                <p className="text-lg font-bold text-slate-800 mb-1">Order Created!</p>
                <p className="text-sm text-slate-500 mb-4">Give this tracking number to your customer:</p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-4 mb-4">
                  <p className="font-mono text-2xl font-bold text-blue-700">{newTracking}</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => copyTracking(newTracking)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedId === newTracking ? 'Copied!' : 'Copy Number'}
                  </button>
                  <button
                    onClick={() => copyLink(newTracking)}
                    className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium"
                  >
                    {copiedId === `link-${newTracking}` ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
                <button onClick={() => { setModal(null); setNewTracking(null) }} className="mt-4 text-sm text-slate-400 hover:text-slate-600">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="p-5 space-y-4">
                {[
                  { label: 'Customer Name', key: 'customerName', required: true, placeholder: 'John Doe' },
                  { label: 'Customer Phone', key: 'customerPhone', required: false, placeholder: '+1 234 567 8900' },
                  { label: 'Origin', key: 'origin', required: true, placeholder: 'New York, NY' },
                  { label: 'Destination', key: 'destination', required: true, placeholder: 'Los Angeles, CA' },
                  { label: 'Description', key: 'description', required: false, placeholder: 'Electronics – Handle with care' },
                ].map(({ label, key, required, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{label}{required && ' *'}</label>
                    <input
                      type="text"
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      required={required}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Creating…' : 'Create Order & Generate Tracking'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Update Modal */}
      {modal === 'update' && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800">Add Update</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedOrder.trackingNumber}</p>
              </div>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddUpdate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={updateStatus}
                  onChange={e => setUpdateStatusVal(e.target.value as OrderStatus)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(STATUS_LABELS).map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Update Message *</label>
                <textarea
                  value={updateMsg}
                  onChange={e => setUpdateMsg(e.target.value)}
                  rows={3}
                  required
                  placeholder="Package arrived at sorting facility…"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location (optional)</label>
                <input
                  type="text"
                  value={updateLoc}
                  onChange={e => setUpdateLoc(e.target.value)}
                  placeholder="Chicago, IL"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Posting…' : 'Post Update'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function CheckIcon() {
  return (
    <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
      <Check className="w-7 h-7 text-green-600" />
    </div>
  )
}
