import { Shield, Users } from 'lucide-react';
import { PermissionToggle } from '../features/settings/PermissionToggle';

const Settings = ({ fetchAppointments }) => (
    <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex items-center gap-3 mb-8">
            {/* Cambiado a tu color de acento #50e3c2 */}
            <div className="p-2.5 bg-[#50e3c2] rounded-xl text-gray-900 shadow-lg shadow-[#50e3c2]/20">
                <Shield className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Gestiona la privacidad y los parámetros del sistema</p>
            </div>
        </header>

        <div className="grid gap-6">
            {/* Sección de Privacidad */}
            <div className="bg-white dark:bg-[#161f31] border border-gray-100 dark:border-gray-800 rounded-2xl p-8 shadow-sm max-w-2xl">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Privacidad de la Agenda</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 leading-relaxed">
                            Controla si otros especialistas de la clínica pueden ver tus citas programadas.
                            Al desactivarlo, tus datos solo serán visibles para ti.
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-[#101828] rounded-xl p-4 flex items-center justify-between border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white dark:bg-[#161f31] rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm text-[#50e3c2]">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Visibilidad Compartida</p>
                            <p className="text-[12px] text-gray-400 dark:text-gray-500 font-light italic">Estado actual de consentimiento</p>
                        </div>
                    </div>

                    {/* Asegúrate de que PermissionToggle use clases dark: también */}
                    <PermissionToggle onUpdate={fetchAppointments} />
                </div>
            </div>

            {/* Sección de Sistema */}
            <div className="bg-white dark:bg-[#161f31] border border-gray-100 dark:border-gray-800 rounded-2xl p-8 shadow-sm max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Información del Sistema</h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm py-2 border-b border-gray-50 dark:border-gray-800">
                        <span className="text-gray-500 dark:text-gray-400">Servidor API</span>
                        <span className="text-[#50e3c2] font-bold">Online (Puerto 3001)</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-gray-50 dark:border-gray-800">
                        <span className="text-gray-500 dark:text-gray-400">Base de Datos</span>
                        <span className="text-blue-400 dark:text-[#50e3c2]/80 font-medium">Neon Cloud (AWS São Paulo)</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default Settings;