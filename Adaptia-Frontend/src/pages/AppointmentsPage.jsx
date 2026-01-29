import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export const AppointmentsPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3001/api/appointments/all')
            .then(res => res.json())
            .then(json => {
                setData(Array.isArray(json.data) ? json.data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-gray-400 animate-pulse">Cargando base de citas...</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Base de Citas</h1>
            <div className="bg-white dark:bg-[#161f31] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-[#101828]/50 text-gray-500 dark:text-gray-400 uppercase text-[11px] tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-bold">Paciente</th>
                            <th className="px-6 py-4 font-bold">Fecha</th>
                            <th className="px-6 py-4 font-bold">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-gray-400 dark:text-gray-600 font-light italic">
                                    No se encontraron citas en la base de datos.
                                </td>
                            </tr>
                        ) : (
                            data.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-[#50e3c2]/5 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                                        {item.patient_name || 'Paciente sin nombre'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        {item.date ? new Date(item.date).toLocaleDateString() : 'Sin fecha'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1.5 text-[#2a8c81] dark:text-[#50e3c2] bg-[#50e3c2]/10 px-3 py-1 rounded-full w-fit text-[11px] font-bold">
                                            <Clock size={12} strokeWidth={2} />
                                            {item.status || 'Pendiente'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};