import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { parentAPI, messageAPI } from '../api'
import {
  LayoutDashboard, Users, GraduationCap, School, CalendarCheck,
  ClipboardList, BarChart3, Award, FileText, Heart, DollarSign, MessageSquare, Settings,
  ChevronLeft, ChevronRight, LogOut, Menu, X, Bell, Upload, LineChart, Calendar,
  Bus, Shield, BookOpen, ClipboardCheck, FileSpreadsheet, UserCog,
} from 'lucide-react'

const NAV = [
  { path: '/',              label: 'Dashboard',    Icon: LayoutDashboard, roles: ['ADMIN','TEACHER','STUDENT','PARENT'] },
  { path: '/students',      label: 'Students',     Icon: Users,           roles: ['ADMIN'] },
  { path: '/teachers',      label: 'Teachers',     Icon: GraduationCap,   roles: ['ADMIN'] },
  { path: '/classes',       label: 'Classes',      Icon: School,          roles: ['ADMIN'] },
  { path: '/parents',       label: 'Parents',      Icon: Heart,           roles: ['ADMIN'] },
  { path: '/users',         label: 'Users',        Icon: UserCog,         roles: ['ADMIN'] },
  { path: '/import',        label: 'Import Data',  Icon: Upload,          roles: ['ADMIN'] },
  { path: '/attendance',    label: 'Attendance',   Icon: CalendarCheck,   roles: ['ADMIN','TEACHER','STUDENT'] },
  { path: '/assignments',   label: 'Assignments',  Icon: ClipboardList,   roles: ['ADMIN','TEACHER','STUDENT'] },
  { path: '/grades',        label: 'Grades',       Icon: BarChart3,       roles: ['ADMIN','TEACHER','STUDENT'] },
  { path: '/competencies',  label: 'Competencies', Icon: Award,           roles: ['ADMIN','TEACHER','STUDENT'] },
  { path: '/learner-profiles', label: 'Learner Profiles', Icon: Users,    roles: ['ADMIN','TEACHER','STUDENT'] },
  { path: '/report-cards',  label: 'Report Cards', Icon: FileText,        roles: ['ADMIN','TEACHER','STUDENT'] },
  { path: '/analytics',     label: 'Analytics',    Icon: LineChart,       roles: ['ADMIN','TEACHER'] },
  { path: '/timetable',     label: 'Timetable',    Icon: Calendar,        roles: ['ADMIN','TEACHER','STUDENT'] },
  { path: '/transport',     label: 'Transport',    Icon: Bus,             roles: ['ADMIN'] },
  { path: '/discipline',    label: 'Discipline',   Icon: Shield,          roles: ['ADMIN','TEACHER'] },
  { path: '/library',       label: 'Library',      Icon: BookOpen,        roles: ['ADMIN','TEACHER'] },
  { path: '/tpad',          label: 'TPAD',         Icon: ClipboardCheck,  roles: ['ADMIN','TEACHER'] },
  { path: '/exams',         label: 'KCSE Exams',   Icon: FileSpreadsheet, roles: ['ADMIN','TEACHER'] },
  { path: '/nemis',         label: 'NEMIS Export', Icon: FileSpreadsheet, roles: ['ADMIN'] },
  { path: '/academic',      label: 'Academic Year',Icon: Calendar,        roles: ['ADMIN'] },
  { path: '/messages',      label: 'Messages',     Icon: MessageSquare,   roles: ['ADMIN','TEACHER'] },
  { path: '/fees',          label: 'Fees',         Icon: DollarSign,      roles: ['ADMIN'] },
  { path: '/settings',      label: 'Settings',     Icon: Settings,        roles: ['ADMIN'] },
  { path: '/parent-portal', label: 'Parent Portal',Icon: Heart,           roles: ['PARENT'] },
]

