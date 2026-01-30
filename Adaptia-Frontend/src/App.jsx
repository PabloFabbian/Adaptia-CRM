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
import { BillingPage } from './pages/BillingPage';
import { CategoriesPage } from './pages/SystemPages';
import Clinics from './pages/Clinics';
import { NewPatient } from './pages/NewPatient';
import { Login } from './pages/Login';

// --- UI & ICONS ---
import { PlaceholderPage } from './components/ui/PlaceholderPage';
import { PlusCircle, Wallet, Trash2 } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  // Extraemos fetchAppointments para pasarlo a Settings si es necesario refrescar tras cambios
  const { appointments, fetchAppointments } = useAppointments();

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-dark-bg transition-colors duration-500">
        <div className="flex flex-col items-center gap-6">
          {/* Spinner elegante acorde a tu UI */}
          <div className="w-12 h-12 border-4 border-adaptia-blue/20 border-t-adaptia-blue rounded-full animate-spin" />
          <div className="text-gray-400 dark:text-gray-500 font-medium italic animate-pulse tracking-widest text-xs uppercase">
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
            background: 'var(--toast-bg)', // Puedes vincularlo a tu CSS variable de modo oscuro
          },
        }}
      />

      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<Login />} />
            {/* Redirección automática si intenta entrar a cualquier ruta sin sesión */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route path="/" element={<Layout />}>
            {/* VISTA PRINCIPAL: DASHBOARD */}
            <Route index element={<Dashboard user={user} appointments={appointments} />} />

            {/* GESTIÓN DE PACIENTES (FEATURE: PATIENTS) */}
            <Route path="pacientes" element={<PatientsPage />} />
            <Route path="pacientes/:id/historial" element={<PatientHistoryPage />} />
            <Route path="nuevo-paciente" element={<NewPatient />} />

            {/* GESTIÓN OPERATIVA (FEATURE: APPOINTMENTS) */}
            <Route path="citas" element={<AppointmentsPage />} />
            <Route path="calendario" element={<CalendarPage />} />

            {/* FINANZAS */}
            <Route path="facturacion" element={<BillingPage mode="list" />} />
            <Route path="nueva-factura" element={<BillingPage mode="create" />} />

            {/* CONFIGURACIÓN Y PERMISOS (FEATURE: CLINICS) */}
            <Route path="clinicas" element={<Clinics />} />
            <Route path="settings" element={<Settings fetchAppointments={fetchAppointments} />} />
            <Route path="categorias" element={<CategoriesPage />} />

            {/* ACCESOS RÁPIDOS / PLACEHOLDERS */}
            <Route path="agendar" element={<PlaceholderPage title="Agendar Cita" icon={PlusCircle} color="bg-blue-500" />} />
            <Route path="registrar-gasto" element={<PlaceholderPage title="Registrar Gasto" icon={Wallet} color="bg-red-500" />} />
            <Route path="papelera" element={<PlaceholderPage title="Papelera" icon={Trash2} color="bg-gray-700" />} />

            {/* SEGURIDAD: Si está logueado e intenta ir a login, vuelve al home */}
            <Route path="login" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;