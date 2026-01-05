import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import theme from './theme/theme';
import PublicLayout from './layouts/PublicLayout';
import MapLayout from './layouts/MapLayout';
import HomePage from './pages/public/HomePage';
import LandingPage from './pages/public/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardHome from './pages/DashboardHome';
import MyChurch from './pages/MyChurch';
import MyEvents from './pages/MyEvents';
import PastorNetwork from './pages/PastorNetwork';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';
import AdminChurches from './pages/AdminChurches';
import AdminEvents from './pages/AdminEvents';
import AdminRegistrations from './pages/AdminRegistrations';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Pages publiques */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/map" element={
                <MapLayout>
                  <HomePage />
                </MapLayout>
              } />
              <Route element={<PublicLayout />}>
                {/* Autres pages publiques si nécessaire */}
              </Route>

              {/* Pages d'authentification */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Dashboard protégé */}
              <Route path="/dashboard" element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route index element={<DashboardHome />} />

                  {/* Pastor Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['PASTOR', 'SUPER_ADMIN']} />}>
                    <Route path="my-church" element={<MyChurch />} />
                    <Route path="events" element={<MyEvents />} />
                    <Route path="pastor-network" element={<PastorNetwork />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                    <Route path="admin/registrations" element={<AdminRegistrations />} />
                    <Route path="admin/users" element={<AdminUsers />} />
                    <Route path="admin/churches" element={<AdminChurches />} />
                    <Route path="admin/churches/:churchId/edit" element={<MyChurch />} />
                    <Route path="admin/events" element={<AdminEvents />} />
                    <Route path="admin/events/:eventId" element={<MyEvents />} />
                    <Route path="admin/events/:eventId/edit" element={<MyEvents />} />
                    <Route path="admin/settings" element={<AdminSettings />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
