import { useState, useCallback } from 'react';

const API = 'http://localhost:3001';

const getToken = () =>
    localStorage.getItem('adaptia_token') ||
    localStorage.getItem('token') ||
    (() => { try { return JSON.parse(localStorage.getItem('adaptia_user'))?.token; } catch { return null; } })();

const authHeaders = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
});

export const useBilling = () => {
    const [kpis, setKpis] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /** 1. KPIs */
    const fetchKPIs = useCallback(async (clinicId, year, month) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/billing/kpis?clinicId=${clinicId}&year=${year}&month=${month}`, {
                headers: authHeaders()
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setKpis(data.data);
            return data;
        } catch (err) {
            setError(err.message);
            console.error('❌ fetchKPIs:', err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /** 2. Transacciones */
    const fetchTransactions = useCallback(async (clinicId, year, month, type = '') => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ clinicId, year, month });
            if (type) params.append('type', type);
            const res = await fetch(`${API}/api/billing/transactions?${params}`, {
                headers: authHeaders()
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setTransactions(data.data || []);
            return data;
        } catch (err) {
            setError(err.message);
            console.error('❌ fetchTransactions:', err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /** 3. Crear transacción */
    const createTransaction = useCallback(async (payload) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/billing/transactions`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            // Optimistic update
            setTransactions(prev => [data.data, ...prev]);
            return data.data;
        } catch (err) {
            setError(err.message);
            console.error('❌ createTransaction:', err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /** 4. Marcar como pagada */
    const markPaid = useCallback(async (transactionId) => {
        try {
            const res = await fetch(`${API}/api/billing/transactions/${transactionId}/pay`, {
                method: 'PATCH',
                headers: authHeaders(),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setTransactions(prev => prev.map(t =>
                t.id === transactionId ? { ...t, status: 'paid' } : t
            ));
            return data.data;
        } catch (err) {
            console.error('❌ markPaid:', err.message);
            throw err;
        }
    }, []);

    /** 5. Preview split */
    const previewSplit = useCallback(async (clinicId, transactionType, amountGross) => {
        if (!amountGross || amountGross <= 0) return null;
        try {
            const res = await fetch(
                `${API}/api/billing/preview?clinicId=${clinicId}&transactionType=${transactionType}&amountGross=${amountGross}`,
                { headers: authHeaders() }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return data.data;
        } catch (err) {
            console.error('❌ previewSplit:', err.message);
            return null;
        }
    }, []);

    /** 6. Liquidaciones */
    const fetchSettlements = useCallback(async (clinicId, year, month) => {
        setLoading(true);
        try {
            const res = await fetch(
                `${API}/api/billing/settlements?clinicId=${clinicId}&year=${year}&month=${month}`,
                { headers: authHeaders() }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSettlements(data.data || []);
            return data;
        } catch (err) {
            setError(err.message);
            console.error('❌ fetchSettlements:', err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /** 7. Generar liquidación */
    const generateSettlement = useCallback(async (clinicId, memberId, year, month) => {
        try {
            const res = await fetch(
                `${API}/api/billing/settlements/generate?clinicId=${clinicId}&memberId=${memberId}&year=${year}&month=${month}`,
                { method: 'POST', headers: authHeaders() }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return data.data;
        } catch (err) {
            console.error('❌ generateSettlement:', err.message);
            throw err;
        }
    }, []);

    /** 8. Aprobar liquidación */
    const approveSettlement = useCallback(async (settlementId, role) => {
        try {
            const res = await fetch(`${API}/api/billing/settlements/${settlementId}/approve`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({ role }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSettlements(prev => prev.map(s =>
                s.id === settlementId ? data.data : s
            ));
            return data.data;
        } catch (err) {
            console.error('❌ approveSettlement:', err.message);
            throw err;
        }
    }, []);

    /** 9. Reglas de split */
    const fetchRules = useCallback(async (clinicId) => {
        try {
            const res = await fetch(`${API}/api/billing/rules?clinicId=${clinicId}`, {
                headers: authHeaders()
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setRules(data.data || []);
            return data.data;
        } catch (err) {
            console.error('❌ fetchRules:', err.message);
        }
    }, []);

    /** 10. Actualizar regla */
    const updateRule = useCallback(async (ruleId, professionalPct, clinicPct) => {
        try {
            const res = await fetch(`${API}/api/billing/rules/${ruleId}`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({ professionalPct, clinicPct }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setRules(prev => prev.map(r => r.id === ruleId ? data.data : r));
            return data.data;
        } catch (err) {
            console.error('❌ updateRule:', err.message);
            throw err;
        }
    }, []);

    return {
        kpis, transactions, settlements, rules,
        loading, error,
        fetchKPIs, fetchTransactions, createTransaction,
        markPaid, previewSplit,
        fetchSettlements, generateSettlement, approveSettlement,
        fetchRules, updateRule,
    };
};