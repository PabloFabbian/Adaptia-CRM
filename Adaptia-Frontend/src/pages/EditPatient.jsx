import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { PatientForm } from '../features/patients/PatientForm';
import { toast } from 'sonner';

export const EditPatient = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/patients/${id}`);
                const { data } = await res.json();
                setFormData({
                    ...data,
                    birth_date: data.birth_date ? data.birth_date.split('T')[0] : '',
                    history: data.history || { motivo_consulta: '', antecedentes: '', medicacion: '' }
                });
            } catch (err) {
                toast.error("Error al cargar datos");
            } finally {
                setFetching(false);
            }
        };
        fetchPatient();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/patients/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success("Expediente actualizado");
                navigate('/pacientes');
            }
        } catch (err) {
            toast.error("Error al actualizar");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-20 text-center animate-pulse">Cargando expediente...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/pacientes" className="flex items-center gap-2 text-gray-400 mb-8 text-sm hover:text-gray-600">
                <ArrowLeft size={16} /> Volver
            </Link>
            <h1 className="text-4xl font-light mb-10">Editar <span className="font-bold">Paciente</span></h1>
            <PatientForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} loading={loading} isEditMode={true} />
        </div>
    );
};