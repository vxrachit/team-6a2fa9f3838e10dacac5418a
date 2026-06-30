import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Search, Shield, UserCheck, UserX, ChevronDown, ChevronUp,
         Trash2, Edit3, X, Check, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const ROLES = ['all', 'student', 'mentor', 'admin']
const STATUS_OPTIONS = ['all', 'active', 'inactive']
const PHASES = ['all', 'bronze', 'silver', 'gold', 'platinum']

function UserRow({ user, onRoleChange, onStatusToggle, onDelete, currentPage }) {
  const [expanded, setExpanded] = useState(false)
  const [newRole, setNewRole] = useState(user.role)
  const [saving, setSaving] = useState(false)

  const roleColors = {
    admin: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
    mentor: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    student: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  }

  const handleRoleSave = async () => {
    if (newRole === user.role) return
    setSaving(true)
    try {
      await api.patch(`/users/${user._id}/role`, { role: newRole })
      await onRoleChange(user._id, newRole)
      toast.success(`Role updated to ${newRole}`)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to update role')
    } finally { setSaving(false) }
  }

  return (
    <>
      <tr className="border-b border-dark-500/30 hover:bg-dark-600/30 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-slate-600 truncate">{user.email}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`text-xs border px-2.5 py-1 rounded-full font-medium ${roleColors[user.role] || roleColors.student}`}>
            {user.role}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className="badge-category capitalize">{user.phase || 'bronze'}</span>
        </td>
        <td className="px-4 py-3 text-sm text-slate-400">{user.college || '—'}</td>
        <td className="px-4 py-3 text-xs text-slate-600">{new Date(user.createdAt).toLocaleDateString()}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span className="text-xs text-slate-500">{user.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <button onClick={() => setExpanded(e => !e)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-dark-600 transition-colors">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {user.isActive ? (
              <button onClick={() => onStatusToggle(user._id, false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors" title="Deactivate">
                <UserX size={14} />
              </button>
            ) : (
              <button onClick={() => onStatusToggle(user._id, true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Activate">
                <UserCheck size={14} />
              </button>
            )}
            <button onClick={() => onDelete(user._id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Delete user">
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={7} className="bg-dark-700/50 px-4 py-4">
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-dark-700 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Queries Raised</p>
                    <p className="text-lg font-bold text-white">{user.stats?.queriesRaised || 0}</p>
                  </div>
                  <div className="bg-dark-700 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Answers Given</p>
                    <p className="text-lg font-bold text-white">{user.stats?.answersGiven || 0}</p>
                  </div>
                  <div className="bg-dark-700 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Reputation</p>
                    <p className="text-lg font-bold text-white">{user.stats?.reputation || 0}</p>
                  </div>
                  <div className="bg-dark-700 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Last Seen</p>
                    <p className="text-sm font-medium text-slate-300">{user.lastSeen ? new Date(user.lastSeen).toLocaleString() : 'Never'}</p>
                  </div>
                </div>
                {/* Role change */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">Change Role:</span>
                  <div className="flex gap-2">
                    {['student', 'mentor', 'admin'].map(r => (
                      <button key={r} onClick={() => setNewRole(r)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all capitalize ${
                          newRole === r ? (r === 'admin' ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : r === 'mentor' ? 'bg-violet-500/20 border-violet-500/30 text-violet-400' : 'bg-blue-500/20 border-blue-500/30 text-blue-400') : 'border-dark-500 text-slate-500 bg-dark-700'
                        }`}>
                        {r}
                      </button>
                    ))}
                  </div>
                  {newRole !== user.role && (
                    <button onClick={handleRoleSave} disabled={saving}
                      className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1">
                      {saving ? 'Saving...' : <><Check size={12} /> Save</>}
                    </button>
                  )}
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  )
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('active')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const limit = 15

  useEffect(() => { fetchUsers() }, [roleFilter, statusFilter, page])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = { page, limit: String(limit) }
      if (roleFilter !== 'all') params.role = roleFilter
      if (statusFilter === 'active') params.isActive = 'true'
      else if (statusFilter === 'inactive') params.isActive = 'false'
      if (search) params.search = search
      const res = await api.get('/users/', { params })
      setUsers(res.data.users || res.data)
      const totalCount = res.data.total || (Array.isArray(res.data) ? res.data.length : 0)
      setTotal(totalCount)
      setTotalPages(Math.ceil(totalCount / limit) || 1)
    } catch (e) {
      toast.error('Failed to fetch users')
    }
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const handleRoleChange = (userId, newRole) => {
    setUsers(users => users.map(u => u._id === userId ? { ...u, role: newRole } : u))
  }

  const handleStatusToggle = async (userId, isActive) => {
    try {
      await api.patch(`/users/${userId}/status`, { isActive })
      setUsers(users => users.map(u => u._id === userId ? { ...u, isActive } : u))
      toast.success(`User ${isActive ? 'activated' : 'deactivated'}`)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to update status')
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure? This will deactivate the user account.')) return
    try {
      await api.delete(`/users/${userId}`)
      setUsers(users => users.filter(u => u._id !== userId))
      setDeleteConfirm(null)
      toast.success('User deleted (deactivated)')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to delete user')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">User Management</h1>
            <p className="text-sm text-slate-500">{total} users total</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="card-dark p-4">
        <form onSubmit={handleSearch} className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
              className="input-dark pl-9 text-sm" />
          </div>
          <button type="submit" className="btn-primary py-2 px-4 text-sm">Search</button>
        </form>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-slate-500" />
            <span className="text-xs text-slate-500">Role:</span>
            {ROLES.map(r => (
              <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all capitalize ${roleFilter === r ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' : 'border-dark-500 text-slate-500 bg-dark-700 hover:text-slate-300'}`}>
                {r}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            {STATUS_OPTIONS.map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all capitalize ${statusFilter === s ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' : 'border-dark-500 text-slate-500 bg-dark-700 hover:text-slate-300'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-500/50 bg-dark-700/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phase</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">College</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-dark-500/30">
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-6 bg-dark-700 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center text-slate-500">No users found</td></tr>
              ) : (
                users.map(user => (
                  <UserRow key={user._id} user={user}
                    onRoleChange={handleRoleChange}
                    onStatusToggle={handleStatusToggle}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-500/50">
            <p className="text-xs text-slate-500">Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-dark-600 disabled:opacity-30 transition-colors">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${page === p ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-dark-600'}`}>
                    {p}
                  </button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-dark-600 disabled:opacity-30 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}