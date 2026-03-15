import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = 'http://localhost:3001/api';

const getToken = () =>
    localStorage.getItem('adaptia_token') ||
    localStorage.getItem('token') ||
    (() => { try { return JSON.parse(localStorage.getItem('adaptia_user'))?.token; } catch { return null; } })();

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

export const getPatientById = async (patientId, clinicId) => {
    try {
        const url = clinicId
            ? `${API_URL}/patients/${patientId}?clinicId=${clinicId}`
            : `${API_URL}/patients/${patientId}`;

        const response = await fetch(url, { headers: authHeaders() });
        if (!response.ok) throw new Error('Error al obtener el paciente');
        return await response.json();
    } catch (error) {
        console.error("❌ API Error [getPatientById]:", error);
        throw error;
    }
};

export const getPatientNotes = async (patientId, userId, clinicId) => {
    if (!patientId || !userId || !clinicId) {
        console.warn("⚠️ Parámetros insuficientes para la API.");
        return { data: [] };
    }
    try {
        const response = await fetch(
            `${API_URL}/patients/${patientId}/notes?userId=${userId}&clinicId=${clinicId}`,
            { headers: authHeaders() }
        );
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en el servidor');
        }
        return await response.json();
    } catch (error) {
        console.error("❌ API Error [getPatientNotes]:", error);
        throw error;
    }
};

export const updatePatient = async (patientId, patientData) => {
    try {
        const response = await fetch(`${API_URL}/patients/${patientId}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(patientData),
        });
        if (!response.ok) throw new Error('Error al actualizar el paciente');
        return await response.json();
    } catch (error) {
        console.error("❌ API Error [updatePatient]:", error);
        throw error;
    }
};

export const saveClinicalNote = async (patientId, formData, userId, clinicId) => {
    try {
        const response = await fetch(`${API_URL}/clinical-notes`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                patient_id: patientId,
                member_id: userId,
                content: formData.details || formData.content,
                title: formData.title,
                summary: formData.summary,
                category: formData.category,
                clinicId: clinicId
            })
        });
        if (!response.ok) throw new Error('Error al guardar la nota clínica');
        return await response.json();
    } catch (error) {
        console.error("❌ API Error [saveClinicalNote]:", error);
        throw error;
    }
};

export const exportHistoryToPDF = async (patientId, patientName) => {
    try {
        const res = await fetch(`${API_URL}/patients/${patientId}/export-pdf`, {
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Error al obtener datos del historial');

        const { patient, notes } = await res.json();
        const doc = new jsPDF();

        const primaryColor = [249, 115, 22];
        const accentColor = [13, 148, 136];

        doc.setFontSize(22);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("HISTORIAL CLÍNICO", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(50);
        doc.setFont(undefined, 'bold');
        doc.text(`Paciente: ${patient.name}`, 14, 30);
        doc.setFont(undefined, 'normal');
        doc.text(`Email: ${patient.email || 'N/A'} | Tel: ${patient.phone || 'N/A'}`, 14, 35);
        doc.text(`DNI: ${patient.dni || 'N/A'}`, 14, 40);
        doc.setDrawColor(230);
        doc.line(14, 45, 196, 45);

        const history = patient.history || {};
        let currentY = 52;

        if (history.motivo_consulta || history.antecedentes) {
            const motivoText = doc.splitTextToSize(history.motivo_consulta || "No registrado", 140);
            const blockHeight = 25 + (motivoText.length * 5);

            doc.setFillColor(248, 250, 252);
            doc.rect(14, currentY, 182, blockHeight, 'F');
            doc.setFont(undefined, 'bold');
            doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
            doc.text("ANTECEDENTES Y PERFIL DE INGRESO", 18, currentY + 8);
            doc.setFontSize(9);
            doc.setTextColor(80);
            doc.text("Motivo:", 18, currentY + 16);
            doc.setFont(undefined, 'normal');
            doc.text(motivoText, 35, currentY + 16);
            currentY += blockHeight + 10;
        }

        const tableColumn = ["Fecha", "Categoría", "Detalles", "Resumen IA"];
        const tableRows = (notes || []).map(note => [
            new Date(note.created_at).toLocaleDateString(),
            note.category || 'Evolución',
            `${note.title || 'Sesión'}\n${note.content || ""}`,
            note.summary || 'N/A'
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [tableColumn],
            body: tableRows,
            headStyles: { fillColor: primaryColor },
            styles: { fontSize: 8, overflow: 'linebreak', cellPadding: 4 },
            columnStyles: { 2: { cellWidth: 80 }, 3: { cellWidth: 50 } }
        });

        doc.save(`Historial_${patientName.replace(/\s+/g, '_')}.pdf`);
        return { success: true };

    } catch (error) {
        console.error("❌ Error al exportar PDF:", error);
        // ❌ Antes: alert(...)
        // ✅ Después: re-throw para que el llamador maneje con toast
        throw new Error("El reporte no pudo generarse. Verificá la conexión con el servidor.");
    }
};