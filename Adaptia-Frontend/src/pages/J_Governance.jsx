import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useClinics } from '../hooks/useClinics';
import { Tabs } from '../components/ui/Tabs';
import { InviteMemberModal } from '../features/clinics/InviteMemberModal';
import { MembersDirectory } from '../features/clinics/MembersDirectory';
import { GovernanceMatrix } from '../features/clinics/GovernanceMatrix';
import { CAP_LABELS } from '../features/clinics/clinics.constants';
import { toast } from 'sonner';
import {
    Home, UserPlus, Layout, ShieldCheck,
    Activity, Mail, Copy, ClipboardPaste,
    X, Loader2, Cpu, Shield
} from 'lucide-react';

const tabExplanations = {
    miembros: { title: "Colaboradores y Red", description: "Gestione su red profesional de especialistas. Configure la visibilidad de la navegación y los permisos de acceso individual para cada miembro de su equipo clínico.", icon: <UserPlus size={20} />, color: "text-blue-500" },
    roles: { title: "Matriz de Gobernanza", description: "Defina las capacidades globales por nivel jerárquico. Esta matriz establece los permisos base que se aplican automáticamente a todos los miembros según su rol asignado.", icon: <ShieldCheck size={20} />, color: "text-purple-500" },
};

const clinicTabs = [
    { id: 'miembros', label: 'Colaboradores', icon: <UserPlus size={16} /> },
    { id: 'roles', label: 'Matriz de Permisos', icon: <ShieldCheck size={16} /> },
];

