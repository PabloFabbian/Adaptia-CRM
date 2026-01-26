import { useState } from 'react';

export const useClinics = () => {
    const [loading, setLoading] = useState(false);

    const toggleConsent = async (memberId, resourceType, isGranted) => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/clinics/consent', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId, resourceType, isGranted })
            });
            return await response.json();
        } catch (error) {
            console.error("Error updating consent:", error);
        } finally {
            setLoading(false);
        }
    };

    return { toggleConsent, loading };
};