import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, PageHeader, Alert } from '../components/ui'
import { libraryAPI, studentAPI } from '../api'
import { BookOpen, Users, TrendingUp } from 'lucide-react'

export default function Library() {
  const [books, setBooks] = useState([])
  const [loans, setLoans] = useState([])
  const [students, setStudents] = useState([])
  const [bookForm, setBookForm] = useState({ title: '', author: '', isbn: '', copies: '1' })
  const [loanForm, setLoanForm] = useState({ bookId: '', studentId: '', dueDate: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      const [b, l, s] = await Promise.all([
        libraryAPI.getBooks(),
        libraryAPI.getLoans(),
        studentAPI.getAll()
      ])
      setBooks(b.data.data ?? [])
      setLoans(l.data.data ?? [])
      setStudents(s.data.data?.students ?? s.data.data ?? [])
      setError('')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load library data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleAddBook = async () => {
    if (!bookForm.title.trim()) {
      setError('Book title is required')
      return
    }
    try {
      setLoading(true)
      await libraryAPI.createBook(bookForm)
      setBookForm({ title: '', author: '', isbn: '', copies: '1' })
      setSuccess('Book added successfully')
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to add book')
    } finally {
      setLoading(false)
    }
  }

  const handleLoanBook = async () => {
    if (!loanForm.bookId || !loanForm.studentId || !loanForm.dueDate) {
      setError('All fields are required for loaning a book')
      return
    }
    try {
      setLoading(true)
      await libraryAPI.loan(loanForm)
      setLoanForm({ bookId: '', studentId: '', dueDate: '' })
      setSuccess('Book loaned successfully')
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to loan book')
    } finally {
      setLoading(false)
    }
  }

  const handleReturnBook = async (loanId) => {
    try {
      setLoading(true)
      await libraryAPI.returnBook(loanId)
      setSuccess('Book returned successfully')
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to return book')
    } finally {
      setLoading(false)
    }
  }

  const availableBooks = books.filter(b => b.available > 0)
  const totalBooks = books.reduce((sum, b) => sum + b.copies, 0)
  const totalLoaned = books.reduce((sum, b) => sum + (b.copies - b.available), 0)

  return (
    <Layout>
      <PageHeader title="Library Management" subtitle="Manage books and track loans" />

      {error && (
        <Alert type="error" onClose={() => setError('')} className="mb-6">
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess('')} className="mb-6">
          {success}
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Books</p>
              <p className="text-2xl font-bold text-gray-900">{totalBooks}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Currently Loaned</p>
              <p className="text-2xl font-bold text-gray-900">{totalLoaned}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Loans</p>
              <p className="text-2xl font-bold text-gray-900">{loans.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Add Book Form */}
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Add New Book
          </h3>
          <Input
            label="Title"
            placeholder="Enter book title"
            value={bookForm.title}
            onChange={e => setBookForm({ ...bookForm, title: e.target.value })}
            required
          />
          <Input
            label="Author"
            placeholder="Enter author name"
            value={bookForm.author}
            onChange={e => setBookForm({ ...bookForm, author: e.target.value })}
          />
          <Input
            label="ISBN (optional)"
            placeholder="Enter ISBN"
            value={bookForm.isbn}
            onChange={e => setBookForm({ ...bookForm, isbn: e.target.value })}
          />
          <Input
            label="Number of Copies"
            type="number"
            min="1"
            value={bookForm.copies}
            onChange={e => setBookForm({ ...bookForm, copies: e.target.value })}
          />
          <Button onClick={handleAddBook} disabled={loading}>
            {loading ? 'Adding...' : 'Add Book'}
          </Button>
        </Card>

        {/* Loan Book Form */}
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Loan Book
          </h3>
          <div>
            <label className="block text-sm font-medium mb-1">Book</label>
            <select
              className="w-full border rounded p-2"
              value={loanForm.bookId}
              onChange={e => setLoanForm({ ...loanForm, bookId: e.target.value })}
            >
              <option value="">Select a book</option>
              {availableBooks.map(b => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.available} available)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Student</label>
            <select
              className="w-full border rounded p-2"
              value={loanForm.studentId}
              onChange={e => setLoanForm({ ...loanForm, studentId: e.target.value })}
            >
              <option value="">Select a student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.admissionNo})
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Due Date"
            type="date"
            value={loanForm.dueDate}
            onChange={e => setLoanForm({ ...loanForm, dueDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
          />
          <Button onClick={handleLoanBook} disabled={loading || availableBooks.length === 0}>
            {loading ? 'Processing...' : 'Loan Book'}
          </Button>
        </Card>
      </div>

      {/* Books Inventory */}
      <Card className="p-4 mb-6">
        <h3 className="font-semibold text-lg mb-4">Books Inventory</h3>
        {books.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            No books in the library yet. Add some books to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ISBN</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {books.map(book => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{book.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{book.author || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{book.isbn || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{book.copies}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.available > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {book.available}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Active Loans */}
      <Card className="p-4">
        <h3 className="font-semibold text-lg mb-4">Active Loans</h3>
        {loans.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            No active loans at the moment.
          </p>
        ) : (
          <div className="space-y-2">
            {loans.map(loan => {
              const dueDate = new Date(loan.dueDate)
              const isOverdue = dueDate < new Date()
              return (
                <div
                  key={loan.id}
                  className={`flex justify-between items-center p-3 border rounded-lg ${
                    isOverdue ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">
                      {loan.book?.title || 'Unknown Book'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Borrowed by: <strong>{loan.student?.fullName || 'Unknown'}</strong>
                      {loan.student?.admissionNo && ` (${loan.student.admissionNo})`}
                    </p>
                    <p className={`text-xs mt-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      Due: {dueDate.toLocaleDateString()}
                      {isOverdue && ' (OVERDUE)'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleReturnBook(loan.id)}
                    disabled={loading}
                  >
                    Return
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </Layout>
  )
}
