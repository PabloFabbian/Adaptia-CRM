import { Shield, Users } from 'lucide-react';
import { PermissionToggle } from '../features/settings/PermissionToggle';

const Settings = ({ fetchAppointments }) => (
    <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-200">
                <Shield className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
                <p className="text-gray-500 text-sm">Gestiona la privacidad y los parámetros del sistema</p>
            </div>
        </header>

        <div className="grid gap-6">
            {/* Sección de Privacidad */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm max-w-2xl">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Privacidad de la Agenda</h3>
                        <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                            Controla si otros especialistas de la clínica pueden ver tus citas programadas.
                            Al desactivarlo, tus datos solo serán visibles para ti en la base de datos de Neon.
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm text-purple-600">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Visibilidad Compartida</p>
                            <p className="text-[12px] text-gray-400 font-light italic">Estado actual de consentimiento</p>
                        </div>
                    </div>

                    {/* Aquí vive tu toggle */}
                    <PermissionToggle onUpdate={fetchAppointments} />
                </div>
            </div>

            {/* Sección de Sistema (Placeholder) */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Sistema</h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                        <span className="text-gray-500">Servidor API</span>
                        <span className="text-emerald-500 font-medium">Online (Puerto 3001)</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                        <span className="text-gray-500">Base de Datos</span>
                        <span className="text-blue-500 font-medium">Neon Cloud (AWS São Paulo)</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default Settings;