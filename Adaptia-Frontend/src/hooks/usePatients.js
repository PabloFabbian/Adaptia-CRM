import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const usePatients = (onPatientFound) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/patients');
            const json = await res.json();
            const data = json.data || [];
            setPatients(data);

            // LÓGICA DE APERTURA: Si hay un ?open=ID en la URL
            const openId = searchParams.get('open');
            if (openId && onPatientFound) {
                const p = data.find(item => item.id.toString() === openId);
                if (p) {
                    onPatientFound(p); // Avisamos a la página que abra este paciente
                }
            }
        } catch (error) {
            console.error("Error en Adaptia Cloud Fetch:", error);
        } finally {
            setLoading(false);
        }
    };

    // Re-ejecutar si cambian los parámetros de búsqueda (como el ID del duplicado)
    useEffect(() => {
        fetchPatients();
    }, [searchParams.get('open')]);

    return { patients, loading, refresh: fetchPatients };
};