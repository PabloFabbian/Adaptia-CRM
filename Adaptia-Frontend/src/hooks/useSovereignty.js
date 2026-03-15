import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const useSovereignty = () => {
    const { user, activeClinic } = useAuth();
    const [consents, setConsents] = useState({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    const getToken = () =>
        localStorage.getItem('adaptia_token') ||
        localStorage.getItem('token') ||
        (() => { try { return JSON.parse(localStorage.getItem('adaptia_user'))?.token; } catch { return null; } })();

    const memberId = user?.member_id;
    const clinicId = activeClinic?.id;

    const fetchConsents = useCallback(async () => {
        if (!clinicId || !memberId) { setLoading(false); return; }
        setLoading(true);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/clinics/${clinicId}/directory`,
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            if (!res.ok) throw new Error();
            const { members } = await res.json();
            const me = members?.find(m => m.id === memberId);
            const map = (me?.consents || []).reduce((acc, c) => ({
                ...acc,
                [c.type]: c.is_granted
            }), {});
            setConsents(map);
        } catch {
            toast.error('No se pudieron cargar tus preferencias de privacidad');
        } finally {
            setLoading(false);
        }
    }, [clinicId, memberId]);

    const toggleConsent = async (resourceType, currentValue) => {
        if (!clinicId || !memberId) return;
        setUpdating(resourceType);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/clinics/${clinicId}/members/${memberId}/consent`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getToken()}`
                    },
                    body: JSON.stringify({ resourceType, is_granted: !currentValue })
                }
            );
            if (!res.ok) throw new Error();
            setConsents(prev => ({ ...prev, [resourceType]: !currentValue }));
            toast.success(`Preferencia de ${resourceType} actualizada`);
        } catch {
            toast.error('Error al actualizar la soberanía del recurso');
        } finally {
            setUpdating(null);
        }
    };

    useEffect(() => { fetchConsents(); }, [fetchConsents]);

    return { consents, loading, updating, toggleConsent, refresh: fetchConsents };
};