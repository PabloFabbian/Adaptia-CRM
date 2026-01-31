import { useState } from 'react';
import { Tabs } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { InviteMemberModal } from '../features/clinics/components/InviteMemberModal';
import {
    Home, Users, Briefcase, Calendar, Settings,
    UserPlus, Layout, ShieldCheck, Activity, Mail,
    Lock, Key, Eye, EyeOff, FileText, ChevronRight
} from 'lucide-react';

// --- CONFIGURACIÓN DINÁMICA DEL SIDEBAR ---

const tabExplanations = {
    inicio: {
        title: "Ecosistema",
        description: "Una vista holística de tu clínica. Aquí convergen la actividad en tiempo real, el rendimiento de los espacios y la salud operativa del centro.",
        icon: <Activity size={24} strokeWidth={1.5} />,
        color: "text-adaptia-mint",
        bg: "bg-adaptia-mint/10"
    },
    miembros: {
        title: "Colaboradores",
        description: "Gestione su red de profesionales. Recuerde que cada especialista es soberano de su información y decide qué compartir con la organización.",
        icon: <Users size={24} strokeWidth={1.5} />,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    roles: {
        title: "Gobernanza",
        description: "Defina los niveles de autoridad y acceso. El modelo de Adaptia se basa en el consentimiento explícito y la transparencia de datos.",
        icon: <ShieldCheck size={24} strokeWidth={1.5} />,
        color: "text-purple-500",
        bg: "bg-purple-500/10"
    },
    salas: {
        title: "Espacios",
        description: "Optimice el uso de sus instalaciones físicas. Asigne consultorios y áreas comunes de manera eficiente según la agenda de sus colaboradores.",
        icon: <Layout size={24} strokeWidth={1.5} />,
        color: "text-orange-500",
        bg: "bg-orange-500/10"
    }
};

// --- COMPONENTES ATÓMICOS ESTÉTICOS ---

const ResourcePill = ({ active, icon: Icon, label }) => (
    <div className={`
        flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-500 border
        ${active
            ? 'bg-adaptia-mint/5 border-adaptia-mint/30 text-adaptia-mint shadow-[0_0_15px_rgba(80,227,194,0.05)]'
            : 'bg-gray-50/50 dark:bg-white/5 border-transparent text-gray-300 dark:text-gray-600'}
    `}>
        <Icon size={14} strokeWidth={active ? 2 : 1.5} />
        <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
        <div className={`w-1 h-1 rounded-full ${active ? 'bg-adaptia-mint animate-pulse' : 'bg-gray-300'}`} />
    </div>
);

// --- DATOS INICIALES ---

const clinicTabs = [
    { id: 'inicio', label: 'Ecosistema', icon: <Home size={16} /> },
    { id: 'miembros', label: 'Colaboradores', icon: <UserPlus size={16} /> },
    { id: 'roles', label: 'Gobernanza', icon: <ShieldCheck size={16} /> },
    { id: 'salas', label: 'Espacios', icon: <Layout size={16} /> },
];

const rolesData = [
    { name: 'Owner', scope: 'Global', caps: ['Facturación', 'Ajustes'], desc: 'Control total de la entidad.' },
    { name: 'Especialista', scope: 'Soberano', caps: ['Agenda', 'Fichas'], desc: 'Dueño de su flujo clínico.' },
    { name: 'Administrador', scope: 'Delegado', caps: ['Reportes', 'Gestión'], desc: 'Apoyo operativo.' },
];

export const Clinics = () => {
    const [activeTab, setActiveTab] = useState('miembros');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const membersData = [
        { id: 1, name: 'Pablo Fabbian', email: 'pablo@adaptia.com', role: 'Owner', shared: ['Agenda', 'Pacientes', 'Notas'], status: 'Full Access' },
        { id: 2, name: 'Elena García', email: 'elena.g@clinic.com', role: 'Especialista', shared: ['Agenda', 'Pacientes'], status: 'Soberano' },
        { id: 3, name: 'Julian Ross', email: 'j.ross@adaptia.com', role: 'Especialista', shared: ['Agenda'], status: 'Privado' },
    ];

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* HEADER */}
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-adaptia-mint font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
                        <Activity size={12} className="animate-pulse" /> Ecosistema Activo
                    </div>
                    <h1 className="text-5xl font-extralight tracking-tight text-gray-900 dark:text-white leading-none">
                        Melon <span className="font-semibold text-adaptia-blue">Clinic</span>
                    </h1>
                    <p className="text-gray-400 dark:text-gray-500 mt-2 font-light">Sede España, 30 · Gestión de Privacidad Proactiva</p>
                </div>

                <div className="flex gap-4 p-1 bg-gray-100/50 dark:bg-white/5 rounded-[2rem] border border-gray-200/50 dark:border-white/10 backdrop-blur-md">
                    <div className="px-6 py-3 text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Seguridad</p>
                        <p className="text-xs font-medium text-emerald-500 flex items-center gap-1 justify-center">
                            <Lock size={12} /> End-to-End
                        </p>
                    </div>
                    <div className="w-[1px] bg-gray-200 dark:bg-gray-800 my-2" />
                    <div className="px-6 py-3 text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Modelo</p>
                        <p className="text-xs font-medium text-blue-500">Soberanía de Datos</p>
                    </div>
                </div>
            </header>

            <Tabs tabs={clinicTabs} activeTab={activeTab} onChange={setActiveTab} />

            <div className="grid grid-cols-12 gap-8 mt-10">

                {/* SIDEBAR DE PRIVACIDAD DINÁMICO (Compacto) */}
                <aside className="col-span-12 lg:col-span-3">
                    <div className="p-6 rounded-[2rem] bg-[#1a1f2b] border border-white/5 shadow-2xl animate-in fade-in slide-in-from-left-4 duration-500">

                        {/* Header del Sidebar: Icono + Título en una línea para ahorrar espacio */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl ${tabExplanations[activeTab].bg} ${tabExplanations[activeTab].color} flex items-center justify-center shadow-inner border border-white/5 shrink-0`}>
                                {/* Reducimos el tamaño del icono aquí si es necesario clonándolo */}
                                {tabExplanations[activeTab].icon}
                            </div>
                            <h3 className="text-lg font-semibold text-white tracking-tight leading-tight">
                                {tabExplanations[activeTab].title}
                            </h3>
                        </div>

                        {/* Descripción más pequeña */}
                        <p className="text-[12px] text-gray-400 leading-snug font-light mb-6 opacity-80 italic">
                            "{tabExplanations[activeTab].description}"
                        </p>

                        {/* Flujo Visual Compacto */}
                        <div className="space-y-3 mb-6 border-t border-white/5 pt-5">
                            {[
                                { dot: "bg-[#10b981]", shadow: "rgba(16,185,129,0.4)", text: "Miembro → Clínica" },
                                { dot: "bg-[#3b82f6]", shadow: "rgba(59,130,246,0.4)", text: "Clínica → Roles" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2.5 group">
                                    <div className={`w-1 h-1 rounded-full ${item.dot}`} style={{ boxShadow: `0 0 6px ${item.shadow}` }} />
                                    <span className="text-[11px] text-gray-400 font-medium group-hover:text-gray-200 transition-colors">
                                        {item.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Botón Invitar más estrecho */}
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all duration-300 group"
                        >
                            <Mail size={14} className="text-gray-400 group-hover:text-adaptia-mint transition-colors" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                                Invitar
                            </span>
                        </button>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="col-span-12 lg:col-span-9 space-y-6">

                    {/* VISTA COLABORADORES */}
                    {activeTab === 'miembros' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-4">
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.15em]">Directorio de Profesionales</h2>
                                <span className="text-[10px] bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full text-gray-500 font-bold">
                                    {membersData.length} Activos
                                </span>
                            </div>

                            {membersData.map((member) => (
                                <div key={member.id} className="group relative bg-white dark:bg-dark-surface p-1 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:border-adaptia-mint/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-adaptia-mint/5 hover:-translate-y-1">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-5">
                                        <div className="flex items-center gap-4 w-full md:w-1/3">
                                            <div className="relative">
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-gray-50 to-gray-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center text-xl font-light text-gray-600 dark:text-white border border-gray-100 dark:border-white/10">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-dark-surface rounded-full" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800 dark:text-white group-hover:text-adaptia-blue transition-colors">{member.name}</h4>
                                                <p className="text-xs text-gray-400 font-light">{member.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 w-full md:w-auto justify-center">
                                            <ResourcePill label="Agenda" active={member.shared.includes('Agenda')} icon={Calendar} />
                                            <ResourcePill label="Pacientes" active={member.shared.includes('Pacientes')} icon={Users} />
                                            <ResourcePill label="Notas" active={member.shared.includes('Notas')} icon={FileText} />
                                        </div>

                                        <div className="flex items-center gap-4 w-full md:w-1/4 justify-end">
                                            <div className="text-right">
                                                <p className={`text-[10px] font-black uppercase tracking-tighter ${member.status === 'Full Access' ? 'text-adaptia-mint' : 'text-blue-500'}`}>
                                                    {member.status}
                                                </p>
                                                <p className="text-[11px] text-gray-400 font-medium">{member.role}</p>
                                            </div>
                                            <button className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-300 hover:text-gray-600 transition-all">
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* VISTA ROLES */}
                    {activeTab === 'roles' && (
                        <Card title="Estructura de Permisos" className="rounded-[2.5rem] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5">
                                        <tr>
                                            <th className="px-8 py-5">Nivel de Rol</th>
                                            <th className="px-8 py-5">Alcance</th>
                                            <th className="px-8 py-5">Capacidades</th>
                                            <th className="px-8 py-5"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                        {rolesData.map((role) => (
                                            <tr key={role.name} className="hover:bg-gray-50/30 dark:hover:bg-white/[0.01] transition-colors">
                                                <td className="px-8 py-6">
                                                    <span className="font-bold text-gray-800 dark:text-gray-200">{role.name}</span>
                                                    <p className="text-xs text-gray-400 font-light mt-1 italic">{role.desc}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border ${role.scope === 'Soberano' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-gray-100 text-gray-500 border-transparent'}`}>
                                                        {role.scope === 'Soberano' ? <EyeOff size={10} /> : <Eye size={10} />}
                                                        {role.scope}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 flex gap-2">
                                                    {role.caps.map(c => <span key={c} className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md uppercase tracking-tighter">{c}</span>)}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <Settings size={14} className="text-gray-300 hover:text-gray-600 cursor-pointer transition-colors" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </main>
            </div>

            <InviteMemberModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
        </div>
    );
};

export default Clinics;