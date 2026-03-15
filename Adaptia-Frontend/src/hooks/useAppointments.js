import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export const useAppointments = () => {
    const { user, activeClinic } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getToken = () =>
        localStorage.getItem('adaptia_token') ||
        localStorage.getItem('token') ||
        (() => { try { return JSON.parse(localStorage.getItem('adaptia_user'))?.token; } catch { return null; } })();

    const fetchAppointments = useCallback(async () => {
        if (!user?.id || !activeClinic?.id) {
            setLoading(false);
            return;
        }
        setError(null);
        try {
            const res = await fetch(
                `http://localhost:3001/api/appointments?clinicId=${activeClinic.id}&userId=${user.id}`,
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
            const json = await res.json();
            setAppointments(json.data || []);
        } catch (err) {
            console.error('❌ Error en useAppointments:', err.message);
            setError(err.message);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [user?.id, activeClinic?.id]);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    return { appointments, loading, error, refresh: fetchAppointments };
};