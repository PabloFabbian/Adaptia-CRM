import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppointments } from './hooks/useAppointments';
import { Layout } from './components/layout/Layout';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';
import { CAP } from './constants/roles';

// ── IMPORTACIÓN DE PÁGINAS (Siguiendo exactamente tu sidebar y archivos) ──
import Dashboard from './pages/A_Home';
import { PatientHistoryPage } from './pages/B_PatientHistory';
import { PatientsPage } from './pages/B_Patients';
import { CalendarPage } from './pages/C_Agenda';
import ConsentsPage from './pages/D_Consents';
import { ReferralsPage } from './pages/E_Referrals';
import { InterconsultationsPage } from './pages/F_Interconsultations';
import { SupervisionsPage } from './pages/G_Supervisions';
import { BillingPage } from "./pages/H_Fees";
import SovereigntyPage from './pages/I_DataSovereignty';
import { Clinics } from './pages/J_Governance';
import { CategoriesPage } from './pages/K_Categories';
import { BookingPage } from './pages/L_NewAppointment';
import { EditPatient } from './pages/M_EditPatient';
import { NewPatient } from './pages/M_NewPatient';

// Sistema
import { AcceptInvitation } from './pages/Z_AcceptInvitation';
import { Login } from './pages/Z_Login';
import Settings from './pages/Z_Settings';

// UI Helpers
import { PlaceholderPage } from './components/ui/PlaceholderPage';
import { Trash2 } from 'lucide-react';

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
            <Route path="pacientes/:id/historial" element={
              <ProtectedRoute permission={CAP.READ_PATIENTS}>
                <PatientHistoryPage />
              </ProtectedRoute>
            } />
            <Route path="calendario" element={
              <ProtectedRoute permission={CAP.READ_APPOINTMENTS}>
                <CalendarPage />
              </ProtectedRoute>
            } />
            <Route path="consentimientos" element={
              <ProtectedRoute permission={CAP.READ_NOTES}>
                <ConsentsPage />
              </ProtectedRoute>
            } />

            {/* ── COLABORACIÓN ── */}
            <Route path="derivaciones" element={<ReferralsPage />} />
            <Route path="interconsulta" element={<InterconsultationsPage />} />
            <Route path="supervision" element={<SupervisionsPage />} />

            {/* ── ADMINISTRACIÓN ── */}
            <Route path="honorarios" element={
              <ProtectedRoute permission={CAP.MANAGE_CLINIC}>
                <BillingPage mode="list" />
              </ProtectedRoute>
            } />
            <Route path="soberania" element={<SovereigntyPage fetchAppointments={fetchAppointments} />} />
            <Route path="gobernanza" element={
              <ProtectedRoute permission={CAP.MANAGE_CLINIC}>
                <Clinics />
              </ProtectedRoute>
            } />
            <Route path="categorias" element={
              <ProtectedRoute permission={CAP.READ_CATEGORIES}>
                <CategoriesPage />
              </ProtectedRoute>
            } />

            {/* ── ACCIONES RÁPIDAS ── */}
            <Route path="nueva-cita" element={
              <ProtectedRoute permission={CAP.WRITE_APPOINTMENTS}>
                <BookingPage />
              </ProtectedRoute>
            } />
            <Route path="alta-paciente" element={
              <ProtectedRoute permission={CAP.WRITE_PATIENTS}>
                <NewPatient />
              </ProtectedRoute>
            } />
            <Route path="pacientes/editar/:id" element={
              <ProtectedRoute permission={CAP.WRITE_PATIENTS}>
                <EditPatient />
              </ProtectedRoute>
            } />

            {/* ── SISTEMA ── */}
            <Route path="settings" element={<Settings />} />
            <Route path="papelera" element={<PlaceholderPage title="Papelera" icon={Trash2} color="bg-gray-700" />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;