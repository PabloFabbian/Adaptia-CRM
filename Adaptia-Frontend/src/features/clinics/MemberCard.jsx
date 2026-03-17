import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, ClipboardPaste, Loader2 } from 'lucide-react';
import { CapabilityPill } from './CapabilityPill';
import { CAP_LABELS, SIDEBAR_ITEMS, ROLE_STYLES, DEFAULT_ROLE_STYLE } from './clinics.constants';

export const MemberCard = ({
    member,
    capabilities,
    canManage,
    isExpanded,
    onToggle,
    togglingConsent,
    onConsentToggle,
    copiedConfig,
    onCopy,
    onPaste,
    onSidebarUpdate,
}) => {
    const [togglingNav, setTogglingNav] = useState(null);

    const rs = ROLE_STYLES[member.role_name] ?? DEFAULT_ROLE_STYLE;
    const roleCaps = member.role_capabilities || [];
    const hiddenSlugs = member.sidebar_hidden || [];
    const consentMap = Object.fromEntries(
        (member.consents || []).map(c => [c.resource_type, c.is_granted])
    );

    const isActive = (slug) => roleCaps.includes(slug) || consentMap[slug] === true;
    const fromRole = (slug) => roleCaps.includes(slug);

    const activeCount = capabilities.filter(c => isActive(c.slug)).length;
    const isCopySource = copiedConfig?.sourceId === member.id;
    const visibleSidebar = SIDEBAR_ITEMS.filter(item =>
        (item.always || (item.cap && isActive(item.cap))) &&
        !(item.cap && hiddenSlugs.includes(item.cap))
    );

    const handleSidebarToggle = async (item) => {
        if (!canManage || item.always || !item.cap) return;
        if (togglingNav) return;

        // ✅ Removido el guard de isActive — Owner puede ocultar/mostrar cualquier item
        const isHidden = hiddenSlugs.includes(item.cap);
        const newHidden = isHidden
            ? hiddenSlugs.filter(s => s !== item.cap)
            : [...hiddenSlugs, item.cap];

        setTogglingNav(item.cap);
        try {
            await onSidebarUpdate(member.id, newHidden);
        } catch {
            // finally siempre limpia
        } finally {
            setTogglingNav(null);
        }
    };

    return (
        <div className={`
            relative bg-white dark:bg-slate-800/60 border rounded-2xl overflow-hidden
            transition-all duration-300 shadow-sm
            ${isExpanded
                ? 'border-[#50e3c2]/30 shadow-[#50e3c2]/5 shadow-lg'
                : 'border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'}
        `}>
            <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${rs.bar} opacity-60`} />

            {/* ── Header ── */}
            <div
                className="flex items-center gap-4 p-5 cursor-pointer select-none"
                onClick={onToggle}
            >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm border shrink-0 ${rs.avatar}`}>
                    {member.name?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight truncate">
                        {member.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${rs.badge}`}>
                            {member.role_name}
                        </span>
                        {!isExpanded && (
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                {activeCount} accesos · {visibleSidebar.length} items sidebar
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    {canManage && (
                        <button
                            onClick={() => onCopy(member)}
                            title="Copiar configuración"
                            className={`p-2 rounded-lg transition-all text-slate-300 hover:text-[#50e3c2] hover:bg-slate-100 dark:hover:bg-slate-700
                                ${isCopySource ? 'text-[#50e3c2] bg-[#50e3c2]/10' : ''}`}
                        >
                            <Copy size={14} />
                        </button>
                    )}
                    {canManage && copiedConfig && !isCopySource && (
                        <button
                            onClick={() => onPaste(member)}
                            title={`Aplicar config de ${copiedConfig.sourceName}`}
                            className="p-2 rounded-lg transition-all text-amber-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                        >
                            <ClipboardPaste size={14} />
                        </button>
                    )}
                    <button className="p-2 rounded-lg text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>
            </div>

            {/* ── Body expandido ── */}
            {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-700/50">

                    {/* ── SECCIÓN 1: Navegación del Sidebar ── */}
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Navegación Visible
                            </p>
                            {canManage && (
                                <span className="text-[9px] text-slate-400 italic">
                                    Click para mostrar / ocultar
                                </span>
                            )}
                        </div>

                        {/* Pills de navegación — mismo estilo que Accesos Individuales */}
                        <div className="flex flex-wrap gap-2">
                            {SIDEBAR_ITEMS.map((item, i) => {
                                const hasAccessByRole = item.always || (item.cap && isActive(item.cap));
                                const isHidden = item.cap && hiddenSlugs.includes(item.cap);
                                const visible = hasAccessByRole && !isHidden;
                                const canToggle = canManage && !item.always && !!item.cap;
                                const isLoading = togglingNav === item.cap;

                                return (
                                    <button
                                        key={i}
                                        onClick={() => canToggle && handleSidebarToggle(item)}
                                        disabled={!canToggle || isLoading}
                                        title={
                                            item.always
                                                ? 'Siempre visible para todos'
                                                : visible
                                                    ? 'Click para ocultar del sidebar'
                                                    : 'Click para mostrar en el sidebar'
                                        }
                                        className={`
                                            flex items-center gap-1.5 px-3 py-1.5 rounded-full border
                                            text-[10px] font-bold uppercase tracking-wider
                                            transition-all duration-200 select-none
                                            ${!item.always && isLoading ? 'animate-pulse cursor-wait' : ''}
                                            ${item.always
                                                ? 'bg-[#50e3c2]/15 border-[#50e3c2]/50 text-[#50e3c2] cursor-not-allowed'
                                                : visible
                                                    ? 'bg-[#50e3c2]/15 border-[#50e3c2]/50 text-[#50e3c2] hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400 cursor-pointer active:scale-95'
                                                    : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 hover:border-[#50e3c2]/40 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer active:scale-95'}
                                        `}
                                    >
                                        {!item.always && isLoading ? (
                                            <Loader2 size={9} className="animate-spin shrink-0" />
                                        ) : (
                                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${visible || item.always ? 'bg-current' : 'bg-current opacity-40'}`} />
                                        )}
                                        {item.label}
                                        {item.always && <span className="text-[8px] opacity-50 ml-0.5">∞</span>}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[9px] text-slate-400 mt-3 leading-relaxed">
                            Verde = visible en el sidebar · Slate = oculto · ∞ = siempre visible, no editable.
                        </p>
                    </div>

                    {/* ── SECCIÓN 2: Accesos Individuales ── */}
                    <div className="px-5 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Accesos Individuales
                            </p>
                            <div className="flex items-center gap-3 text-[9px] text-slate-400">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-[#50e3c2]/60 border border-[#50e3c2] inline-block" />
                                    Del rol
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-[#50e3c2]/20 border border-[#50e3c2]/50 inline-block" />
                                    Individual
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {capabilities.map(cap => {
                                const active = isActive(cap.slug);
                                const isFromRole = fromRole(cap.slug);
                                const key = `${member.id}-${cap.slug}`;
                                const label = CAP_LABELS[cap.slug]?.label || cap.slug.replace('clinic.', '');

                                return (
                                    <CapabilityPill
                                        key={cap.id}
                                        label={label}
                                        active={active}
                                        fromRole={isFromRole}
                                        loading={togglingConsent === key}
                                        disabled={!canManage}
                                        onClick={() => onConsentToggle(member, cap)}
                                    />
                                );
                            })}
                        </div>
                        <p className="text-[9px] text-slate-400 mt-3 leading-relaxed">
                            Pills con <span className="inline-block w-2 h-2 rounded-full bg-slate-400 border border-white align-middle mx-0.5" /> vienen del rol y no son editables individualmente. Para modificarlos, cambiá los permisos del rol en la tab Gobernanza.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};