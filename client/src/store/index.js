import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({
      user,
      token,
      isAuthenticated: true,
    })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  },

  loadUser: () => {
    try {
      const userStr = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (userStr && userStr !== 'undefined' && token && token !== 'undefined') {
        // Check token expiry
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            return
          }
        } catch {
          // If we can't decode the token, clear it
          localStorage.removeItem('user')
          localStorage.removeItem('token')
          return
        }
        const user = JSON.parse(userStr)
        set({ user, token, isAuthenticated: true })
      } else {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    } catch {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  },

  setUser: (user) => set({ user }),
}))

export const useStudentStore = create((set) => ({
  students: [],
  loading: false,
  setStudents: (students) => set({ students }),
  setLoading: (loading) => set({ loading }),
}))

export const useAttendanceStore = create((set) => ({
  attendance: [],
  loading: false,
  setAttendance: (attendance) => set({ attendance }),
  setLoading: (loading) => set({ loading }),
}))

export const useGradeStore = create((set) => ({
  grades: [],
  loading: false,
  setGrades: (grades) => set({ grades }),
  setLoading: (loading) => set({ loading }),
}))
