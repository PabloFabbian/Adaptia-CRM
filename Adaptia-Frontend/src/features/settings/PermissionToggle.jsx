// src/features/settings/PermissionToggle.jsx
import { useClinics } from '../../hooks/useClinics';

export const PermissionToggle = ({ memberId, resourceType, label, initialValue }) => {
    const { toggleConsent, loading } = useClinics();

    const handleChange = async (e) => {
        const newValue = e.target.checked;
        await toggleConsent(memberId, resourceType, newValue);
        // Opcional: Podrías disparar una notificación de "Guardado"
    };

    return (
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="text-sm text-gray-700">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked={initialValue}
                    onChange={handleChange}
                    disabled={loading}
                />
                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
            </label>
        </div>
    );
};