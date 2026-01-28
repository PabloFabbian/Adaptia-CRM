import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppointments } from './hooks/useAppointments';
import { Layout } from './components/layout/Layout';
import { useAuth } from './context/AuthContext';

// Páginas
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import { PatientsPage } from './pages/PatientsPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { CalendarPage } from './pages/CalendarPage';
import { BillingPage } from './pages/BillingPage';
import { CategoriesPage } from './pages/SystemPages';
import Clinics from './pages/Clinics';
import { NewPatient } from './pages/NewPatient';
import { Login } from './pages/Login';

// UI
import { PlaceholderPage } from './components/ui/PlaceholderPage';
import { PlusCircle, Wallet, Trash2, Receipt } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  const { appointments, fetchAppointments } = useAppointments();

  if (loading) return <div className="h-screen flex items-center justify-center text-gray-400">Cargando...</div>;

  return (
    <Router>
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard user={user} appointments={appointments} />} />
            <Route path="pacientes" element={<PatientsPage />} />
            <Route path="citas" element={<AppointmentsPage />} />
            <Route path="calendario" element={<CalendarPage />} />
            <Route path="facturacion" element={<BillingPage mode="list" />} />
            <Route path="clinicas" element={<Clinics />} />
            <Route path="settings" element={<Settings fetchAppointments={fetchAppointments} />} />
            <Route path="nuevo-paciente" element={<NewPatient />} />

            {/* Rutas de Acciones y Sistema */}
            <Route path="agendar" element={<PlaceholderPage title="Agendar Cita" icon={PlusCircle} color="bg-blue-500" />} />
            <Route path="registrar-gasto" element={<PlaceholderPage title="Registrar Gasto" icon={Wallet} color="bg-red-500" />} />
            <Route path="categorias" element={<CategoriesPage />} />
            <Route path="papelera" element={<PlaceholderPage title="Papelera" icon={Trash2} color="bg-gray-700" />} />

            {/* SOLUCIÓN AL ERROR: Añadimos la ruta de facturar */}
            <Route path="nueva-factura" element={<BillingPage mode="create" />} />

            <Route path="login" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;