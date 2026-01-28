import { CreditCard, Receipt, Plus, ArrowRight, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BillingPage = ({ mode = "list" }) => {
    const navigate = useNavigate();

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header con condicional de estilo */}
            <header className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl shadow-lg text-white transition-all duration-500 ${mode === 'create'
                        ? 'bg-emerald-500 shadow-emerald-100'
                        : 'bg-gray-900 shadow-gray-200'
                        }`}>
                        {mode === 'create' ? <Receipt className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            {mode === 'create' ? 'Nueva Factura' : 'Facturación'}
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            {mode === 'create' ? 'Generar comprobante de servicios' : 'Gestión de ingresos y egresos'}
                        </p>
                    </div>
                </div>

                {/* Botón de acción rápida en modo lista */}
                {mode === 'list' && (
                    <button
                        onClick={() => navigate('/nueva-factura')}
                        className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        Nueva Factura
                    </button>
                )}
            </header>

            {/* Contenido Principal */}
            <div className="grid grid-cols-1 gap-6">
                {mode === 'create' ? (
                    // Simulación de Formulario de Factura
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="max-w-md space-y-6">
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-gray-700 ml-1">Paciente a facturar</label>
                                <select className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-gray-900/5 transition-all text-gray-500">
                                    <option>Seleccionar paciente...</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Monto</label>
                                    <input type="number" placeholder="0.00" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Fecha</label>
                                    <input type="date" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none" />
                                </div>
                            </div>
                            <button className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                                <Receipt size={20} />
                                Emitir Comprobante
                            </button>
                        </div>
                    </div>
                ) : (
                    // Estado Vacío del Historial
                    <div className="group bg-white border border-gray-100 rounded-[2.5rem] p-16 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mb-6 group-hover:scale-110 transition-transform duration-500">
                            <Wallet size={40} strokeWidth={1} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Sin movimientos aún</h3>
                        <p className="text-gray-400 mt-2 max-w-xs mx-auto">
                            No se encontraron registros financieros en Neon Cloud. Comienza emitiendo tu primera factura.
                        </p>
                        <button
                            onClick={() => navigate('/nueva-factura')}
                            className="mt-8 flex items-center gap-2 text-gray-900 font-bold text-sm hover:gap-4 transition-all"
                        >
                            Crear registro ahora <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};