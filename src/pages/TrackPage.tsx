import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { trackOrder, type Order, type OrderStatus } from '../api/client'
import { Package, MapPin, Clock, CheckCircle, XCircle, Truck, AlertCircle } from 'lucide-react'
import Logo from '../components/Logo'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: {
    label: 'Order Received',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    icon: <Clock className="w-5 h-5" />,
  },
  IN_TRANSIT: {
    label: 'In Transit',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    icon: <Truck className="w-5 h-5" />,
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    icon: <Package className="w-5 h-5" />,
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'text-green-600 bg-green-50 border-green-200',
    icon: <CheckCircle className="w-5 h-5" />,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-red-600 bg-red-50 border-red-200',
    icon: <XCircle className="w-5 h-5" />,
  },
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

export default function TrackPage() {
  const { trackingNumber } = useParams<{ trackingNumber?: string }>()
  const [inputTracking, setInputTracking] = useState(trackingNumber || '')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputTracking.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const data = await trackOrder(inputTracking.trim().toUpperCase())
      setOrder(data)
    } catch {
      setError('No order found with that tracking number. Please check and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-search if tracking number in URL
  React.useEffect(() => {
    if (trackingNumber) {
      trackOrder(trackingNumber.toUpperCase())
        .then(setOrder)
        .catch(() => setError('Order not found.'))
    }
  }, [trackingNumber])

  const statusCfg = order ? STATUS_CONFIG[order.status] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size="md" subtitle="Real-Time Order Tracking" />
          <a
            href="/login"
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors"
          >
            Staff Portal →
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Search Box */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Enter your tracking number
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={inputTracking}
              onChange={(e) => setInputTracking(e.target.value)}
              placeholder="e.g. TRK-A1B2C3"
              className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              style={{ letterSpacing: '0.05em' }}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Searching…' : 'Track'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Order Card */}
        {order && statusCfg && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`flex items-center gap-3 border rounded-2xl p-5 ${statusCfg.color}`}>
              {statusCfg.icon}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider opacity-70">Current Status</p>
                <p className="text-lg font-bold">{statusCfg.label}</p>
              </div>
              <span className="ml-auto font-mono text-sm font-semibold">{order.trackingNumber}</span>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">Shipment Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Customer</p>
                  <p className="font-medium text-slate-800">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Carrier</p>
                  <p className="font-medium text-slate-800">{order.organizationName}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Origin</p>
                  <p className="font-medium text-slate-800">{order.origin}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Destination</p>
                  <p className="font-medium text-slate-800">{order.destination}</p>
                </div>
                {order.description && (
                  <div className="col-span-2">
                    <p className="text-slate-500 mb-1">Description</p>
                    <p className="font-medium text-slate-800">{order.description}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-slate-500 mb-1">Order Date</p>
                  <p className="font-medium text-slate-800">{formatDate(order.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-5">Tracking Timeline</h2>
              {order.updates.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No updates yet. Check back soon!</p>
              ) : (
                <ol className="relative border-l border-slate-200 ml-2 space-y-6">
                  {[...order.updates].reverse().map((upd) => (
                    <li key={upd.id} className="ml-6">
                      <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full ring-4 ring-white">
                        <span className="w-2 h-2 bg-blue-600 rounded-full" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{upd.message}</p>
                        {upd.location && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            {upd.location}
                          </div>
                        )}
                        <p className="text-xs text-slate-400 mt-1">{formatDate(upd.createdAt)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
