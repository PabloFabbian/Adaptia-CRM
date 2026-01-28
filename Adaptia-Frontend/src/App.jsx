import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppointments } from './hooks/useAppointments';
import { Layout } from './components/layout/Layout';

// Importación de Páginas limpias
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import { PatientsPage } from './pages/PatientsPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { CalendarPage } from './pages/CalendarPage';
import { BillingPage } from './pages/BillingPage';
import { CategoriesPage } from './pages/SystemPages';
import Clinics from './pages/Clinics';
import { NewPatient } from './pages/NewPatient';

// UI
import { PlaceholderPage } from './components/ui/PlaceholderPage';
import { PlusCircle, UserPlus, Wallet, Trash2 } from 'lucide-react';

function App() {
  const { appointments, user, fetchAppointments } = useAppointments();

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard user={user} appointments={appointments} />} />
          <Route path="/pacientes" element={<PatientsPage />} />
          <Route path="/citas" element={<AppointmentsPage />} />
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/facturacion" element={<BillingPage mode="list" />} />
          <Route path="/clinicas" element={<Clinics />} />
          <Route path="/settings" element={<Settings fetchAppointments={fetchAppointments} />} />
          <Route path="/nuevo-paciente" element={<NewPatient />} />

          {/* Rutas con Placeholder reutilizable */}
          <Route path="/agendar" element={<PlaceholderPage title="Agendar Cita" icon={PlusCircle} color="bg-blue-500" />} />
          <Route path="/registrar-gasto" element={<PlaceholderPage title="Registrar Gasto" icon={Wallet} color="bg-red-500" />} />
          <Route path="/papelera" element={<PlaceholderPage title="Papelera" icon={Trash2} color="bg-gray-700" />} />
          <Route path="/categorias" element={<CategoriesPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;