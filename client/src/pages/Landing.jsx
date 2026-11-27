import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EduLinkLogoWhite } from '../components/EduLinkLogo'
import EduLinkLogo from '../components/EduLinkLogo'
import {
  Users, GraduationCap, DollarSign, BarChart3, CalendarCheck,
  FileText, Award, MessageSquare, Shield, BookOpen, ChevronDown,
  CheckCircle, ArrowRight, Bus, ClipboardList, Upload, Settings,
  Twitter, Linkedin, Facebook, Mail, Phone, MapPin,
  Star, TrendingUp, Clock, Zap, Globe, Lock,
} from 'lucide-react'

/* ── FEATURES ──────────────────────────────────────────────────────────── */
const FEATURES = [
  { Icon: Users,         color: 'bg-brand-100 text-brand-600',   title: 'Student Management',          desc: 'Enroll, track, and manage every learner from admission to graduation with full CBC profile support.' },
  { Icon: Award,         color: 'bg-brand-100 text-brand-600', title: 'Assessments & Report Cards',  desc: 'EE/ME/AE/BE strand scoring, competency levels, and auto-generated CBC report cards with PDF export.' },
  { Icon: BarChart3,     color: 'bg-brand-100 text-brand-600', title: 'Gradebooks & Report Cards',   desc: 'Visualize performance across strands, terms, and classes. Spot at-risk learners before they fall behind.' },
  { Icon: DollarSign,    color: 'bg-emerald-100 text-emerald-600', title: 'Fee Management & Invoicing', desc: 'Set fee structures per grade and term. M-Pesa STK Push and Paybill. Auto invoices and defaulter alerts.' },
  { Icon: CalendarCheck, color: 'bg-amber-100  text-amber-600',  title: 'Timetable & Room Scheduling', desc: 'Build conflict-free weekly timetables. Assign teachers, subjects, and rooms across all classes.' },
  { Icon: MessageSquare, color: 'bg-rose-100   text-rose-600',   title: 'Parent-Teacher Communication', desc: 'Secure in-app messaging, absence SMS alerts, and a dedicated parent portal for real-time visibility.' },
]

/* ── STEPS ─────────────────────────────────────────────────────────────── */
const STEPS = [
  { n: 1, title: 'Import Or Quick Setup',       desc: 'Upload students, teachers, and classes via Excel or fill in our guided setup wizard. Your school is live in minutes, not days.' },
  { n: 2, title: 'Super-Exciting New Dashboard', desc: 'The EduLink dashboard puts every metric: attendance, fees, and assessments on a single screen updated in real time.' },
  { n: 3, title: 'Get Your Best Reports',        desc: 'Generate CBC report cards, NEMIS exports, fee statements, and attendance summaries with a single click.' },
]

/* ── ROLES ─────────────────────────────────────────────────────────────── */
const ROLES = {
  Admin: {
    headline: 'Admin: whole campus command center',
    desc: 'Full visibility and control across every department: students, staff, curriculum, fees, analytics, and settings.',
    stats: [{ label: 'Total Students', val: '247' }, { label: 'Fee Collection', val: '94%' }],
    features: ['Manage students, teachers, classes, and parents', 'Set fee structures and generate M-Pesa invoices', 'Generate NEMIS exports for the Ministry', 'School-wide analytics and audit logs', 'Timetable builder and academic calendar'],
  },
  Teacher: {
    headline: 'Teacher: everything to teach and report',
    desc: 'Record CBC assessments, manage assignments, track competencies, and communicate with parents. All in one workflow.',
    stats: [{ label: 'My Classes', val: '4' }, { label: 'Pending Reports', val: '12' }],
    features: ['Mark attendance per class or student', 'Record EE/ME/AE/BE strand scores', 'Create and grade assignments with feedback', 'Generate learner profiles per term', 'Submit TPAD performance appraisals'],
  },
  Student: {
    headline: 'Student: always in the loop',
    desc: 'View your assignments, competency progress, attendance record, and CBC report cards from any device.',
    stats: [{ label: 'Assignments Due', val: '3' }, { label: 'Attendance', val: '96%' }],
    features: ['Submit assignments via text or file upload', 'View EE/ME/AE/BE competency levels', 'Download personal CBC report cards', 'Track your attendance record by term', 'View class timetable'],
  },
  Parent: {
    headline: 'Parent: your child, your dashboard',
    desc: 'A dedicated portal to pay fees, track attendance, monitor grades, and message teachers directly.',
    stats: [{ label: 'Fee Balance', val: 'KES 0' }, { label: 'Attendance', val: '98%' }],
    features: ['Pay school fees via M-Pesa from your phone', 'View real-time attendance and CBC grades', 'Download report cards as PDF', 'Send messages to class teachers', 'Track assignment submission status'],
  },
}

