import { jsPDF } from "jspdf";
import "jspdf-autotable";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Obtiene los datos de un paciente específico por ID
 */
export const getPatientById = async (patientId) => {
    try {
        const response = await fetch(`${API_URL}/patients/${patientId}`);
        if (!response.ok) throw new Error('Error al obtener el paciente');
        const result = await response.json();

        // Retornamos siempre un objeto con la propiedad 'data' para que coincida 
        // con la desestructuración que haces en el useEffect: { data: { ... } }
        return result.data ? result : { data: result };
    } catch (error) {
        console.error("❌ Error en getPatientById:", error);
        throw error;
    }
};

/**
 * Obtiene todas las notas de un paciente
 * Maneja tanto respuestas tipo { data: [] } como arrays directos []
 */
export const getPatientNotes = async (patientId) => {
    try {
        const response = await fetch(`${API_URL}/patients/${patientId}/notes`);
        if (!response.ok) throw new Error('Error al obtener notas');
        const result = await response.json();

        // Si el backend devuelve el array envuelto en .data, lo extraemos
        if (result && result.data && Array.isArray(result.data)) {
            return result.data;
        }
        // Si el backend devuelve el array directamente
        if (Array.isArray(result)) {
            return result;
        }

        return [];
    } catch (error) {
        console.error("❌ Error en getPatientNotes:", error);
        return [];
    }
};

/**
 * Actualiza la información del paciente (incluyendo el objeto history)
 */
export const updatePatient = async (patientId, patientData) => {
    try {
        const response = await fetch(`${API_URL}/patients/${patientId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patientData),
        });

        if (!response.ok) throw new Error('Error al actualizar el paciente');
        return await response.json();
    } catch (error) {
        console.error("❌ Error en updatePatient:", error);
        throw error;
    }
};

/**
 * Guarda una nueva nota clínica
 */
export const saveClinicalNote = async (patientId, noteData) => {
    try {
        const response = await fetch(`${API_URL}/clinical-notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patient_id: patientId,
                member_id: noteData.member_id || 1,
                title: noteData.title,
                content: noteData.details || noteData.content,
                category: noteData.category,
                summary: noteData.summary
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al guardar la nota');
        }
        return await response.json();
    } catch (error) {
        console.error("❌ Error en saveClinicalNote:", error);
        throw error;
    }
};

/**
 * Genera el PDF en el cliente usando jsPDF con los datos del backend
 */
export const exportHistoryToPDF = async (patientId, patientName) => {
    try {
        const res = await fetch(`${API_URL}/patients/${patientId}/export-pdf`);
        if (!res.ok) throw new Error('Error al obtener datos para el PDF');
        const { patient, notes } = await res.json();

        const doc = new jsPDF();
        const primaryColor = [249, 115, 22]; // Naranja institucional

        // Encabezado del PDF
        doc.setFontSize(22);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("HISTORIAL CLÍNICO", 14, 20);

        // Información del Paciente
        doc.setFontSize(10);
        doc.setTextColor(50);
        doc.setFont(undefined, 'bold');
        doc.text(`Paciente: ${patient.name}`, 14, 30);
        doc.setFont(undefined, 'normal');
        doc.text(`Email: ${patient.email || 'N/A'} | Tel: ${patient.phone || 'N/A'}`, 14, 35);

        // Intentamos sacar el DNI del history si no está en la raíz
        const dni = patient.dni || patient.history?.dni || 'N/A';
        doc.text(`DNI: ${dni}`, 14, 40);

        doc.setDrawColor(230);
        doc.line(14, 45, 196, 45);

        // Tabla de notas
        const tableColumn = ["Fecha", "Categoría", "Detalles", "Resumen IA"];
        const tableRows = (notes || []).map(note => [
            new Date(note.created_at).toLocaleDateString(),
            note.category || 'Evolución',
            `${note.title || 'Sin título'}\n${(note.content || "").substring(0, 120)}...`,
            note.summary || 'Sin resumen'
        ]);

        doc.autoTable({
            startY: 50,
            head: [tableColumn],
            body: tableRows,
            headStyles: { fillColor: primaryColor },
            styles: { fontSize: 8, cellPadding: 4 },
            columnStyles: {
                2: { cellWidth: 70 },
                3: { cellWidth: 50 }
            }
        });

        doc.save(`Historial_${patientName.replace(/\s+/g, '_')}.pdf`);
        return { success: true };

    } catch (error) {
        console.error("❌ Error al exportar PDF:", error);
        alert("Error al generar el PDF");
    }
};