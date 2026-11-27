import { Link } from 'react-router-dom'
import { EduLinkLogoWhite } from '../components/EduLinkLogo'
import EduLinkLogo from '../components/EduLinkLogo'
import {
  Users, GraduationCap, DollarSign, BarChart3, CalendarCheck,
  FileText, Award, MessageSquare, Bus, Shield, BookOpen,
  CheckCircle, ArrowRight, Zap, Globe, Lock, ChevronRight,
  ClipboardList, LineChart, Upload,
} from 'lucide-react'

/* ── Data ────────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    Icon: Award,
    color: 'bg-brand-100 text-brand-600',
    title: 'CBC Curriculum Engine',
    desc: 'Full strand, sub-strand, and competency tracking with EE/ME/AE/BE rubric scoring built for the Kenyan CBC framework.',
  },
  {
    Icon: DollarSign,
    color: 'bg-emerald-100 text-emerald-600',
    title: 'M-Pesa Fee Payments',
    desc: 'STK Push and Paybill integration. Parents pay directly from their phone. Invoices, receipts, and defaulter reports auto-generated.',
  },
  {
    Icon: FileText,
    color: 'bg-violet-100 text-violet-600',
    title: 'Smart Report Cards',
    desc: 'Auto-generate CBC report cards from assessment data. Learner profile summaries, remarks, and PDF export in one click.',
  },
  {
    Icon: Globe,
    color: 'bg-sky-100 text-sky-600',
    title: 'NEMIS Integration',
    desc: 'Export student and teacher UPI data in the exact format required by the Ministry of Education NEMIS portal.',
  },
  {
    Icon: CalendarCheck,
    color: 'bg-amber-100 text-amber-600',
    title: 'Attendance & Alerts',
    desc: 'Mark attendance per class or student. SMS/email absence alerts sent to parents automatically via Africa\'s Talking.',
  },
  {
    Icon: BarChart3,
    color: 'bg-rose-100 text-rose-600',
    title: 'Analytics Dashboard',
    desc: 'Class performance trends, fee collection rates, competency progress charts — all filterable by term, year, and grade.',
  },
  {
    Icon: MessageSquare,
    color: 'bg-teal-100 text-teal-600',
    title: 'Parent–Teacher Messaging',
    desc: 'Secure in-app messaging between parents and teachers. Parents track assignments, attendance, and grades from one portal.',
  },
  {
    Icon: ClipboardList,
    color: 'bg-orange-100 text-orange-600',
    title: 'Assignments & Grading',
    desc: 'Create assignments, auto-enroll class students, accept file or text submissions, and grade with feedback in one flow.',
  },
  {
    Icon: Shield,
    color: 'bg-indigo-100 text-indigo-600',
    title: 'Role-Based Access',
    desc: 'Admin, Teacher, Student, and Parent roles with granular permissions. Each user sees exactly what they need — nothing more.',
  },
]

const STEPS = [
  { n: '01', title: 'Set up your school', desc: 'Add your school details, create classes, and import existing student and teacher records via Excel in minutes.' },
  { n: '02', title: 'Configure CBC curriculum', desc: 'Learning areas, strands, and sub-strands are pre-loaded. Assign teachers to classes and you are ready to assess.' },
  { n: '03', title: 'Go live', desc: 'Teachers record attendance and assessments. Parents pay fees and track progress. Reports generate themselves.' },
]

const ROLES = [
  {
    role: 'Admin',
    color: 'brand',
    desc: 'Full control over the entire school — students, staff, curriculum, fees, and reporting.',
    perks: ['Manage all users and roles', 'Set fee structures and generate invoices', 'Generate NEMIS exports', 'View school-wide analytics'],
  },
  {
    role: 'Teacher',
    color: 'emerald',
    desc: 'Everything needed to teach effectively and report accurately on each learner.',
    perks: ['Mark attendance and record CBC assessments', 'Create and grade assignments', 'Generate learner profiles', 'Message parents directly'],
  },
  {
    role: 'Parent',
    color: 'violet',
    desc: 'A dedicated portal to stay informed and engaged in your child\'s education journey.',
    perks: ['View real-time attendance and grades', 'Pay school fees via M-Pesa', 'Download report cards as PDF', 'Send messages to teachers'],
  },
  {
    role: 'Student',
    color: 'amber',
    desc: 'Access to assignments, grades, attendance, and competency progress from any device.',
    perks: ['Submit assignments online', 'View CBC competency levels', 'Track attendance record', 'Download personal report cards'],
  },
]

const STATS = [
  { value: '25+', label: 'Modules' },
  { value: 'CBC', label: 'Curriculum aligned' },
  { value: 'M-Pesa', label: 'Payments integrated' },
  { value: 'NEMIS', label: 'Ministry compliant' },
]

const roleColor = {
  brand:   { bg: 'bg-brand-50',   border: 'border-brand-200',   badge: 'bg-brand-100 text-brand-700',   icon: 'text-brand-500' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', icon: 'text-emerald-500' },
  violet:  { bg: 'bg-violet-50',  border: 'border-violet-200',  badge: 'bg-violet-100 text-violet-700',  icon: 'text-violet-500' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   badge: 'bg-amber-100 text-amber-700',    icon: 'text-amber-500' },
}

/* ── Component ───────────────────────────────────────────────────────────── */

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-50 font-sans">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0f172a]/95 backdrop-blur-md border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <EduLinkLogoWhite size={34} />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#roles" className="hover:text-white transition-colors">Who it's for</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-all shadow-lg shadow-brand-900/40">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#0f172a]" />
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.35) 0%, transparent 70%)',
          }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/25 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-brand-300 text-xs font-semibold tracking-wide uppercase">Built for Kenya's CBC Curriculum</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight max-w-4xl mx-auto">
            The school management<br />
            platform Kenya's schools{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
                actually need
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-400 to-violet-400 rounded-full opacity-60" />
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            EduLink connects admins, teachers, parents, and students in one platform —
            with CBC assessment tools, M-Pesa fee payments, NEMIS exports, and real-time
            analytics built in from day one.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base transition-all shadow-xl shadow-brand-900/50 hover:-translate-y-0.5">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#features"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/8 hover:bg-white/12 text-white font-semibold text-base border border-white/15 transition-all">
              See all features
            </a>
          </div>

          {/* Trust chips */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            {['CBC Aligned', 'M-Pesa Ready', 'NEMIS Compatible', 'Role-Based Access', 'Secure & Encrypted'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-brand-500" />
                {t}
              </span>
            ))}
          </div>

          {/* Dashboard preview */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            {/* Glow behind the preview */}
            <div className="absolute -inset-4 bg-brand-600/20 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl border border-white/15 overflow-hidden shadow-2xl shadow-black/60">
              {/* Fake browser chrome */}
              <div className="bg-[#1e293b] flex items-center gap-2 px-4 py-3 border-b border-white/8">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
                </div>
                <div className="flex-1 mx-4 bg-white/8 rounded-lg h-6 flex items-center px-3">
                  <span className="text-slate-500 text-xs">app.edulink.ke/dashboard</span>
                </div>
              </div>
              {/* Dashboard mockup */}
              <div className="bg-[#0f172a] flex" style={{ minHeight: 340 }}>
                {/* Sidebar mock */}
                <div className="w-14 bg-[#0a0f1e] border-r border-white/8 flex flex-col items-center py-4 gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center mb-2">
                    <span className="text-white font-bold text-xs">E</span>
                  </div>
                  {[BarChart3, Users, GraduationCap, CalendarCheck, DollarSign, FileText, Award, MessageSquare].map((Icon, i) => (
                    <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-brand-600' : 'hover:bg-white/5'}`}>
                      <Icon className={`w-4 h-4 ${i === 0 ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                  ))}
                </div>
                {/* Main content mock */}
                <div className="flex-1 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-5 w-32 bg-white/10 rounded-lg" />
                      <div className="h-3 w-20 bg-white/5 rounded mt-1.5" />
                    </div>
                    <div className="h-8 w-24 bg-brand-600/60 rounded-xl" />
                  </div>
                  {/* Stat cards */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Students', val: '247', color: 'from-brand-600/40' },
                      { label: 'Attendance', val: '94%', color: 'from-emerald-600/40' },
                      { label: 'Fees Collected', val: 'KES 1.2M', color: 'from-violet-600/40' },
                      { label: 'Assessments', val: '1,840', color: 'from-amber-600/40' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className={`rounded-xl bg-gradient-to-br ${color} to-transparent border border-white/8 p-3`}>
                        <div className="text-slate-500 text-xs">{label}</div>
                        <div className="text-white font-bold text-lg mt-0.5">{val}</div>
                      </div>
                    ))}
                  </div>
                  {/* Chart placeholder */}
                  <div className="rounded-xl border border-white/8 bg-white/3 p-4 flex items-end gap-1" style={{ height: 120 }}>
                    {[40, 65, 50, 80, 55, 90, 70, 85, 60, 75, 95, 68].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm" style={{
                        height: `${h}%`,
                        background: i === 10 ? 'rgb(99 102 241)' : 'rgba(99,102,241,0.25)',
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative -mb-1">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full">
            <path d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 30 L1440 60 Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────────── */}
      <section className="bg-surface-50 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-extrabold bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
                  {value}
                </div>
                <div className="text-sm text-slate-500 mt-1 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-widest mb-4">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything your school needs
            </h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto text-base">
              Built specifically for Kenyan schools implementing the CBC curriculum — not a generic platform retrofitted.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ Icon, color, title, desc }) => (
              <div key={title}
                className="group bg-white rounded-2xl border border-surface-200 p-6 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-200">
                <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-surface-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-widest mb-4">
              Setup
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Up and running in a day
            </h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              No long implementation projects. No consultants. Import your data and go live.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%-1px)] right-[calc(16.67%-1px)] h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map(({ n, title, desc }) => (
                <div key={n} className="relative flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex flex-col items-center justify-center shadow-lg shadow-brand-900/30 mb-6 relative z-10">
                    <span className="text-brand-200 text-xs font-bold">{n}</span>
                    <span className="text-white font-extrabold text-xl leading-none">{n.slice(1)}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ROLES ───────────────────────────────────────────────────────── */}
      <section id="roles" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-widest mb-4">
              Who it's for
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              One platform, every stakeholder
            </h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              Each role gets a tailored experience — not the same interface with bits hidden.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROLES.map(({ role, color, desc, perks }) => {
              const c = roleColor[color]
              return (
                <div key={role} className={`rounded-2xl border ${c.border} ${c.bg} p-6 flex flex-col`}>
                  <span className={`self-start px-3 py-1 rounded-full text-xs font-bold ${c.badge} mb-4`}>
                    {role}
                  </span>
                  <p className="text-sm text-slate-600 mb-5 leading-relaxed flex-1">{desc}</p>
                  <ul className="space-y-2.5">
                    {perks.map(p => (
                      <li key={p} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${c.icon}`} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#0f172a]" />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(99,102,241,0.25) 0%, transparent 70%)' }}
        />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 shadow-xl shadow-brand-900/50 mb-8">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Ready to transform how your school operates?
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Join schools across Kenya already using EduLink to manage CBC assessments, fees, and communication — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base transition-all shadow-xl shadow-brand-900/50 hover:-translate-y-0.5">
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/8 hover:bg-white/12 text-white font-semibold text-base border border-white/15 transition-all">
              Sign in to dashboard <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-[#0a0f1e] border-t border-white/8 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <EduLinkLogoWhite size={30} />
              <p className="mt-3 text-slate-500 text-sm max-w-xs">
                Kenya's CBC-aligned school management platform. Built for teachers, parents, and administrators.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm text-slate-500">
              <div className="space-y-3">
                <p className="text-slate-300 font-semibold text-xs uppercase tracking-widest mb-1">Platform</p>
                <a href="#features" className="block hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="block hover:text-white transition-colors">How it works</a>
                <a href="#roles" className="block hover:text-white transition-colors">Roles</a>
              </div>
              <div className="space-y-3">
                <p className="text-slate-300 font-semibold text-xs uppercase tracking-widest mb-1">Account</p>
                <Link to="/login" className="block hover:text-white transition-colors">Sign in</Link>
                <Link to="/login" className="block hover:text-white transition-colors">Get started</Link>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <span>© {new Date().getFullYear()} EduLink. Built for Kenyan schools.</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Secure & encrypted</span>
              <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> CBC Curriculum aligned</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
