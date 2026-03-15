import { Shield } from 'lucide-react';
import { CapabilityPill } from './CapabilityPill';
import { CAP_LABELS } from './clinics.constants';

export const GovernanceMatrix = ({
    roles,
    capabilities,
    governanceMatrix,
    canManage,
    togglingCap,
    onToggle,
}) => (
    <div className="space-y-8">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
            Matriz de Gobernanza Global
        </h2>

        {roles.map(role => (
            <div
                key={role.id}
                className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center border border-purple-100 dark:border-purple-500/20">
                        <Shield size={18} className="text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                            {role.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                            {governanceMatrix[role.name]?.length ?? 0} permisos activos
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {capabilities.map(cap => {
                        const isAssigned = governanceMatrix[role.name]?.some(g => g.resource === cap.slug);
                        const key = `${role.name}-${cap.id}`;
                        const label = CAP_LABELS[cap.slug]?.label || cap.slug.replace('clinic.', '');

                        return (
                            <CapabilityPill
                                key={`${role.id}-${cap.id}`}
                                label={label}
                                active={isAssigned}
                                loading={togglingCap === key}
                                disabled={!canManage}
                                onClick={() => onToggle(role, cap)}
                            />
                        );
                    })}
                </div>
            </div>
        ))}
    </div>
);