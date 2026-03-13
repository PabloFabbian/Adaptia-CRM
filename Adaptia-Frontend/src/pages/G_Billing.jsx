import { CreditCard, Receipt, Plus, ArrowRight, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BillingPage = ({ mode = "list" }) => {
    const navigate = useNavigate();

    // En un entorno profesional, querrás distinguir entre entrada y salida
    const isGasto = mode === 'gasto';
    const isCreate = mode === 'create' || isGasto;

    return (
        <div className="max-w-6xl mx-auto p-8">
            <header className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl shadow-lg transition-all duration-500 ${isCreate
                        ? (isGasto ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-[#50e3c2] text-gray-900 shadow-[#50e3c2]/20')
                        : 'bg-gray-900 dark:bg-[#50e3c2]/10 text-white dark:text-[#50e3c2]'
                        }`}>
                        {isGasto ? <Wallet className="w-6 h-6" /> : (isCreate ? <Receipt className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {isGasto ? 'Registrar Gasto' : (mode === 'create' ? 'Nuevo Cobro' : 'Honorarios y Finanzas')}
                        </h1>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            {isCreate ? 'Gestión de flujo de caja profesional' : 'Control de tus ingresos y egresos clínicos'}
                        </p>
                    </div>
                </div>

                {mode === 'list' && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/registrar-gasto')}
                            className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all"
                        >
                            <TrendingDown size={18} /> Gasto
                        </button>
                        <button
                            onClick={() => navigate('/nueva-factura')}
                            className="flex items-center gap-2 bg-gray-900 dark:bg-[#50e3c2] text-white dark:text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[#50e3c2]/20"
                        >
                            <Plus size={18} /> Registrar Cobro
                        </button>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 gap-6">
                {isCreate ? (
                    <div className="bg-white dark:bg-[#161f31] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="max-w-md space-y-6">
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                                    {isGasto ? 'Categoría del Gasto' : 'Paciente / Concepto'}
                                </label>
                                <select className="w-full p-4 bg-gray-50 dark:bg-[#101828] border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#50e3c2]/50 transition-all text-gray-500 dark:text-gray-400">
                                    {isGasto ? (
                                        <>
                                            <option>Alquiler Consultorio</option>
                                            <option>Supervisión Clínica</option>
                                            <option>Material Didáctico / Tests</option>
                                            <option>Otros</option>
                                        </>
                                    ) : (
                                        <option>Seleccionar paciente...</option>
                                    )}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Monto</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                        <input type="number" placeholder="0.00" className="w-full p-4 pl-8 bg-gray-50 dark:bg-[#101828] border-none rounded-2xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-[#50e3c2]/50" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Fecha</label>
                                    <input type="date" className="w-full p-4 bg-gray-50 dark:bg-[#101828] border-none rounded-2xl outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-[#50e3c2]/50" />
                                </div>
                            </div>

                            <button className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${isGasto ? 'bg-gray-900 text-white' : 'bg-[#50e3c2] text-gray-900 shadow-[#50e3c2]/10'
                                } hover:brightness-110`}>
                                {isGasto ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                                {isGasto ? 'Confirmar Egreso' : 'Registrar Ingreso'}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Dashboard de finanzas (Lista vacía) */
                    <div className="group bg-white dark:bg-[#161f31] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-16 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:border-[#50e3c2]/30">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-[#101828] rounded-3xl flex items-center justify-center text-gray-300 dark:text-gray-700 mb-6 group-hover:scale-110 transition-transform duration-500">
                            <Wallet size={40} strokeWidth={1} className="group-hover:text-[#50e3c2] transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tu caja está en cero</h3>
                        <p className="text-gray-400 dark:text-gray-500 mt-2 max-w-xs mx-auto text-sm">
                            Comienza registrando tus honorarios de sesión para visualizar tu balance mensual.
                        </p>
                        <button onClick={() => navigate('/nueva-factura')} className="mt-8 flex items-center gap-2 text-gray-900 dark:text-[#50e3c2] font-bold text-sm hover:gap-4 transition-all">
                            Registrar primer ingreso <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};