/* ── TESTIMONIALS ──────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  { name: 'Mrs. Grace Wanjiku', role: 'Head Teacher, Westlands Primary', quote: 'EduLink transformed how we handle CBC assessments. Report cards that used to take 3 days now generate in minutes. Our teachers finally have time to teach.' },
  { name: 'Mr. David Omondi',   role: 'Director, Kisumu Academy',        quote: 'The M-Pesa integration alone was worth it. Parents pay instantly, our accounts team has zero manual reconciliation, and defaulter reports run themselves.' },
  { name: 'Mrs. Faith Kamau',   role: 'Parent, Kiambu Junior School',    quote: 'I can see my daughter\'s attendance, grades, and assignments from my phone any time. When she was absent I got an SMS within minutes. That\'s real care.' },
]

/* ── PRICING ───────────────────────────────────────────────────────────── */
const PRICING = [
  {
    name: 'EduKit',
    price: '$1.50',
    period: '/student/month',
    desc: 'Perfect for smaller schools getting started with CBC management.',
    features: ['Up to 200 students', 'CBC assessment & report cards', 'Attendance tracking', 'Parent portal', 'M-Pesa payments', 'Email support'],
    cta: 'Get started',
    highlight: false,
  },
  {
    name: 'Enterprise',
    price: '$2.80',
    period: '/student/month',
    desc: 'For growing schools that need the full platform and priority support.',
    features: ['Unlimited students', 'Everything in EduKit', 'NEMIS export', 'TPAD submissions', 'Timetable builder', 'SMS/WhatsApp alerts', 'Transport management', 'Library & exam management', 'Priority support'],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Custom',
    price: 'Custom',
    period: 'pricing',
    desc: 'Multi-school networks, county governments, and large institutions.',
    features: ['Multiple school campuses', 'Custom branding & domain', 'Dedicated account manager', 'On-site training', 'API access', 'SLA guarantee'],
    cta: 'Contact sales',
    highlight: false,
  },
]

/* ── FAQ ───────────────────────────────────────────────────────────────── */
const FAQ = [
  { q: 'How long does it take to set up EduLink for my school?',       a: 'Most schools are live within one day. Import your existing data via Excel or fill in the guided setup. No technical skills required.' },
  { q: "Is EduLink aligned with Kenya's CBC curriculum?", a: 'Yes, built from the ground up for CBC. All learning areas, strands, sub-strands, and EE/ME/AE/BE rubrics are pre-loaded.' },
  { q: 'Can parents pay fees directly through EduLink?',                a: 'Yes. Parents pay via M-Pesa STK Push (prompt sent to their phone) or Paybill. Payments reconcile automatically with the invoicing module.' },
  { q: 'Does EduLink integrate with the NEMIS portal?',                 a: 'EduLink generates student and teacher UPI exports in the exact CSV format required by the Ministry of Education NEMIS portal.' },
  { q: 'Is EduLink Cloud delivering quality school management software?', a: 'EduLink is actively developed and deployed in Kenyan schools. We release improvements continuously based on direct school feedback.' },
]

/* ── FOOTER LINKS ──────────────────────────────────────────────────────── */
const FOOTER = {
  Product:  ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  Company:  ['About', 'Blog', 'Careers', 'Press'],
  Support:  ['Help Center', 'Contact', 'Status', 'Privacy'],
  Legal:    ['Terms', 'Privacy Policy', 'Cookie Policy', 'GDPR'],
}

