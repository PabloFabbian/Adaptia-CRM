import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppointments } from './hooks/useAppointments';
import { Layout } from './components/layout/Layout';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';

// --- PÁGINAS ---
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import SovereigntyPage from './pages/SovereigntyPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientHistoryPage } from './pages/PatientHistoryPage';
import { CalendarPage } from './pages/CalendarPage';
import { BookingPage } from './pages/BookingPage';
import { BillingPage } from './pages/BillingPage';
import { CategoriesPage } from './pages/SystemPages';
import Clinics from './pages/Clinics';
import { NewPatient } from './pages/NewPatient';
import { EditPatient } from './pages/EditPatient';
import { Login } from './pages/Login';
import { AcceptInvitation } from './pages/AcceptInvitation';

// --- UI & ICONS ---
import { PlaceholderPage } from './components/ui/PlaceholderPage';
import { Trash2, HeartHandshake, ClipboardList } from 'lucide-react';

/*
    ProtectedRoute: segunda capa de seguridad.
    El Sidebar oculta ítems por rol, pero cualquiera podría
    escribir la URL directamente. ProtectedRoute redirige a "/"
    si el usuario no tiene el permiso requerido.

    Props:
      permission  → verifica can('slug') contra capabilities del backend
      roleIds     → verifica que el role_id esté en el array (para rutas sin capability propia)
*/
const ProtectedRoute = ({ children, permission, roleIds }) => {
  const { can, activeClinic, loading } = useAuth();
  if (loading) return null;

  if (permission && !can(permission)) return <Navigate to="/" replace />;

  if (roleIds && activeClinic) {
    const currentRoleId = Number(activeClinic.role_id);
    if (!roleIds.includes(currentRoleId)) return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user, loading } = useAuth();
  const { appointments, fetchAppointments } = useAppointments();

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-[#101828]">
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
      <Toaster position="top-right" richColors closeButton />
      <Routes>

        {/* ── RUTAS PÚBLICAS (sin Layout, sin auth) ── */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />

        {/*
                    AcceptInvitation va FUERA del Layout porque:
                    - El invitado puede no tener cuenta aún
                    - Tiene su propio diseño de pantalla completa
                    - Si está logueado acepta directo, si no lo manda a /register?callback=...
                */}
        <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />

        {/* ── RUTAS PRIVADAS (con Layout) ── */}
        {!user ? (
          <Route path="*" element={<Navigate to="/login" replace />} />
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard user={user} appointments={appointments} />} />

            {/* GESTIÓN CLÍNICA */}
            <Route path="pacientes" element={
              <ProtectedRoute permission="patients.read">
                <PatientsPage />
              </ProtectedRoute>
            } />
            <Route path="pacientes/editar/:id" element={
              <ProtectedRoute permission="patients.write">
                <EditPatient />
              </ProtectedRoute>
            } />
            <Route path="pacientes/:id/historial" element={<PatientHistoryPage />} />
            <Route path="nuevo-paciente" element={
              <ProtectedRoute permission="patients.write">
                <NewPatient />
              </ProtectedRoute>
            } />
            <Route path="calendario" element={<CalendarPage />} />
            <Route path="agendar" element={<BookingPage />} />
            <Route path="notas" element={
              <ProtectedRoute permission="clinical_notes.read">
                <PlaceholderPage title="Notas Clínicas" icon={ClipboardList} />
              </ProtectedRoute>
            } />

            {/* SOBERANÍA */}
            <Route path="mis-permisos" element={
              <ProtectedRoute permission="clinic.resources.manage">
                <SovereigntyPage fetchAppointments={fetchAppointments} />
              </ProtectedRoute>
            } />
            <Route path="supervision" element={
              <PlaceholderPage
                title="Espacio de Supervisión"
                icon={HeartHandshake}
                description="Módulo para compartir casos de forma anónima con supervisores."
              />
            } />

            {/* ADMINISTRACIÓN */}
            <Route path="facturacion" element={
              <ProtectedRoute permission="clinic.billing.read">
                <BillingPage mode="list" />
              </ProtectedRoute>
            } />
            {/* Gobernanza: solo Tech Owner (0) y Owner (2) — sin capability propia, control por rol */}
            <Route path="clinicas" element={
              <ProtectedRoute roleIds={[0, 2]}>
                <Clinics />
              </ProtectedRoute>
            } />
            <Route path="categorias" element={<CategoriesPage />} />

            {/* SISTEMA */}
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