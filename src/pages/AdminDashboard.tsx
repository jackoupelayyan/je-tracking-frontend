import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getOrgs, createOrg, deleteOrg, getAllOrders,
  type Organization, type Order, type OrderStatus
} from '../api/client'
import {
  Plus, RefreshCw, Trash2, LogOut, Building2,
  X, AlertCircle, Search, ChevronDown, ChevronUp
} from 'lucide-react'
import Logo from '../components/Logo'

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_TRANSIT: 'bg-blue-100 text-blue-800',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

type Tab = 'orgs' | 'orders'

export default function AdminDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('orgs')

  const [orgs, setOrgs] = useState<Organization[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateOrg, setShowCreateOrg] = useState(false)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [orderSearch, setOrderSearch] = useState('')

  // Create org form
  const [orgForm, setOrgForm] = useState({ name: '', username: '', password: '' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [o, ord] = await Promise.all([getOrgs(), getAllOrders()])
      setOrgs(o)
      setOrders(ord)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')
    setCreating(true)
    try {
      await createOrg(orgForm)
      await loadData()
      setOrgForm({ name: '', username: '', password: '' })
      setShowCreateOrg(false)
    } catch {
      setCreateError('Username already taken or request failed.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteOrg(id)
    setDeleteConfirm(null)
    await loadData()
  }

  const filteredOrders = orders.filter(o =>
    o.trackingNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.organizationName.toLowerCase().includes(orderSearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size="md" theme="light" subtitle="Super Admin Panel" />
          <div className="flex items-center gap-3">
            <button onClick={loadData} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => { logout(); navigate('/login') }} className="flex items-center gap-2 text-slate-400 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-slate-800 text-sm">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="bg-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-5 grid grid-cols-2 gap-4">
          <div className="bg-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Total Organizations</p>
            <p className="text-3xl font-bold">{orgs.length}</p>
          </div>
          <div className="bg-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Total Orders</p>
            <p className="text-3xl font-bold">{orders.length}</p>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 mb-6 w-fit">
          {(['orgs', 'orders'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-800'}`}
            >
              {t === 'orgs' ? 'Organizations' : 'All Orders'}
            </button>
          ))}
        </div>

        {/* Organizations Tab */}
        {tab === 'orgs' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Organizations ({orgs.length})</h2>
              <button
                onClick={() => setShowCreateOrg(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Organization
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400">Loading…</div>
            ) : orgs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No organizations yet. Add one to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orgs.map(org => (
                  <div key={org.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800">{org.name}</p>
                      <p className="text-sm text-slate-500">@{org.username} · Joined {new Date(org.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      {orders.filter(o => o.organizationName === org.name).length} orders
                    </div>
                    {deleteConfirm === org.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-600">Delete?</span>
                        <button onClick={() => handleDelete(org.id)} className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg">Yes</button>
                        <button onClick={() => setDeleteConfirm(null)} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">No</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(org.id)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-4 gap-4">
              <h2 className="text-lg font-bold text-slate-800">All Orders ({filteredOrders.length})</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  placeholder="Search by tracking, customer, org…"
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-blue-600">{order.trackingNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{order.customerName} · <span className="text-slate-500">{order.organizationName}</span></p>
                      <p className="text-xs text-slate-400">{order.origin} → {order.destination}</p>
                    </div>
                    <button
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                      className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    >
                      {expandedOrderId === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  {expandedOrderId === order.id && (
                    <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-2 text-xs">
                      {order.updates.length === 0 ? (
                        <p className="text-slate-400">No updates posted.</p>
                      ) : order.updates.map(u => (
                        <div key={u.id} className="flex gap-2">
                          <span className="text-slate-400">{new Date(u.createdAt).toLocaleString()}</span>
                          <span className="text-slate-700">{u.message}</span>
                          {u.location && <span className="text-slate-400">· {u.location}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Org Modal */}
      {showCreateOrg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Add Organization</h3>
              <button onClick={() => setShowCreateOrg(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateOrg} className="p-5 space-y-4">
              {createError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                  <AlertCircle className="w-4 h-4" /> {createError}
                </div>
              )}
              {[
                { label: 'Organization Name', key: 'name', type: 'text', placeholder: 'Acme Logistics' },
                { label: 'Username', key: 'username', type: 'text', placeholder: 'acme_logistics' },
                { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label} *</label>
                  <input
                    type={type}
                    value={orgForm[key as keyof typeof orgForm]}
                    onChange={e => setOrgForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    required
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Create Organization'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
