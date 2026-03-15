import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, ClipboardPaste, Eye, EyeOff, Check } from 'lucide-react';
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
}) => {
    const rs = ROLE_STYLES[member.role_name] ?? DEFAULT_ROLE_STYLE;
    const roleCaps = member.role_capabilities || [];
    const consentMap = Object.fromEntries(
        (member.consents || []).map(c => [c.resource_type, c.is_granted])
    );

    const isActive = (slug) => roleCaps.includes(slug) || consentMap[slug] === true;
    const fromRole = (slug) => roleCaps.includes(slug);

    const activeCount = capabilities.filter(c => isActive(c.slug)).length;
    const isCopySource = copiedConfig?.sourceId === member.id;
    const visibleSidebar = SIDEBAR_ITEMS.filter(item => item.always || (item.cap && isActive(item.cap)));

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

                    {/* Vista del Sidebar */}
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-2 mb-3">
                            <Eye size={12} className="text-[#50e3c2]" />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vista del Sidebar</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                            <div className="space-y-0.5">
                                {SIDEBAR_ITEMS.map((item, i) => {
                                    const visible = item.always || (item.cap && isActive(item.cap));
                                    return (
                                        <div key={i} className={`
                                            flex items-center gap-2 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all
                                            ${visible ? 'text-slate-700 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600 line-through opacity-40'}
                                        `}>
                                            {visible
                                                ? <Eye size={9} className="text-[#50e3c2] shrink-0" />
                                                : <EyeOff size={9} className="shrink-0" />}
                                            {item.label}
                                            {item.cap && fromRole(item.cap) && visible && (
                                                <span className="ml-auto text-[8px] text-slate-400 font-bold uppercase">rol</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Accesos Individuales */}
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
                            Pills con <span className="inline-block w-2 h-2 rounded-full bg-slate-400 border border-white align-middle mx-0.5" /> vienen del rol y no son editables individualmente.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};