/* ══════════════════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function Landing() {
  const [activeRole, setActiveRole]   = useState('Admin')
  const [openFaq, setOpenFaq]         = useState(null)
  const role = ROLES[activeRole]

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ══ NAV ══════════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <EduLinkLogo size={32} />

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            {['Features', 'How it works', 'Pricing', 'Resources', 'Contact Us'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
                className="hover:text-brand-600 transition-colors">{l}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
              Sign in
            </Link>
            <Link to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all">
              Request Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fafbff 50%, #f5f0ff 100%)' }}>
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle, #c7d2fe 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left : text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 border border-brand-200 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                <span className="text-brand-700 text-xs font-semibold">Kenya's #1 CBC School Platform</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
                Run your entire<br />
                school from a<br />
                <span className="text-brand-600">simple dashboard</span>
              </h1>

              <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-lg">
                Connect teachers, students, parents, and administrators in one platform built from the ground up for Kenya's CBC curriculum : with M-Pesa fees, NEMIS exports, and real-time analytics.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link to="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-all shadow-lg shadow-brand-200">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 transition-all">
                  See How It Works
                </a>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500">
                {['No credit card required', 'CBC Curriculum aligned', 'M-Pesa integrated', 'NEMIS compatible'].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-brand-500 shrink-0" />{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right : dashboard mockup */}
            <div className="relative">
              <div className="absolute -inset-4 bg-brand-500/10 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
                {/* Browser bar */}
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 mx-3 bg-white rounded border border-slate-200 h-5 flex items-center px-2">
                    <span className="text-slate-400 text-[10px]">app.edulink.ke/dashboard</span>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="flex" style={{ minHeight: 320 }}>
                  {/* Mini sidebar */}
                  <div className="w-12 bg-[#0f172a] flex flex-col items-center py-3 gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center mb-1">
                      <span className="text-white font-bold text-[9px]">E</span>
                    </div>
                    {[BarChart3, Users, GraduationCap, CalendarCheck, DollarSign, Award, MessageSquare, Settings].map((Icon, i) => (
                      <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-brand-600' : ''}`}>
                        <Icon className={`w-3.5 h-3.5 ${i === 0 ? 'text-white' : 'text-slate-600'}`} />
                      </div>
                    ))}
                  </div>

                  {/* Main area */}
                  <div className="flex-1 p-4 bg-slate-50 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-4 w-28 bg-slate-800 rounded font-bold text-xs flex items-center pl-1 text-slate-800" style={{ background: 'transparent' }}>
                          <span className="text-xs font-bold text-slate-800">Dashboard</span>
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Term 2 · 2026</div>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="h-6 w-16 bg-brand-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-[9px] font-semibold">+ Add Student</span>
                        </div>
                      </div>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Students', val: '247', color: 'bg-brand-50 border-brand-100', text: 'text-brand-700' },
                        { label: 'Attendance', val: '94%', color: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700' },
                        { label: 'Fee Collected', val: '89%', color: 'bg-brand-50 border-brand-100', text: 'text-brand-700' },
                      ].map(({ label, val, color, text }) => (
                        <div key={label} className={`${color} border rounded-xl p-2.5`}>
                          <div className="text-[9px] text-slate-500">{label}</div>
                          <div className={`text-sm font-bold ${text}`}>{val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Chart area */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3">
                      <div className="text-[9px] font-semibold text-slate-600 mb-2">CBC Assessment Overview : Grade 4</div>
                      <div className="flex items-end gap-0.5" style={{ height: 60 }}>
                        {[55,70,45,85,60,90,50,75,65,80,95,72].map((h, i) => (
                          <div key={i} className="flex-1 rounded-t"
                            style={{ height: `${h}%`, background: i === 10 ? '#2563eb' : i % 3 === 0 ? '#bfdbfe' : '#dbeafe' }} />
                        ))}
                      </div>
                      <div className="flex justify-between mt-1">
                        {['EE','ME','AE','BE'].map(s => (
                          <span key={s} className="text-[8px] text-slate-400">{s}</span>
                        ))}
                      </div>
                    </div>

                    {/* Recent row */}
                    <div className="bg-white rounded-xl border border-slate-200 p-2.5">
                      <div className="text-[9px] font-semibold text-slate-600 mb-1.5">Recent Payments</div>
                      {[
                        { name: 'Amina Wanjiru', amt: 'KES 12,500', status: 'Paid' },
                        { name: 'Brian Ochieng', amt: 'KES 8,200', status: 'Partial' },
                      ].map(({ name, amt, status }) => (
                        <div key={name} className="flex items-center justify-between py-1 border-t border-slate-50 first:border-0">
                          <span className="text-[9px] text-slate-700">{name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-semibold text-slate-800">{amt}</span>
                            <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-semibold ${status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURE ICON STRIP ═══════════════════════════════════════════ */}
      <section className="bg-white border-y border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              { Icon: Award,         label: 'CBC Assessments' },
              { Icon: DollarSign,    label: 'M-Pesa Payments' },
              { Icon: FileText,      label: 'Report Cards' },
              { Icon: Globe,         label: 'NEMIS Export' },
              { Icon: CalendarCheck, label: 'Attendance' },
              { Icon: BarChart3,     label: 'Analytics' },
              { Icon: Bus,           label: 'Transport' },
              { Icon: BookOpen,      label: 'Library' },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <Icon className="w-4 h-4 text-brand-500" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ═════════════════════════════════════════════════════ */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Built for the complex demands of<br className="hidden sm:block" />modern education
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Every module is designed around how Kenyan schools actually operate : not generic templates bolted together.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ Icon, color, title, desc }) => (
              <div key={title}
                className="group p-6 rounded-2xl border border-slate-100 bg-white hover:border-brand-200 hover:shadow-lg transition-all duration-200 cursor-default">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2 text-sm">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                <div className="mt-4 text-xs font-semibold text-brand-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Migrate and go live in three simple steps
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              We prepared some steps to help onboard and get your school on EduLink Cloud in a day, without technical help.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200" />
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="relative bg-white rounded-2xl border border-slate-200 p-6 shadow-soft">
                <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-extrabold text-xl mb-5 shadow-lg shadow-brand-200">
                  {n}
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ROLES ════════════════════════════════════════════════════════ */}
      <section id="roles" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Built specifically for every stakeholder
            </h2>
            <p className="text-slate-500">For every campus leader and learner : not a one-size-fits-all solution.</p>
          </div>

          {/* Role tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-1">
              {Object.keys(ROLES).map(r => (
                <button key={r} onClick={() => setActiveRole(r)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeRole === r ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-800'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Role content */}
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left : text */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">{role.headline}</h3>
              <p className="text-slate-500 mb-6 leading-relaxed">{role.desc}</p>

              {/* Mini stat chips */}
              <div className="flex gap-3 mb-6">
                {role.stats.map(({ label, val }) => (
                  <div key={label} className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
                    <div className="text-xl font-extrabold text-brand-700">{val}</div>
                    <div className="text-xs text-slate-500">{label}</div>
                  </div>
                ))}
              </div>

              <ul className="space-y-3">
                {role.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-3 h-3 text-brand-600" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Link to="/login"
                className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all">
                Get started as {activeRole} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right : role UI mockup */}
            <div className="relative">
              <div className="absolute -inset-3 bg-brand-100/60 rounded-3xl blur-xl" />
              <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="bg-[#0f172a] text-white px-4 py-3 flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center text-xs font-bold">{activeRole[0]}</div>
                  <span className="text-sm font-semibold">{activeRole} Portal</span>
                  <span className="ml-auto text-xs text-slate-400">EduLink · Term 2 2026</span>
                </div>
                <div className="p-4 space-y-3 bg-slate-50" style={{ minHeight: 280 }}>
                  {/* Role-specific mini dashboard */}
                  <div className="grid grid-cols-2 gap-3">
                    {role.stats.map(({ label, val }) => (
                      <div key={label} className="bg-white rounded-xl border border-slate-100 p-3 shadow-soft">
                        <div className="text-xs text-slate-400">{label}</div>
                        <div className="text-lg font-extrabold text-brand-600">{val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-soft">
                    <div className="text-xs font-semibold text-slate-600 mb-2">{role.features[0]}</div>
                    <div className="space-y-1.5">
                      {['Grade 4 Mango', 'Grade 5 Cedar', 'Grade 6 Baobab'].map((cls, i) => (
                        <div key={cls} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                          <span className="text-xs text-slate-700">{cls}</span>
                          <div className="flex gap-1">
                            {['EE','ME','AE'].map((s, j) => (
                              <span key={s} className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${j === 0 ? 'bg-brand-100 text-brand-700' : j === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{s}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-soft">
                    <div className="text-xs font-semibold text-slate-600 mb-1.5">Recent Activity</div>
                    {[`${role.features[1]}`, `${role.features[2]}`].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 py-1 text-[10px] text-slate-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ════════════════════════════════════════════════════ */}
      <section className="py-14" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #1e3a8a 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { val: '500+',  label: 'Schools Onboarded' },
              { val: '250k+', label: 'Active Student Profiles' },
              { val: '99.9%', label: 'Uptime Guarantee' },
              { val: '24/7',  label: 'Technical Support' },
            ].map(({ val, label }) => (
              <div key={label}>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{val}</div>
                <div className="text-brand-300 text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ═════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Endorsed by campus leaders,<br />teachers & families
            </h2>
            <p className="text-slate-500">EduLink has received rave reviews from the Kenyan school community.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role: r, quote }) => (
              <div key={name} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-soft flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-5">"{quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{name}</p>
                    <p className="text-xs text-slate-400">{r}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Simple per-student tiers with no<br className="hidden sm:block" />hidden fees
            </h2>
            <p className="text-slate-500">Transparent pricing. Pay only for active students. Cancel any time.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map(({ name, price, period, desc, features, cta, highlight }) => (
              <div key={name}
                className={`rounded-2xl p-7 flex flex-col relative ${highlight
                  ? 'bg-brand-600 text-white shadow-2xl shadow-brand-300 scale-[1.02]'
                  : 'bg-white border border-slate-200 shadow-soft'}`}>
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
                    Most Popular
                  </div>
                )}
                <div className={`text-sm font-semibold mb-2 ${highlight ? 'text-brand-200' : 'text-brand-600'}`}>{name}</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-4xl font-extrabold ${highlight ? 'text-white' : 'text-slate-900'}`}>{price}</span>
                  {price !== 'Custom' && <span className={`text-sm pb-1 ${highlight ? 'text-brand-200' : 'text-slate-400'}`}>{period}</span>}
                </div>
                <p className={`text-sm mb-6 ${highlight ? 'text-brand-200' : 'text-slate-500'}`}>{desc}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${highlight ? 'text-white' : 'text-slate-700'}`}>
                      <CheckCircle className={`w-4 h-4 shrink-0 ${highlight ? 'text-brand-200' : 'text-brand-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login"
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm text-center transition-all block ${highlight
                    ? 'bg-white text-brand-700 hover:bg-brand-50'
                    : 'bg-brand-600 text-white hover:bg-brand-700'}`}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Everything you need to know about<br />EduLink Cloud
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ.map(({ q, a }, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-4">
                  <span className="font-semibold text-slate-800 text-sm">{q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/20 border border-brand-500/30 mb-6">
            <Zap className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-brand-300 text-xs font-semibold">CBC-aligned · M-Pesa ready · NEMIS compatible</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Ready to simplify school<br />management?
          </h2>
          <p className="text-slate-400 mb-8 text-lg">Join schools across Kenya running on EduLink today.</p>
          <Link to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base transition-all shadow-xl shadow-brand-900/40 hover:-translate-y-0.5">
            Schedule Free Demo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════ */}
      <footer className="bg-[#0a0f1e] border-t border-white/8 pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
            {/* Brand col */}
            <div className="col-span-2">
              <EduLinkLogoWhite size={30} />
              <p className="mt-3 text-slate-500 text-sm max-w-xs leading-relaxed">
                Kenya's CBC-aligned school management platform. Built for teachers, parents, and administrators who care about outcomes.
              </p>
              <div className="flex gap-3 mt-5">
                {[Twitter, Linkedin, Facebook].map((Icon, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center hover:bg-white/15 cursor-pointer transition-colors">
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Link cols */}
            {Object.entries(FOOTER).map(([heading, links]) => (
              <div key={heading}>
                <p className="text-white text-xs font-bold uppercase tracking-widest mb-4">{heading}</p>
                <ul className="space-y-2.5">
                  {links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-slate-500 text-sm hover:text-white transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact row */}
          <div className="flex flex-wrap gap-6 pb-8 border-b border-white/8 text-sm text-slate-500">
            <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-brand-500" />hello@edulink.ke</span>
            <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-500" />+254 700 000 000</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-500" />Nairobi, Kenya</span>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <span>© {new Date().getFullYear()} EduLink Cloud. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> SSL Secured</span>
              <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> CBC Curriculum aligned</span>
              <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> GDPR compliant</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
