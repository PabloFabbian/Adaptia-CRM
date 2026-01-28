import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export const AppointmentsPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ahora esta ruta ya existe en el Backend
        fetch('http://localhost:3001/api/appointments/all')
            .then(res => {
                if (!res.ok) throw new Error('Error en la respuesta del servidor');
                return res.json();
            })
            .then(json => {
                // Verificamos que json.data sea un array antes de guardarlo
                setData(Array.isArray(json.data) ? json.data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar citas:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-8 text-gray-400">Cargando base de citas...</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Base de Citas</h1>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-medium">Paciente</th>
                            <th className="px-6 py-4 font-medium">Fecha</th>
                            <th className="px-6 py-4 font-medium">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-10 text-center text-gray-400 font-light italic">
                                    No se encontraron citas en la base de datos de Neon.
                                </td>
                            </tr>
                        ) : (
                            data.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {item.patient_name || 'Paciente sin nombre'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {item.date ? new Date(item.date).toLocaleDateString() : 'Sin fecha'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full w-fit text-[11px] font-medium">
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