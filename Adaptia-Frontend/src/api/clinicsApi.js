const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const getToken = () =>
    localStorage.getItem('adaptia_token') ||
    localStorage.getItem('token') ||
    (() => { try { return JSON.parse(localStorage.getItem('adaptia_user'))?.token; } catch { return null; } })();

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

export const clinicsApi = {
    // ✅ Ruta corregida: /clinics/:id/invitations
    inviteMember: async (clinicId, inviteData) => {
        const res = await fetch(`${API_URL}/clinics/${clinicId}/invitations`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(inviteData),
        });
        if (!res.ok) throw new Error('Error al enviar invitación');
        return res.json();
    },

    getRoles: async () => {
        const res = await fetch(`${API_URL}/clinics/roles`, {
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Error al obtener roles');
        return res.json();
    },

    // ✅ Ruta corregida: /clinics/:clinicId/members/:memberId/consent
    updateConsent: async (clinicId, memberId, resourceType, isGranted) => {
        const res = await fetch(`${API_URL}/clinics/${clinicId}/members/${memberId}/consent`, {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify({ resourceType, is_granted: isGranted })
        });
        if (!res.ok) throw new Error('Error al actualizar consentimiento');
        return res.json();
    }
};