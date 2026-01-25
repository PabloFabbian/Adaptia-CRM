import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppointments } from './hooks/useAppointments';
import { Layout } from './components/layout/Layout';
import { AppointmentTable } from './features/appointments/AppointmentTable';
import { PermissionToggle } from './features/settings/PermissionToggle';
import Clinics from './pages/Clinics';

function App() {
  const { appointments, user, fetchAppointments } = useAppointments();

  return (
    <Router>
      <Layout>
        <Routes>

          {/* RUTA: INICIO / DASHBOARD */}
          <Route path="/" element={
            <div className="max-w-5xl mx-auto">
              <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Agenda de {user || 'Cargando...'}
                </h1>
                <p className="text-gray-500 mt-1">Gestiona las citas y pacientes de hoy.</p>
              </header>

              <div className="bg-white border border-[#e5e5e3] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="px-6 py-4 border-b border-[#e5e5e3] bg-[#f9f9f8]">
                  <h3 className="font-semibold text-sm text-gray-700">Citas Programadas</h3>
                </div>
                <AppointmentTable appointments={appointments} />
              </div>
            </div>
          } />

          {/* RUTA: CLÍNICAS (La de la imagen) */}
          <Route path="/clinicas" element={<Clinics />} />

          {/* RUTA: AJUSTES / DISPONIBILIDAD */}
          <Route path="/settings" element={
            <div className="max-w-5xl mx-auto">
              <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Privacidad y Permisos
                </h1>
                <p className="text-gray-500 mt-1">Control de acceso a la información clínica.</p>
              </header>

              <div className="bg-white border border-[#e5e5e3] rounded-xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="max-w-md">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Consentimiento de Esteban</h3>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    Al activar esta opción, permites que otros especialistas vean tus citas compartidas
                    según las reglas de visibilidad de Adaptia.
                  </p>
                  <PermissionToggle onUpdate={fetchAppointments} />
                </div>
              </div>
            </div>
          } />

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;