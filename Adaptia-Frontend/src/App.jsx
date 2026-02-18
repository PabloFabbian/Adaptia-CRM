import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppointments } from './hooks/useAppointments';
import { Layout } from './components/layout/Layout';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';

// --- PÁGINAS ---
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import { PatientsPage } from './pages/PatientsPage';
import { PatientHistoryPage } from './pages/PatientHistoryPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { CalendarPage } from './pages/CalendarPage';
import { BookingPage } from './pages/BookingPage'; // <-- Nueva página
import { BillingPage } from './pages/BillingPage';
import { CategoriesPage } from './pages/SystemPages';
import Clinics from './pages/Clinics';
import { NewPatient } from './pages/NewPatient';
import { Login } from './pages/Login';

// --- UI & ICONS ---
import { PlaceholderPage } from './components/ui/PlaceholderPage';
import { Wallet, Trash2 } from 'lucide-react';

const ProtectedRoute = ({ children, permission }) => {
  const { user, userPermissions, hasRole } = useAuth();
  const isAuthorized = hasRole(['Tech Owner', 'Owner']) || userPermissions?.includes(permission);

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const { user, loading, userPermissions } = useAuth();
  const { appointments, fetchAppointments } = useAppointments();

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-[#101828] transition-colors duration-500">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-[#50e3c2]/20 border-t-[#50e3c2] rounded-full animate-spin" />
          <div className="text-gray-400 dark:text-gray-500 font-medium italic animate-pulse tracking-[0.2em] text-[10px] uppercase">
            Sincronizando con Adaptia Cloud...
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        toastOptions={{
          style: {
            borderRadius: '1.25rem',
            padding: '1rem',
            background: 'var(--toast-bg)',
            border: '1px solid var(--border-color)',
          },
        }}
      />

      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={<Login />} />

        {!user ? (
          <Route path="*" element={<Navigate to="/login" replace />} />
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard user={user} appointments={appointments} />} />

            {/* PACIENTES */}
            <Route path="pacientes" element={
              <ProtectedRoute permission="clinic.patients.read">
                <PatientsPage />
              </ProtectedRoute>
            } />
            <Route path="pacientes/:id/historial" element={<PatientHistoryPage />} />
            <Route path="pacientes/nuevo" element={<NewPatient />} />
            <Route path="nuevo-paciente" element={<NewPatient />} />

            {/* CALENDARIO Y AGENDA */}
            <Route path="citas" element={
              <ProtectedRoute permission="clinic.appointments.read">
                <AppointmentsPage />
              </ProtectedRoute>
            } />
            <Route path="calendario" element={<CalendarPage />} />
            <Route path="agendar" element={<BookingPage />} /> {/* <-- Cal.com aquí */}

            {/* SISTEMA Y FINANZAS */}
            <Route path="facturacion" element={
              <ProtectedRoute permission="clinic.settings.read">
                <BillingPage mode="list" />
              </ProtectedRoute>
            } />
            <Route path="clinicas" element={
              <ProtectedRoute permission="clinic.settings.read">
                <Clinics />
              </ProtectedRoute>
            } />
            <Route path="settings" element={<Settings fetchAppointments={fetchAppointments} />} />
            <Route path="categorias" element={<CategoriesPage />} />

            {/* ACCESOS RÁPIDOS */}
            <Route path="registrar-gasto" element={<PlaceholderPage title="Registrar Gasto" icon={Wallet} color="bg-red-500" />} />
            <Route path="papelera" element={<PlaceholderPage title="Papelera" icon={Trash2} color="bg-gray-700" />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;