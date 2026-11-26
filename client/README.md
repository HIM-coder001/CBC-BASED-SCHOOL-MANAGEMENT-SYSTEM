# CBC School Management System - Frontend

A modern React frontend for the CBC School Management System built with Vite, Tailwind CSS, and Zustand.

## Features

- 🎨 **Modern UI**: Clean, professional design with Tailwind CSS
- 📱 **Responsive**: Works seamlessly on desktop, tablet, and mobile
- 🔐 **Authentication**: JWT-based login with role-based access
- 📊 **Dashboard**: Role-specific dashboards for Admin, Teacher, Student, and Parent
- 👥 **Student Management**: Full CRUD operations for students
- 📅 **Attendance Tracking**: Record and view attendance
- 📝 **Assignments**: Create, submit, and grade assignments
- 📈 **Grades & Assessments**: View and manage student grades
- 🏆 **Competencies**: Track CBC competency-based learning
- 👨‍👩‍👧 **Parent Portal**: Parents can view children's progress
- 📤 **Export**: Download grades and reports as PDF, Excel, or CSV

## Tech Stack

- **Frontend Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` (optional):
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
client/
├── src/
│   ├── api/              # API client and endpoints
│   ├── components/       # Reusable React components
│   │   └── ui.jsx       # UI component library
│   ├── pages/           # Page components
│   ├── store/           # Zustand stores (state management)
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML entry point
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── package.json
```

## Available Routes

- `/login` - Login page
- `/` - Dashboard (role-based)
- `/students` - Student management
- `/teachers` - Teacher management
- `/classes` - Class management
- `/attendance` - Attendance tracking
- `/assignments` - Assignment management
- `/grades` - Grade viewing
- `/competencies` - Competency tracking
- `/parent-portal` - Parent portal

## Authentication

The app uses JWT tokens stored in localStorage. Authentication is handled via:
- `useAuthStore` - Zustand store for auth state
- `ProtectedRoute` - Component for protecting routes
- Axios interceptors - For automatic token injection and 401 handling

### Demo Credentials

- **Admin**: admin@school.com / password
- **Teacher**: teacher@school.com / password
- **Student**: student@school.com / password
- **Parent**: parent@school.com / password

## Color Palette

### Primary Colors
- Deep Teal (#0F766E) - Primary brand color
- Warm Orange (#FB923C) - Secondary accents
- Emerald Green (#10B981) - Success states
- Amber (#F59E0B) - Warning states
- Red (#EF4444) - Danger states

## Component Library

### UI Components
Located in `src/components/ui.jsx`:

- `Button` - Primary CTA button
- `Card` - Container component
- `Input` - Text input field
- `Select` - Dropdown select
- `TextArea` - Multi-line text input
- `Modal` - Dialog component
- `Table` - Data table
- `Badge` - Status badge
- `Alert` - Alert message
- `LoadingSpinner` - Loading indicator
- `EmptyState` - Empty state placeholder

## State Management

Using Zustand for lightweight state management:

- `useAuthStore` - Authentication and user state
- `useStudentStore` - Student data
- `useAttendanceStore` - Attendance data
- `useGradeStore` - Grade data

## API Integration

All API calls use the Axios client in `src/api/index.js`:

- Auto-injects JWT token in headers
- Handles 401 errors with automatic logout
- Supports both JSON and blob responses (for downloads)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Guidelines

### Component Structure

```jsx
import Layout from '../components/Layout'
import { Button, Card } from '../components/ui'

export default function MyPage() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Content */}
      </div>
    </Layout>
  )
}
```

### API Usage

```jsx
import { studentAPI } from '../api'

// Get all students
const { data } = await studentAPI.getAll()

// Create student
await studentAPI.create({ name: 'John', ... })

// Update student
await studentAPI.update(id, { name: 'Jane', ... })

// Delete student
await studentAPI.delete(id)
```

## Performance Considerations

1. **Code Splitting**: React Router enables automatic route-based code splitting
2. **Lazy Loading**: Images should use lazy loading
3. **API Caching**: Consider implementing caching for frequently accessed data
4. **Bundle Size**: Tree-shake unused Lucide icons

## Troubleshooting

### Port Already in Use
```bash
# Use a different port
npm run dev -- --port 3001
```

### API Connection Issues
- Ensure backend is running on `http://localhost:5000`
- Check `.env` configuration
- Verify CORS settings in backend

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Future Enhancements

- [ ] Implement data caching strategy
- [ ] Add offline support with Service Workers
- [ ] Implement real-time notifications
- [ ] Add advanced data visualization charts
- [ ] Implement file upload for assignments
- [ ] Add calendar view for dates
- [ ] Multi-language support
- [ ] Dark mode toggle

## License

MIT

## Support

For issues or questions, contact the development team.
