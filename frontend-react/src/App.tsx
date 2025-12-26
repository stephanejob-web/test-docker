import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import theme from './theme/theme';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardHome from './pages/DashboardHome';
import MyChurch from './pages/MyChurch';
import MyEvents from './pages/MyEvents';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';
import AdminChurches from './pages/AdminChurches';
import AdminEvents from './pages/AdminEvents';
import AdminRegistrations from './pages/AdminRegistrations';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />

                {/* Pastor Routes */}
                <Route element={<ProtectedRoute allowedRoles={['PASTOR', 'SUPER_ADMIN']} />}>
                  <Route path="my-church" element={<MyChurch />} />
                  <Route path="events" element={<MyEvents />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                  <Route path="admin/registrations" element={<AdminRegistrations />} />
                  <Route path="admin/users" element={<AdminUsers />} />
                  <Route path="admin/churches" element={<AdminChurches />} />
                  <Route path="admin/churches/:churchId/edit" element={<MyChurch />} />
                  <Route path="admin/events" element={<AdminEvents />} />
                  <Route path="admin/events/:eventId/edit" element={<MyEvents />} />
                  <Route path="admin/settings" element={<AdminSettings />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
