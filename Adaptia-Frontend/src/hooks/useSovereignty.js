import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const useSovereignty = () => {
    const { activeClinic } = useAuth();
    const [consents, setConsents] = useState({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;

    // Cargar consentimientos
    const fetchConsents = useCallback(async () => {
        if (!activeClinic?.id || !activeClinic?.member_id) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/clinics/${activeClinic.id}/my-consents/${activeClinic.member_id}`);
            if (!res.ok) throw new Error("Error al obtener datos");
            const data = await res.json();

            // Transformamos array a mapa: { patients: true, clinical_notes: false }
            const consentMap = data.reduce((acc, curr) => ({
                ...acc,
                [curr.resource_type]: curr.is_granted
            }), {});

            setConsents(consentMap);
        } catch (err) {
            console.error("❌ Error en useSovereignty:", err);
            toast.error("No se pudieron cargar tus preferencias de privacidad");
        } finally {
            setLoading(false);
        }
    }, [activeClinic, API_URL]);

    // Alternar consentimiento
    const toggleConsent = async (resourceType, currentValue) => {
        setUpdating(resourceType);
        try {
            const res = await fetch(`${API_URL}/api/clinics/consent`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memberId: activeClinic.member_id,
                    clinicId: activeClinic.id,
                    resourceType,
                    isGranted: !currentValue
                })
            });

            if (res.ok) {
                setConsents(prev => ({ ...prev, [resourceType]: !currentValue }));
                toast.success(`Permiso de ${resourceType} actualizado`);
            } else {
                throw new Error();
            }
        } catch (err) {
            toast.error("Error al actualizar la soberanía del recurso");
        } finally {
            setUpdating(null);
        }
    };

    useEffect(() => {
        fetchConsents();
    }, [fetchConsents]);

    return { consents, loading, updating, toggleConsent, refresh: fetchConsents };
};