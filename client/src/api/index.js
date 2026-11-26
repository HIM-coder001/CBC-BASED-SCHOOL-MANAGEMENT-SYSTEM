import axios from 'axios'
import { useAuthStore } from '../store/index'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  adminResetPassword: (userId, password) => api.post('/auth/admin-reset-password', { userId, password }),
}

export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
}

export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getMe: () => api.get('/students/me'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
}

export const teacherAPI = {
  getAll: () => api.get('/teachers'),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
}

export const classAPI = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
}

export const attendanceAPI = {
  getStudentAttendance: (studentId, params) => api.get(`/attendance/student/${studentId}`, { params }),
  getClassAttendance: (classId, params) => api.get(`/attendance/class/${classId}`, { params }),
  getReport: (params) => api.get('/attendance/report', { params }),
  create: (data) => api.post('/attendance', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
}

export const assignmentAPI = {
  getAll: (params) => api.get('/assignments', { params }),
  getStudent: (studentId) => api.get(`/assignments/student/${studentId}`),
  getStats: (id) => api.get(`/assignments/${id}/stats`),
  create: (data) => api.post('/assignments', data),
  submit: (assignmentId, studentId, data) => api.put(`/assignments/${assignmentId}/submit/${studentId}`, data),
  submitFile: (assignmentId, studentId, formData) =>
    api.put(`/assignments/${assignmentId}/submit/${studentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  grade: (assignmentId, studentId, data) => api.put(`/assignments/${assignmentId}/grade/${studentId}`, data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
}

export const assessmentAPI = {
  getAll: (params) => api.get('/assessments', { params }),
  create: (data) => api.post('/assessments', data),
  bulkCreate: (data) => api.post('/assessments/bulk', data),
  update: (id, data) => api.put(`/assessments/${id}`, data),
  delete: (id) => api.delete(`/assessments/${id}`),
}

export const learningAreaAPI = { getAll: () => api.get('/learning-areas') }

export const competencyAPI = {
  getStudent: (studentId, params) => api.get(`/competencies/student/${studentId}`, { params }),
  getReport: (params) => api.get('/competencies/report', { params }),
  create: (data) => api.post('/competencies', data),
  update: (id, data) => api.put(`/competencies/${id}`, data),
  delete: (id) => api.delete(`/competencies/${id}`),
}

export const skillAssessmentAPI = {
  getByCompetency: (competencyId) => api.get(`/skill-assessments/competency/${competencyId}`),
  create: (data) => api.post('/skill-assessments', data),
  update: (id, data) => api.put(`/skill-assessments/${id}`, data),
  delete: (id) => api.delete(`/skill-assessments/${id}`),
}

export const learnerProfileAPI = {
  getAll: (params) => api.get('/learner-profiles', { params }),
  create: (data) => api.post('/learner-profiles', data),
  update: (id, data) => api.put(`/learner-profiles/${id}`, data),
  delete: (id) => api.delete(`/learner-profiles/${id}`),
}

export const parentAPI = {
  getAll: () => api.get('/parents'),
  getMe: () => api.get('/parents/me'),
  getDetails: (id) => api.get(`/parents/${id}`),
  getChildrenGrades: (parentId) => api.get(`/parents/${parentId}/grades`),
  getChildrenReportCards: (parentId) => api.get(`/parents/${parentId}/report-cards`),
  getChildrenAttendance: (parentId, params) => api.get(`/parents/${parentId}/attendance`, { params }),
  getChildrenAssignments: (parentId, params) => api.get(`/parents/${parentId}/assignments`, { params }),
  getMessages: (parentId) => api.get(`/parents/${parentId}/messages`),
  sendMessage: (parentId, data) => api.post(`/parents/${parentId}/messages`, data),
  markMessageRead: (messageId) => api.put(`/parents/messages/${messageId}/read`),
  create: (data) => api.post('/parents', data),
  update: (id, data) => api.put(`/parents/${id}`, data),
  delete: (id) => api.delete(`/parents/${id}`),
}

export const reportCardAPI = {
  getAll: () => api.get('/report-cards'),
  generate: (data) => api.post('/report-cards/generate', data),
}

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
}

export const messageAPI = {
  getInbox: () => api.get('/messages/inbox'),
  markRead: (id) => api.put(`/messages/${id}/read`),
  reply: (data) => api.post('/messages/reply', data),
}

export const feeAPI = {
  getStructures: () => api.get('/fees/structures'),
  createStructure: (data) => api.post('/fees/structures', data),
  deleteStructure: (id) => api.delete(`/fees/structures/${id}`),
  getOverview: (params) => api.get('/fees/overview', { params }),
  getPayments: (params) => api.get('/fees/payments', { params }),
  recordPayment: (data) => api.post('/fees/payments', data),
  getStatement: (studentId, params) => api.get(`/fees/statement/${studentId}`, { params }),
  initiateMpesa: (data) => api.post('/fees/mpesa/pay', data),
  getPaymentStatus: (checkoutRequestId) => api.get(`/fees/mpesa/status/${checkoutRequestId}`),
  generateInvoices: (data) => api.post('/fees/invoices/generate', data),
  getInvoices: (params) => api.get('/fees/invoices', { params }),
  getDefaulters: (params) => api.get('/fees/defaulters', { params }),
  receiptPDF: (paymentId) => api.get(`/fees/receipt/${paymentId}/pdf`, { responseType: 'blob' }),
}

export const exportAPI = {
  gradesJSON: (params) => api.get('/export/grades/json', { params, responseType: 'blob' }),
  gradesCSV: (params) => api.get('/export/grades/csv', { params, responseType: 'blob' }),
  gradesExcel: (params) => api.get('/export/grades/excel', { params, responseType: 'blob' }),
  reportCardPDF: (reportCardId) => api.get(`/export/report-card/${reportCardId}/pdf`, { responseType: 'blob' }),
  competencyReport: (params) => api.get('/export/competency-report/excel', { params, responseType: 'blob' }),
  reportCardsExcel: (params) => api.get('/export/report-cards/excel', { params, responseType: 'blob' }),
}

export const importAPI = {
  students: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/import/students', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  teachers: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/import/teachers', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getJobs: () => api.get('/import/jobs'),
}

export const analyticsAPI = {
  dashboard: (params) => api.get('/analytics/dashboard', { params }),
  classPerformance: (params) => api.get('/analytics/class-performance', { params }),
  audit: () => api.get('/analytics/audit'),
}

export const academicAPI = {
  getYears: () => api.get('/academic/years'),
  createYear: (data) => api.post('/academic/years', data),
  createTerm: (data) => api.post('/academic/terms', data),
  lockTerm: (id) => api.put(`/academic/terms/${id}/lock`),
}

export const timetableAPI = {
  getSubjects: () => api.get('/timetable/subjects'),
  createSubject: (data) => api.post('/timetable/subjects', data),
  get: (params) => api.get('/timetable', { params }),
  createSlot: (data) => api.post('/timetable', data),
  deleteSlot: (id) => api.delete(`/timetable/${id}`),
}

export const transportAPI = {
  getRoutes: () => api.get('/transport/routes'),
  createRoute: (data) => api.post('/transport/routes', data),
  getDrivers: () => api.get('/transport/drivers'),
  createDriver: (data) => api.post('/transport/drivers', data),
  getVehicles: () => api.get('/transport/vehicles'),
  createVehicle: (data) => api.post('/transport/vehicles', data),
  assignStudent: (data) => api.post('/transport/assign', data),
}

export const disciplineAPI = {
  getRecords: (params) => api.get('/discipline/records', { params }),
  createRecord: (data) => api.post('/discipline/records', data),
  deleteRecord: (id) => api.delete(`/discipline/records/${id}`),
  getEvents: () => api.get('/discipline/events'),
  createEvent: (data) => api.post('/discipline/events', data),
}

export const libraryAPI = {
  getBooks: () => api.get('/library/books'),
  createBook: (data) => api.post('/library/books', data),
  getLoans: () => api.get('/library/loans'),
  loan: (data) => api.post('/library/loans', data),
  returnBook: (id) => api.put(`/library/loans/${id}/return`),
}

export const tpadAPI = {
  getAll: (params) => api.get('/tpad', { params }),
  save: (data) => api.post('/tpad', data),
  review: (id, data) => api.put(`/tpad/${id}/review`, data),
}

export const examAPI = {
  getSessions: () => api.get('/exams/sessions'),
  createSession: (data) => api.post('/exams/sessions', data),
  recordResult: (data) => api.post('/exams/results', data),
  getAnalysis: (sessionId) => api.get(`/exams/sessions/${sessionId}/analysis`),
}

export const nemisAPI = {
  exportStudents: () => api.get('/nemis/export/students', { responseType: 'blob' }),
  exportTeachers: () => api.get('/nemis/export/teachers', { responseType: 'blob' }),
  updateUpi: (data) => api.put('/nemis/upi', data),
}

export const schoolAPI = {
  getAll: () => api.get('/schools'),
  create: (data) => api.post('/schools', data),
  getNotifications: () => api.get('/schools/notifications'),
}

export default api
