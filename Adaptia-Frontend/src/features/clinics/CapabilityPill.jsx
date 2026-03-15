import { Check, Loader2 } from 'lucide-react';

/**
 * Pill unificada para capabilities.
 *
 * Comportamiento visual:
 *   active + hover  → rojo  (indica que se puede desactivar)
 *   active          → verde
 *   inactive        → slate
 *   fromRole        → verde oscuro, no clickeable, con dot indicator
 *   disabled        → opaco, no clickeable
 */
export const CapabilityPill = ({
    label,
    active = false,
    fromRole = false,
    onClick,
    disabled = false,
    loading = false,
}) => {
    const isClickable = !disabled && !fromRole && !loading;

    return (
        <button
            onClick={isClickable ? onClick : undefined}
            disabled={!isClickable}
            title={fromRole ? 'Otorgado por el rol — cambiá la Gobernanza para modificarlo' : undefined}
            className={`
                relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border
                text-[10px] font-bold uppercase tracking-wider
                transition-all duration-200 select-none
                ${loading ? 'animate-pulse cursor-wait' : ''}
                ${fromRole
                    ? 'bg-[#50e3c2]/20 border-[#50e3c2]/60 text-[#50e3c2] cursor-not-allowed'
                    : active
                        ? 'bg-[#50e3c2]/15 border-[#50e3c2]/50 text-[#50e3c2] hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400 cursor-pointer active:scale-95'
                        : disabled
                            ? 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
                            : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 hover:border-[#50e3c2]/40 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer active:scale-95'
                }
            `}
        >
            {/* Icono */}
            {loading
                ? <Loader2 size={9} className="animate-spin shrink-0" />
                : active
                    ? <Check size={9} strokeWidth={3} className="shrink-0" />
                    : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40 shrink-0" />
            }

            {label}

            {/* Dot indicador "viene del rol" */}
            {fromRole && (
                <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-slate-500 dark:bg-slate-400 rounded-full border-2 border-white dark:border-slate-800"
                    title="Permiso heredado del rol"
                />
            )}
        </button>
    );
};