export const Clinics = () => {
    const {
        activeClinic, hasRole, loading: authLoading,
        user, updateSidebarHidden  // ← updateSidebarHidden del contexto
    } = useAuth();

    const {
        members, roles: availableRoles, capabilities, governanceMatrix,
        loading: dataLoading, fetchDirectory, fetchGovernance,
        toggleRolePermission, toggleConsent, updateMemberSidebar,
    } = useClinics();

    const [activeTab, setActiveTab] = useState('miembros');
    const [isInviteModalOpen, setInviteModal] = useState(false);
    const [togglingCap, setTogglingCap] = useState(null);
    const [togglingConsent, setTogglingConsent] = useState(null);
    const [expandedIds, setExpandedIds] = useState([]);
    const [copiedConfig, setCopiedConfig] = useState(null);

    useEffect(() => {
        if (activeClinic?.id) {
            fetchDirectory(activeClinic.id);
            fetchGovernance(activeClinic.id);
        }
    }, [activeClinic?.id, fetchDirectory, fetchGovernance]);

    const canManage = useMemo(() => hasRole(['Tech Owner', 'Owner']), [hasRole]);

    const handleToggleExpand = (id) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id)
                : prev.length >= 2 ? [prev[1], id]
                    : [...prev, id]
        );
    };

    const handleCopy = (member) => {
        const roleCaps = member.role_capabilities || [];
        const consentMap = Object.fromEntries((member.consents || []).map(c => [c.resource_type, c.is_granted]));
        const slugs = capabilities
            .filter(cap => roleCaps.includes(cap.slug) || consentMap[cap.slug] === true)
            .map(cap => cap.slug);
        setCopiedConfig({ sourceId: member.id, sourceName: member.name, slugs });
        toast.success(`Config de ${member.name} copiada`);
    };

    const handlePaste = async (target) => {
        if (!copiedConfig) return;
        const roleCaps = target.role_capabilities || [];
        const consentMap = Object.fromEntries((target.consents || []).map(c => [c.resource_type, c.is_granted]));
        const toRevoke = capabilities.filter(c =>
            !roleCaps.includes(c.slug) && consentMap[c.slug] === true && !copiedConfig.slugs.includes(c.slug)
        );
        const toGrant = capabilities.filter(c =>
            !roleCaps.includes(c.slug) && copiedConfig.slugs.includes(c.slug)
        );
        try {
            for (const cap of toRevoke) await toggleConsent(activeClinic.id, target.id, cap.slug, false);
            for (const cap of toGrant) await toggleConsent(activeClinic.id, target.id, cap.slug, true);
            toast.success(`Config de ${copiedConfig.sourceName} aplicada a ${target.name}`);
            setCopiedConfig(null);
        } catch { toast.error('Error al aplicar configuración'); }
    };

    const handleRoleCapToggle = async (role, cap) => {
        if (!canManage) return;
        const isAssigned = governanceMatrix[role.name]?.some(g => g.resource === cap.slug);
        const key = `${role.name}-${cap.id}`;
        setTogglingCap(key);
        try {
            await toggleRolePermission(activeClinic.id, role.name, cap.id, isAssigned ? 'revoke' : 'grant');
            toast.success(isAssigned
                ? `🚫 "${CAP_LABELS[cap.slug]?.label}" revocado de ${role.name}`
                : `✅ "${CAP_LABELS[cap.slug]?.label}" otorgado a ${role.name}`);
        } catch { toast.error('No se pudo actualizar el permiso'); }
        finally { setTogglingCap(null); }
    };

    const handleConsentToggle = async (member, cap) => {
        const consentMap = Object.fromEntries((member.consents || []).map(c => [c.resource_type, c.is_granted]));
        const isGranted = consentMap[cap.slug] === true;
        const key = `${member.id}-${cap.slug}`;
        setTogglingConsent(key);
        try {
            await toggleConsent(activeClinic.id, member.id, cap.slug, !isGranted);
            toast.success(!isGranted
                ? `✅ "${CAP_LABELS[cap.slug]?.label}" otorgado a ${member.name}`
                : `🚫 "${CAP_LABELS[cap.slug]?.label}" revocado de ${member.name}`);
        } catch { toast.error('No se pudo actualizar el consentimiento'); }
        finally { setTogglingConsent(null); }
    };

    const handleSidebarUpdate = async (memberId, hiddenSlugs) => {
        try {
            await updateMemberSidebar(activeClinic.id, memberId, hiddenSlugs);
            toast.success('Navegación actualizada');

            // Si el Owner editó su propio sidebar, actualizar el contexto en tiempo real
            const editedMember = members.find(m => m.id === memberId);
            if (editedMember?.user_id === user?.id) {
                updateSidebarHidden(hiddenSlugs); // ← limpio, sin tocar localStorage manualmente
            }
        } catch {
            toast.error('No se pudo actualizar la navegación');
        }
    };

    if (authLoading) return (
        <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-[#50e3c2]" />
        </div>
    );

    const tab = tabExplanations[activeTab];

    return (
        <div className="h-full overflow-y-auto bg-gray-50/30 dark:bg-dark-bg">
            <div className="max-w-7xl mx-auto px-6 py-10 animate-in fade-in duration-700">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {activeClinic?.name?.replace('Clinic', '')} <span className="text-[#50e3c2]">Clinic</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                            Unidad de gestión operativa
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl shadow-sm">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                            {hasRole(['Tech Owner']) ? <Cpu size={16} className="text-emerald-500" /> : <Shield size={16} className="text-emerald-500" />}
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nivel de Acceso</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{activeClinic?.role_name || 'Especialista'}</p>
                        </div>
                    </div>
                </header>

                <div className="flex justify-center md:justify-start">
                    <Tabs tabs={clinicTabs} activeTab={activeTab} onChange={setActiveTab} />
                </div>

                <div className="grid grid-cols-12 gap-10 mt-12">

                    {/* Sidebar */}
                    <aside className="col-span-12 lg:col-span-4 xl:col-span-3">
                        <div className="bg-slate-200/20 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 sticky top-6">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6">
                                <div className={tab.color}>{tab.icon}</div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{tab.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 font-medium">{tab.description}</p>

                            {canManage && activeTab === 'miembros' && (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setInviteModal(true)}
                                        className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
                                    >
                                        <Mail size={16} strokeWidth={3} /> Invitar Miembro
                                    </button>

                                    {copiedConfig && (
                                        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl">
                                            <div>
                                                <p className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Config copiada</p>
                                                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 truncate">{copiedConfig.sourceName}</p>
                                                <p className="text-[9px] text-amber-500">{copiedConfig.slugs.length} accesos</p>
                                            </div>
                                            <button onClick={() => setCopiedConfig(null)} className="p-1.5 text-amber-400 hover:text-amber-600">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}

                                    <p className="text-[9px] text-slate-400 text-center leading-relaxed pt-1">
                                        Abrí hasta 2 colaboradores. Usá <Copy size={9} className="inline mx-0.5" /> para copiar y <ClipboardPaste size={9} className="inline mx-0.5" /> para pegar.
                                    </p>
                                </div>
                            )}

                            {activeTab === 'roles' && (
                                <div className="space-y-3">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Leyenda</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#50e3c2]/30 border border-[#50e3c2]/50" />
                                        <span className="text-[10px] text-slate-500">Permiso activo</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                                        <span className="text-[10px] text-slate-500">Sin permiso</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Contenido */}
                    <main className="col-span-12 lg:col-span-8 xl:col-span-9">
                        {dataLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-3xl border-dashed">
                                <Loader2 className="animate-spin text-[#50e3c2] mb-4" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronizando registros...</p>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'miembros' && (
                                    <MembersDirectory
                                        members={members}
                                        capabilities={capabilities}
                                        canManage={canManage}
                                        expandedIds={expandedIds}
                                        onToggleExpand={handleToggleExpand}
                                        togglingConsent={togglingConsent}
                                        onConsentToggle={handleConsentToggle}
                                        copiedConfig={copiedConfig}
                                        onCopy={handleCopy}
                                        onPaste={handlePaste}
                                        onClearCopy={() => setCopiedConfig(null)}
                                        onInvite={() => setInviteModal(true)}
                                        onSidebarUpdate={handleSidebarUpdate}
                                    />
                                )}

                                {activeTab === 'roles' && (
                                    <GovernanceMatrix
                                        roles={availableRoles}
                                        capabilities={capabilities}
                                        governanceMatrix={governanceMatrix}
                                        canManage={canManage}
                                        togglingCap={togglingCap}
                                        onToggle={handleRoleCapToggle}
                                    />
                                )}
                            </>
                        )}
                    </main>
                </div>

                {activeClinic?.id && (
                    <InviteMemberModal
                        isOpen={isInviteModalOpen}
                        onClose={() => setInviteModal(false)}
                        onSuccess={() => fetchDirectory(activeClinic.id)}
                        clinicId={activeClinic.id}
                    />
                )}
            </div>
        </div>
    );
};

export default Clinics;