import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppointments } from './hooks/useAppointments';
import { Layout } from './components/layout/Layout';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';
import { CAP } from './constants/roles';

// Páginas
import Dashboard from './pages/A_Home';
import Settings from './pages/Z_Settings';
import SovereigntyPage from './pages/E_Share';
import { PatientsPage } from './pages/B_Patients';
import { PatientHistoryPage } from './pages/PatientHistoryPage';
import { CalendarPage } from './pages/C_Agenda';
import { BookingPage } from './pages/J_NewAppointment';
import { BillingPage } from './pages/G_Billing';
import { CategoriesPage } from './pages/I_Categories';
import { Clinics } from './pages/H_Clinics';
import { NewPatient } from './pages/K_NewPatient';
import { EditPatient } from './pages/K_EditPatient';
import { Login } from './pages/Z_Login';
import { AcceptInvitation } from './pages/Z_AcceptInvitation';
import { PlaceholderPage } from './components/ui/PlaceholderPage';
import { Trash2, HeartHandshake, ClipboardList } from 'lucide-react';

/**
 * ProtectedRoute — redirige a "/" si el usuario no tiene la capability.
 * Segunda línea de defensa: el Sidebar ya oculta los links,
 * pero esto bloquea el acceso directo por URL.
 */
const ProtectedRoute = ({ children, permission }) => {
  const { can, loading } = useAuth();
  if (loading) return null;
  if (permission && !can(permission)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const { user, loading } = useAuth();
  const { appointments, fetchAppointments } = useAppointments();

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-[#101828]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 border-4 border-[#50e3c2]/20 border-t-[#50e3c2] rounded-full animate-spin" />
        <div className="text-gray-400 dark:text-gray-500 font-medium italic animate-pulse tracking-[0.2em] text-[10px] uppercase">
          Sincronizando con Adaptia Cloud...
        </div>
      </div>
    </div>
  );

  return (
    <Router>
      <Toaster position="top-right" richColors closeButton />
      <Routes>

        {/* Rutas públicas */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />

        {/* Rutas privadas */}
        {!user ? (
          <Route path="*" element={<Navigate to="/login" replace />} />
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard user={user} appointments={appointments} />} />

            {/* ── GESTIÓN CLÍNICA ── */}
            <Route path="pacientes" element={
              <ProtectedRoute permission={CAP.READ_PATIENTS}>
                <PatientsPage />
              </ProtectedRoute>
            } />
            <Route path="pacientes/editar/:id" element={
              <ProtectedRoute permission={CAP.WRITE_PATIENTS}>
                <EditPatient />
              </ProtectedRoute>
            } />
            <Route path="pacientes/:id/historial" element={
              <ProtectedRoute permission={CAP.READ_PATIENTS}>
                <PatientHistoryPage />
              </ProtectedRoute>
            } />
            <Route path="nuevo-paciente" element={
              <ProtectedRoute permission={CAP.WRITE_PATIENTS}>
                <NewPatient />
              </ProtectedRoute>
            } />
            <Route path="calendario" element={
              <ProtectedRoute permission={CAP.READ_APPOINTMENTS}>
                <CalendarPage />
              </ProtectedRoute>
            } />
            <Route path="agendar" element={
              <ProtectedRoute permission={CAP.WRITE_APPOINTMENTS}>
                <BookingPage />
              </ProtectedRoute>
            } />
            <Route path="notas" element={
              <ProtectedRoute permission={CAP.READ_NOTES}>
                <PlaceholderPage title="Notas Clínicas" icon={ClipboardList} />
              </ProtectedRoute>
            } />

            {/* ── SOBERANÍA ── */}
            <Route path="mis-permisos" element={
              <SovereigntyPage fetchAppointments={fetchAppointments} />
            } />
            <Route path="supervision" element={
              <PlaceholderPage
                title="Espacio de Supervisión"
                icon={HeartHandshake}
                description="Módulo para compartir casos de forma anónima con supervisores."
              />
            } />

            {/* ── ADMINISTRACIÓN ── */}
            <Route path="facturacion" element={
              <ProtectedRoute permission={CAP.MANAGE_CLINIC}>
                <BillingPage mode="list" />
              </ProtectedRoute>
            } />
            <Route path="clinicas" element={
              <ProtectedRoute permission={CAP.MANAGE_CLINIC}>
                <Clinics />
              </ProtectedRoute>
            } />
            <Route path="categorias" element={
              <ProtectedRoute permission={CAP.READ_CATEGORIES}>
                <CategoriesPage />
              </ProtectedRoute>
            } />

            {/* ── SISTEMA ── */}
            <Route path="settings" element={<Settings />} />
            <Route path="papelera" element={
              <PlaceholderPage title="Papelera" icon={Trash2} color="bg-gray-700" />
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;