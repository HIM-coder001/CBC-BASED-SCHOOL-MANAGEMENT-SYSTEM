import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Alert, EmptyState, PageHeader, Badge } from '../components/ui'
import { messageAPI } from '../api'
import { useAuthStore } from '../store'
import { MessageSquare, Reply, X, Check } from 'lucide-react'

export default function Messages() {
  const { user } = useAuthStore()
  const [messages, setMessages]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [selected, setSelected]       = useState(null)   // currently open message
  const [replyText, setReplyText]     = useState('')
  const [replySubject, setReplySubject] = useState('')
  const [sending, setSending]         = useState(false)
  const [replySuccess, setReplySuccess] = useState(false)

  useEffect(() => { fetchInbox() }, [])

  const fetchInbox = async () => {
    try {
      setLoading(true)
      const { data } = await messageAPI.getInbox()
      setMessages(data.data ?? [])
    } catch { setError('Failed to load messages.') }
    finally { setLoading(false) }
  }

  const openMessage = async (msg) => {
    setSelected(msg)
    setReplyText('')
    setReplySubject(`Re: ${msg.subject}`)
    setReplySuccess(false)
    // Mark as read if not already
    if (!msg.isRead) {
      try {
        await messageAPI.markRead(msg.id)
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m))
      } catch (err) {
        setError(err.response?.data?.message ?? 'Failed to mark message as read.')
      }

    }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    setSending(true)
    try {
      await messageAPI.reply({
        recipientId: selected.sender.id,
        subject: replySubject,
        content: replyText,
      })
      setReplyText('')
      setReplySuccess(true)
      setTimeout(() => setReplySuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to send reply.')
    } finally { setSending(false) }
  }

  const unreadCount = messages.filter(m => !m.isRead).length

  const ROLE_COLOR = {
    PARENT:  'bg-rose-100 text-rose-700',
    STUDENT: 'bg-amber-100 text-amber-700',
    ADMIN:   'bg-brand-100 text-brand-700',
    TEACHER: 'bg-emerald-100 text-emerald-700',
  }

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Messages"
          subtitle={unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
        />

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Message list */}
          <div className="lg:col-span-2">
            <Card className="p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-200 bg-surface-50">
                <p className="text-sm font-semibold text-slate-700">Inbox ({messages.length})</p>
              </div>
              {loading ? (
                <div className="p-6 space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-3 bg-surface-200 rounded w-3/4" />
                      <div className="h-3 bg-surface-200 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="p-8">
                  <EmptyState icon={MessageSquare} title="No messages" description="Messages from parents will appear here." />
                </div>
              ) : (
                <div className="divide-y divide-surface-100">
                  {messages.map(m => (
                    <button key={m.id} onClick={() => openMessage(m)}
                      className={`w-full text-left px-4 py-3.5 hover:bg-surface-50 transition-colors
                        ${selected?.id === m.id ? 'bg-brand-50 border-l-2 border-brand-500' : ''}
                        ${!m.isRead ? 'bg-white' : 'bg-surface-50/50'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            {!m.isRead && <span className="w-2 h-2 bg-brand-500 rounded-full shrink-0" />}
                            <p className={`text-sm truncate ${!m.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'}`}>
                              {m.sender?.fullName ?? 'Unknown'}
                            </p>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${ROLE_COLOR[m.sender?.role] ?? 'bg-slate-100 text-slate-600'}`}>
                              {m.sender?.role}
                            </span>
                          </div>
                          <p className={`text-xs truncate ${!m.isRead ? 'text-slate-700' : 'text-slate-400'}`}>{m.subject}</p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{m.content?.slice(0, 60)}…</p>
                        </div>
                        <p className="text-xs text-slate-400 shrink-0 mt-0.5">
                          {new Date(m.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Message detail + reply */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="space-y-4">
                <Card>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h2 className="font-bold text-slate-900 text-base">{selected.subject}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[selected.sender?.role] ?? 'bg-slate-100 text-slate-600'}`}>
                          {selected.sender?.role}
                        </span>
                        <span className="text-xs text-slate-500">
                          From: <strong>{selected.sender?.fullName}</strong>
                        </span>
                        {selected.recipient && user?.role === 'ADMIN' && (
                          <span className="text-xs text-slate-500">
                            → To: <strong>{selected.recipient?.fullName}</strong>
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          · {new Date(selected.createdAt).toLocaleString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-surface-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selected.content}
                  </div>
                </Card>

                {/* Reply form */}
                <Card>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Reply className="w-4 h-4 text-brand-600" />
                    Reply to {selected.sender?.fullName}
                  </h3>

                  {replySuccess && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 mb-3">
                      <Check className="w-4 h-4 shrink-0" />
                      Reply sent successfully.
                    </div>
                  )}

                  <form onSubmit={handleReply} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Subject</label>
                      <input className="input-field" value={replySubject}
                        onChange={e => setReplySubject(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Message</label>
                      <textarea className="input-field resize-y min-h-[100px]" placeholder="Type your reply…"
                        value={replyText} onChange={e => setReplyText(e.target.value)} required />
                    </div>
                    <Button type="submit" disabled={sending}>
                      <Reply className="w-4 h-4" />
                      {sending ? 'Sending…' : 'Send Reply'}
                    </Button>
                  </form>
                </Card>
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center min-h-[300px]">
                <EmptyState icon={MessageSquare} title="Select a message"
                  description="Click a message on the left to read it and reply." />
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
