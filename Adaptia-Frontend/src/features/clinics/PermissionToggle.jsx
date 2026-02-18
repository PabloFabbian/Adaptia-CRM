import { useState, useEffect, useRef } from 'react'; // Usamos useRef para rastrear montado
import { useClinics } from '../../hooks/useClinics';
import { toast } from 'sonner';

export const PermissionToggle = ({ memberId, clinicId, resourceType, label, initialValue, onUpdate }) => {
    const { toggleConsent, loading: apiLoading } = useClinics();
    const [isChecked, setIsChecked] = useState(initialValue);
    const [isUpdating, setIsUpdating] = useState(false);

    // Referencia para evitar actualizar estado si el componente se desmonta
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // Sincronización inteligente
    useEffect(() => {
        if (!isUpdating) {
            setIsChecked(initialValue);
        }
    }, [initialValue, isUpdating]);

    const handleChange = async (e) => {
        // Validaciones preventivas
        if (!clinicId || !memberId || clinicId === "undefined" || memberId === "undefined") {
            toast.error("Error de sesión: Identificadores no válidos.");
            return;
        }

        if (isUpdating || apiLoading) return;

        const newValue = e.target.checked;

        // Iniciamos actualización
        setIsUpdating(true);
        setIsChecked(newValue);

        try {
            // 1. Petición al Servidor
            await toggleConsent(clinicId, memberId, resourceType, newValue);

            // 2. Sincronización con el Contexto (AuthContext)
            // Envolvemos en un Try/Catch interno para que si falla la sincronización,
            // el switch no se quede bloqueado.
            if (onUpdate) {
                try {
                    await onUpdate();
                } catch (syncError) {
                    console.warn("⚠️ Error al refrescar usuario, pero el cambio se guardó:", syncError);
                }
            }

            toast.success(`${label} actualizado`, { position: 'bottom-center' });

        } catch (error) {
            // Revertir en caso de error de red o 500
            setIsChecked(!newValue);
            toast.error("Error al guardar en el servidor");
            console.error("Error en toggle:", error);
        } finally {
            // CRÍTICO: Liberar siempre el estado, pase lo que pase
            if (isMounted.current) {
                setIsUpdating(false);
            }
        }
    };

    return (
        <label className={`relative inline-flex items-center ${(apiLoading || isUpdating) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
                type="checkbox"
                className="sr-only peer"
                checked={isChecked}
                onChange={handleChange}
                disabled={apiLoading || isUpdating}
            />
            <div className="w-10 h-5.5 bg-gray-200 dark:bg-gray-700 rounded-full peer 
                peer-checked:bg-emerald-500 
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                after:bg-white after:rounded-full after:h-4.5 after:w-4.5 
                after:transition-all peer-checked:after:translate-x-full">
            </div>
        </label>
    );
};