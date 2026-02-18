import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeClinic, setActiveClinic] = useState(null);
    const [userPermissions, setUserPermissions] = useState([]);

    const API_BASE_URL = 'http://localhost:3001';

    /** 1. Obtener permisos de capacidades */
    const fetchMyPermissions = useCallback(async (roleId, clinicId) => {
        if (roleId === undefined || roleId === null || !clinicId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/${clinicId}/roles/${roleId}/capabilities`);

            if (response.status === 404) {
                setUserPermissions([]);
                return;
            }

            if (!response.ok) throw new Error('Error al obtener capacidades');

            const capabilities = await response.json();

            const permissions = capabilities.map(c => {
                const slug = c.slug || c.capability?.slug || c;
                return typeof slug === 'string' ? slug.toLowerCase() : slug;
            });

            setUserPermissions(permissions);
            localStorage.setItem('adaptia_permissions', JSON.stringify(permissions));
        } catch (error) {
            console.error("❌ Error en AuthContext (fetchMyPermissions):", error.message);
            setUserPermissions([]);
        }
    }, []);

    /** 2. Sincronizar Soberanía y member_id 
     * MEJORA: Acepta un explicitToken para evitar el error 401 durante el login
     */
    const refreshUser = useCallback(async (explicitToken = null) => {
        // Buscamos el token en orden de prioridad
        const savedUserRaw = localStorage.getItem('adaptia_user');
        let token = explicitToken || localStorage.getItem('adaptia_token') || localStorage.getItem('token');

        if (!token && savedUserRaw) {
            try {
                token = JSON.parse(savedUserRaw)?.token;
            } catch (e) { token = null; }
        }

        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/me/sovereignty`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) console.warn("⚠️ Token expirado o inválido en refreshUser");
                throw new Error('Error al obtener soberanía');
            }

            const data = await response.json();

            setUser(prev => {
                const updatedUser = {
                    ...prev,
                    member_id: data.member_id,
                    consents: data.consents
                };
                localStorage.setItem('adaptia_user', JSON.stringify(updatedUser));
                return updatedUser;
            });

        } catch (error) {
            console.error("❌ [AuthContext] refreshUser failed:", error.message);
        }
    }, []);

    /** 3. Cambiar de clínica */
    const switchClinic = useCallback(async (membership) => {
        if (!membership) return;

        const clinicData = {
            id: String(membership.clinic_id || membership.id),
            name: membership.clinic_name || membership.name || "Clínica",
            role_id: Number(membership.role_id),
            role_name: membership.role_name || (Number(membership.role_id) === 0 ? "Tech Owner" : "Miembro")
        };

        setActiveClinic(clinicData);
        localStorage.setItem('adaptia_active_clinic', JSON.stringify(clinicData));

        await fetchMyPermissions(clinicData.role_id, clinicData.id);
        await refreshUser();
    }, [fetchMyPermissions, refreshUser]);

    /** 4. Login 
     * MEJORA: Sincronización inmediata de estados
     */
    const login = async (userData) => {
        try {
            const clinicRole = userData.activeClinic?.role_id;
            const numericRoleId = (clinicRole !== undefined && clinicRole !== null)
                ? Number(clinicRole)
                : null;

            const memberships = userData.memberships || (userData.activeClinic ? [userData.activeClinic] : []);

            const normalizedUser = {
                ...userData,
                role_id: numericRoleId,
                memberships: memberships
            };

            // 1. Persistencia inmediata
            setUser(normalizedUser);
            localStorage.setItem('adaptia_user', JSON.stringify(normalizedUser));
            if (userData.token) {
                localStorage.setItem('adaptia_token', userData.token);
            }

            // 2. Configurar clínica activa
            if (userData.activeClinic) {
                const clinicData = {
                    ...userData.activeClinic,
                    role_id: numericRoleId
                };
                setActiveClinic(clinicData);
                localStorage.setItem('adaptia_active_clinic', JSON.stringify(clinicData));

                // 3. Cargas en paralelo para velocidad
                await Promise.all([
                    fetchMyPermissions(clinicData.role_id, clinicData.id),
                    refreshUser(userData.token) // <--- Pasamos el token directamente aquí
                ]);
            }

            return normalizedUser;
        } catch (error) {
            console.error("❌ Error en AuthContext Login:", error);
            throw error;
        }
    };

    /** 5. Inicialización */
    useEffect(() => {
        const initAuth = async () => {
            try {
                const savedUser = localStorage.getItem('adaptia_user');
                const savedClinic = localStorage.getItem('adaptia_active_clinic');
                const savedPerms = localStorage.getItem('adaptia_permissions');

                if (savedUser && savedUser !== "undefined") {
                    const parsedUser = JSON.parse(savedUser);
                    setUser(parsedUser);

                    if (savedClinic && savedClinic !== "undefined") {
                        const clinic = JSON.parse(savedClinic);
                        clinic.role_id = Number(clinic.role_id);
                        setActiveClinic(clinic);

                        if (savedPerms) setUserPermissions(JSON.parse(savedPerms));

                        await fetchMyPermissions(clinic.role_id, clinic.id);
                        await refreshUser();
                    }
                }
            } catch (error) {
                console.error("Error inicializando Auth:", error);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, [fetchMyPermissions, refreshUser]);

    /** 6. Logout */
    const logout = () => {
        setUser(null);
        setActiveClinic(null);
        setUserPermissions([]);
        localStorage.clear();
        window.location.href = '/login';
    };

    /** 7. Helpers de Gobernanza */
    const can = useCallback((permission) => {
        if (!permission) return false;
        if (Number(activeClinic?.role_id) === 0) return true;
        return userPermissions.includes(permission.toLowerCase());
    }, [userPermissions, activeClinic]);

    const hasRole = useCallback((roleIdentifiers) => {
        if (!activeClinic) return false;
        const identifiers = Array.isArray(roleIdentifiers) ? roleIdentifiers : [roleIdentifiers];
        const currentRoleId = Number(activeClinic.role_id);
        const currentRoleName = activeClinic.role_name?.toLowerCase().trim();

        return identifiers.some(id => {
            if (typeof id === 'number') return currentRoleId === id;
            return currentRoleName === String(id).toLowerCase().trim();
        });
    }, [activeClinic]);

    return (
        <AuthContext.Provider value={{
            user, login, logout, loading, activeClinic,
            userPermissions, switchClinic, hasRole, can, refreshUser
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
    return context;
};