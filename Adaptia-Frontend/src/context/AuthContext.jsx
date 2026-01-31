import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeClinic, setActiveClinic] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('adaptia_user');
        const savedClinic = localStorage.getItem('adaptia_active_clinic');

        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedClinic) setActiveClinic(JSON.parse(savedClinic));

        setLoading(false);
    }, []);

    const login = (userData) => {
        // Guardamos los datos del usuario que vienen del backend (id, name, email, role, activeClinicId)
        setUser(userData);
        localStorage.setItem('adaptia_user', JSON.stringify(userData));

        // Si el backend nos mandó una clínica activa por defecto, la configuramos
        if (userData.activeClinicId) {
            const defaultClinic = {
                id: userData.activeClinicId,
                role_name: userData.role // Mapeamos el rol que viene del login
            };
            setActiveClinic(defaultClinic);
            localStorage.setItem('adaptia_active_clinic', JSON.stringify(defaultClinic));
        }
    };

    const logout = () => {
        setUser(null);
        setActiveClinic(null);
        localStorage.removeItem('adaptia_user');
        localStorage.removeItem('adaptia_active_clinic');
    };

    const switchClinic = (membership) => {
        setActiveClinic(membership);
        localStorage.setItem('adaptia_active_clinic', JSON.stringify(membership));
    };

    /**
     * VERIFICACIÓN DE ROLES MEJORADA
     */
    const hasRole = (allowedRoles) => {
        if (!user) return false;

        const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        // 1. Prioridad: Verificar rol global del usuario (Lo que guardamos al loguear)
        if (user.role && rolesArray.includes(user.role)) {
            return true;
        }

        // 2. Verificación por clínica activa (Fallback)
        if (activeClinic && rolesArray.includes(activeClinic.role_name)) {
            return true;
        }

        return false;
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            loading,
            activeClinic,
            switchClinic,
            hasRole
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