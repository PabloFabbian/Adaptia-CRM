import { Tabs } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const clinicTabs = [
    { id: 'inicio', label: 'Inicio', icon: '🏠' },
    { id: 'miembros', label: 'Miembros', icon: '👤' },
    { id: 'roles', label: 'Roles', icon: '💼' },
    { id: 'salas', label: 'Salas', icon: '🖼️' },
    { id: 'citas', label: 'Citas', icon: '📅' },
    { id: 'pacientes', label: 'Pacientes', icon: '👥' },
];

const rolesData = [
    { name: 'Secretario', description: 'Es el que secreta cosas o algo así' },
    { name: 'Owner', description: 'Full administrative access to the clinic' },
];

const Clinics = () => {
    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            <header className="mb-8">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                    <button className="hover:text-black">← Clínicas</button>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                    Melon Clinic España, 30
                </h1>
            </header>

            <Tabs tabs={clinicTabs} />

            <section className="mt-8">
                <Card
                    title="Roles"
                    extra={<Button variant="primary">+ Nuevo rol</Button>}
                >
                    <table className="w-full text-sm">
                        <thead className="bg-[#f9f9f8] text-[#a1a19f] border-b border-[#e5e5e3]">
                            <tr>
                                <th className="px-6 py-3 font-medium text-left">Nombre</th>
                                <th className="px-6 py-3 font-medium text-left">Descripción</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e5e3]">
                            {rolesData.map((role) => (
                                <tr key={role.name} className="group hover:bg-[#fbfbfb] transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{role.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{role.description}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold flex items-center gap-1 ml-auto text-gray-600 bg-white border border-[#e5e5e3] px-2 py-1 rounded shadow-sm">
                                            ↗ Abrir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </section>
        </div>
    );
};

export default Clinics;