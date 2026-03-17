import { MemberCard } from './MemberCard';

export const MembersDirectory = ({
    members,
    capabilities,
    canManage,
    expandedIds,
    onToggleExpand,
    togglingConsent,
    onConsentToggle,
    copiedConfig,
    onCopy,
    onPaste,
    onClearCopy,
    onInvite,
    onSidebarUpdate,
}) => (
    <div className="space-y-3">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Directorio Profesional — {members.length} miembros
            </h2>
        </div>

        {members.map(member => (
            <MemberCard
                key={member.id}
                member={member}
                capabilities={capabilities}
                canManage={canManage}
                isExpanded={expandedIds.includes(member.id)}
                onToggle={() => onToggleExpand(member.id)}
                togglingConsent={togglingConsent}
                onConsentToggle={onConsentToggle}
                copiedConfig={copiedConfig}
                onCopy={onCopy}
                onPaste={onPaste}
                onSidebarUpdate={onSidebarUpdate}
            />
        ))}

        {members.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin colaboradores</p>
            </div>
        )}
    </div>
);