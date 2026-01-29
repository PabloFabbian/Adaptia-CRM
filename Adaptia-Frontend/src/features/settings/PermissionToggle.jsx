import { useClinics } from '../../hooks/useClinics';
import { toast } from 'sonner';

export const PermissionToggle = ({ memberId, resourceType, label, initialValue }) => {
    const { toggleConsent, loading } = useClinics();

    const handleChange = async (e) => {
        const newValue = e.target.checked;

        // Promesa para la notificación de Sonner
        const promise = toggleConsent(memberId, resourceType, newValue);

        toast.promise(promise, {
            loading: `Actualizando ${label.toLowerCase()}...`,
            success: () => `${label} actualizado correctamente`,
            error: (err) => `Error al actualizar: ${err.message || 'Intenta de nuevo'}`,
            position: 'bottom-center',
        });
    };

    return (
        <div className="flex items-center justify-between p-3 rounded-xl transition-colors group">
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium transition-colors">
                {label}
            </span>

            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked={initialValue}
                    onChange={handleChange}
                    disabled={loading}
                />
                <div className="w-10 h-5.5 bg-gray-200 dark:bg-dark-border rounded-full 
                    peer 
                    peer-checked:bg-adaptia-blue 
                    dark:peer-checked:bg-adaptia-mint
                    peer-disabled:opacity-50 
                    after:content-[''] 
                    after:absolute 
                    after:top-[2px] 
                    after:left-[2px] 
                    after:bg-white 
                    after:rounded-full 
                    after:h-4.5 
                    after:w-4.5 
                    after:transition-all 
                    peer-checked:after:translate-x-full 
                    peer-checked:after:bg-white
                    dark:peer-checked:after:bg-dark-bg">
                </div>
            </label>
        </div>
    );
};