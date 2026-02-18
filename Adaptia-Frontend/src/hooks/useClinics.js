import { useState, useCallback } from 'react';

export const useClinics = () => {
    const [members, setMembers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [roles, setRoles] = useState([]);
    const [capabilities, setCapabilities] = useState([]);
    const [governanceMatrix, setGovernanceMatrix] = useState({});
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = 'http://localhost:3001';

    // Helper centralizado para autenticación
    const getAuthHeader = useCallback(() => {
        const savedUser = localStorage.getItem('adaptia_user');
        let token = localStorage.getItem('token') || localStorage.getItem('adaptia_token');

        if (!token && savedUser) {
            try {
                token = JSON.parse(savedUser)?.token;
            } catch (e) { token = null; }
        }
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }, []);

    /** 1. Obtener Directorio (Miembros e Invitaciones) */
    const fetchDirectory = useCallback(async (clinicId) => {
        if (!clinicId) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/${clinicId}/directory`, {
                headers: { ...getAuthHeader() }
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Error al cargar directorio');

            setMembers(data.members || []);
            setInvitations(data.invitations || []);
        } catch (error) {
            console.error("❌ Error en fetchDirectory:", error);
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    /** 2. Obtener Gobernanza (Roles, Capacidades y Matriz) */
    const fetchGovernance = useCallback(async (clinicId) => {
        if (!clinicId) return;
        setLoading(true);
        try {
            const [rolesRes, capsRes, govRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/clinics/roles`, { headers: { ...getAuthHeader() } }),
                fetch(`${API_BASE_URL}/api/clinics/capabilities`, { headers: { ...getAuthHeader() } }),
                fetch(`${API_BASE_URL}/api/clinics/${clinicId}/governance`, { headers: { ...getAuthHeader() } })
            ]);

            if (!rolesRes.ok || !capsRes.ok || !govRes.ok) {
                throw new Error("Uno de los endpoints de gobernanza falló");
            }

            const [rolesData, capsData, govData] = await Promise.all([
                rolesRes.json(),
                capsRes.json(),
                govRes.json()
            ]);

            setRoles(rolesData || []);
            setCapabilities(capsData || []);
            setGovernanceMatrix(govData || {});
        } catch (error) {
            console.error("❌ Error en fetchGovernance:", error);
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    /** 3. Toggle de Permisos de Rol (Gobernanza) */
    const toggleRolePermission = async (clinicId, roleName, capabilityId, action) => {
        setLoading(true); // Bloqueamos para evitar colisiones
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/${clinicId}/permissions/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({
                    role_name: roleName,
                    capability_id: capabilityId,
                    action: action
                })
            });

            if (!response.ok) throw new Error('No se pudo actualizar el permiso del rol');

            // Actualización optimista del estado local
            setGovernanceMatrix(prev => {
                const newMatrix = { ...prev };
                if (action === 'grant') {
                    const cap = capabilities.find(c => c.id === capabilityId);
                    if (!newMatrix[roleName]) newMatrix[roleName] = [];
                    if (cap) newMatrix[roleName].push({ resource: cap.slug });
                } else {
                    newMatrix[roleName] = (newMatrix[roleName] || []).filter(
                        p => p.resource !== capabilities.find(c => c.id === capabilityId)?.slug
                    );
                }
                return newMatrix;
            });
            return true;
        } catch (error) {
            console.error("❌ Error en toggleRolePermission:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /** 4. Toggle de Consentimiento Individual (Soberanía) */
    const toggleConsent = async (clinicId, memberId, resourceType, isGranted) => {
        if (!memberId || memberId === 'undefined') {
            console.error("❌ Error: memberId es requerido");
            return false;
        }

        setLoading(true); // VITAL: Sincroniza con el estado de carga del componente
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/${clinicId}/members/${memberId}/consent`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({
                    resourceType: resourceType,
                    is_granted: isGranted
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al actualizar soberanía');
            }

            // Actualización optimista del estado local de miembros
            setMembers(prev => prev.map(m => {
                if (m.id === parseInt(memberId)) {
                    const updatedConsents = [...(m.consents || [])];
                    const index = updatedConsents.findIndex(c => c.type === resourceType);
                    if (index > -1) {
                        updatedConsents[index].is_granted = isGranted;
                    } else {
                        updatedConsents.push({ type: resourceType, is_granted: isGranted });
                    }
                    return { ...m, consents: updatedConsents };
                }
                return m;
            }));

            return true;
        } catch (error) {
            console.error("❌ Error en toggleConsent:", error);
            throw error;
        } finally {
            setLoading(false); // DESBLOQUEO: Libera el PermissionToggle
        }
    };

    return {
        members,
        invitations,
        roles,
        capabilities,
        governanceMatrix,
        loading,
        fetchDirectory,
        fetchGovernance,
        toggleRolePermission,
        toggleConsent
    };
};