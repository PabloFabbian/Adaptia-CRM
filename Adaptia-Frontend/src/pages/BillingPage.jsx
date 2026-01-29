import { CreditCard, Receipt, Plus, ArrowRight, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BillingPage = ({ mode = "list" }) => {
    const navigate = useNavigate();

    return (
        <div className="max-w-6xl mx-auto p-8">
            <header className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl shadow-lg transition-all duration-500 ${mode === 'create'
                        ? 'bg-[#50e3c2] text-gray-900 shadow-[#50e3c2]/20'
                        : 'bg-gray-900 dark:bg-[#50e3c2]/10 text-white dark:text-[#50e3c2]'
                        }`}>
                        {mode === 'create' ? <Receipt className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {mode === 'create' ? 'Nueva Factura' : 'Facturación'}
                        </h1>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            {mode === 'create' ? 'Generar comprobante de servicios' : 'Gestión de ingresos y egresos'}
                        </p>
                    </div>
                </div>

                {mode === 'list' && (
                    <button
                        onClick={() => navigate('/nueva-factura')}
                        className="flex items-center gap-2 bg-gray-900 dark:bg-[#50e3c2] text-white dark:text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all active:scale-95"
                    >
                        <Plus size={18} /> Nueva Factura
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 gap-6">
                {mode === 'create' ? (
                    <div className="bg-white dark:bg-[#161f31] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="max-w-md space-y-6">
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Paciente a facturar</label>
                                <select className="w-full p-4 bg-gray-50 dark:bg-[#101828] border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#50e3c2]/50 transition-all text-gray-500 dark:text-gray-400">
                                    <option>Seleccionar paciente...</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Monto</label>
                                    <input type="number" placeholder="0.00" className="w-full p-4 bg-gray-50 dark:bg-[#101828] border-none rounded-2xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-[#50e3c2]/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Fecha</label>
                                    <input type="date" className="w-full p-4 bg-gray-50 dark:bg-[#101828] border-none rounded-2xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-[#50e3c2]/50" />
                                </div>
                            </div>
                            <button className="w-full py-4 bg-[#50e3c2] text-gray-900 rounded-2xl font-bold shadow-lg shadow-[#50e3c2]/10 hover:brightness-110 transition-all flex items-center justify-center gap-2">
                                <Receipt size={20} /> Emitir Comprobante
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="group bg-white dark:bg-[#161f31] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-16 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:border-[#50e3c2]/30">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-[#101828] rounded-3xl flex items-center justify-center text-gray-300 dark:text-gray-700 mb-6 group-hover:scale-110 transition-transform duration-500">
                            <Wallet size={40} strokeWidth={1} className="group-hover:text-[#50e3c2] transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sin movimientos aún</h3>
                        <p className="text-gray-400 dark:text-gray-500 mt-2 max-w-xs mx-auto text-sm">
                            No se encontraron registros financieros. Comienza emitiendo tu primera factura.
                        </p>
                        <button onClick={() => navigate('/nueva-factura')} className="mt-8 flex items-center gap-2 text-gray-900 dark:text-[#50e3c2] font-bold text-sm hover:gap-4 transition-all">
                            Crear registro ahora <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};