const ROLE_COLORS = {
  ADMIN:   'bg-brand-500/20 text-brand-300',
  TEACHER: 'bg-emerald-500/20 text-emerald-300',
  STUDENT: 'bg-amber-500/20 text-amber-300',
  PARENT:  'bg-rose-500/20 text-rose-300',
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  let items = NAV.filter(n => n.roles.includes(user?.role))
  // For parents, inject a Fees quick link right after Parent Portal
  if (user?.role === 'PARENT') {
    const idx = items.findIndex(i => i.path === '/parent-portal')
    if (idx !== -1) {
      const feesItem = { path: '/parent-portal?tab=Fees', label: 'Fees', Icon: DollarSign }
      items = [...items.slice(0, idx + 1), feesItem, ...items.slice(idx + 1)]
    }
  }
  const isActive = (path) => {
    // If the nav item includes a query (e.g. '/parent-portal?tab=Fees'),
    // require both pathname and search to match exactly so the specific
    // Fees link becomes active only when '?tab=Fees' is present.
    const [p, q] = String(path).split('?')
    if (q) {
      return location.pathname === p && location.search === `?${q}`
    }
    // For plain paths (no query) mark active only when there is no search
    // so '/parent-portal' is not highlighted when '/parent-portal?tab=Fees' is open.
    return location.pathname === path && (!location.search || location.search === '')
  }

  const handleLogout = () => { logout(); navigate('/login') }

  // Fetch unread message count for PARENT and TEACHER/ADMIN roles
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (user?.role === 'PARENT') {
          const { data } = await parentAPI.getMe()
          const parentId = data.data?.id
          if (!parentId) return
          const { data: msgData } = await parentAPI.getMessages(parentId)
          const msgs = msgData.data ?? []
          setUnreadCount(msgs.filter(m => !m.isRead && m.recipientId === user.id).length)
        } else if (user?.role === 'TEACHER' || user?.role === 'ADMIN') {
          const { data } = await messageAPI.getInbox()
          const msgs = data.data ?? []
          setUnreadCount(msgs.filter(m => !m.isRead).length)
        }
      } catch (e) {
        // ignore unread counter failures silently
      }
    }
    if (user?.role) {
      fetchUnread()
      const interval = setInterval(fetchUnread, 60000)
      return () => clearInterval(interval)
    }
  }, [user])

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed && !mobile ? 'justify-center px-2' : ''}`}>
        <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight">SchoolHub</p>
            <p className="text-slate-400 text-xs">CBC Management</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {items.map(({ path, label, Icon }) => {
          const active = isActive(path)
          return (
            <Link
              key={path}
              to={path}
              onClick={() => mobile && setMobileOpen(false)}
              title={collapsed && !mobile ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${active
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/30'
                  : 'text-slate-400 hover:bg-white/8 hover:text-white'
                }
                ${collapsed && !mobile ? 'justify-center px-2' : ''}
              `}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              {(!collapsed || mobile) && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/10 p-3 space-y-1">
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">
                {user?.fullName?.[0] ?? user?.email?.[0] ?? '?'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate">{user?.fullName ?? user?.email}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${ROLE_COLORS[user?.role] ?? 'bg-white/10 text-slate-300'}`}>
                {user?.role}
              </span>
            </div>
            {/* Notification bell for PARENT → parent portal, TEACHER/ADMIN → messages */}
            {(user?.role === 'PARENT' || user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
              <Link
                to={user?.role === 'PARENT' ? '/parent-portal' : '/messages'}
                onClick={() => mobile && setMobileOpen(false)}
                className="relative shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Messages"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        )}
        {/* Fees link for parents is injected into the main nav below */}
        {/* Collapsed bell */}
        {(collapsed && !mobile) && (user?.role === 'PARENT' || user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
          <Link
            to={user?.role === 'PARENT' ? '/parent-portal' : '/messages'}
            className="relative w-full flex items-center justify-center px-2 py-2.5 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-all"
            title="Messages"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/15 hover:text-red-400 transition-all
            ${collapsed && !mobile ? 'justify-center px-2' : ''}
          `}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(!collapsed || mobile) && <span>Sign out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-sidebar border-r border-white/8 transition-all duration-300 shrink-0
          ${collapsed ? 'w-16' : 'w-60'}
        `}
        style={{ minHeight: '100vh' }}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-20 -right-3 w-6 h-6 bg-sidebar border border-white/20 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10 hidden md:flex"
          style={{ position: 'fixed', left: collapsed ? '52px' : '228px' }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-sidebar border-b border-white/10 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="text-white font-bold text-sm">SchoolHub</span>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === 'PARENT' && (
            <Link to="/parent-portal" className="relative p-1.5 text-slate-400 hover:text-white">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white p-1">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 bg-sidebar h-full shadow-2xl flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent mobile />
          </div>
        </div>
      )}
    </>
  )
}
