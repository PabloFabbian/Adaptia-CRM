import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    CreditCard, TrendingUp, TrendingDown, Wallet,
    Plus, CheckCircle2, Clock, Loader2,
    ChevronLeft, ChevronRight, ShieldCheck,
    Receipt, Settings2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBilling } from '../hooks/useBilling';
import { usePatients } from '../hooks/usePatients';
import { toast } from 'sonner';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `$${Number(n || 0).toLocaleString('es-AR')}`;
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const TYPE_LABELS = { particular: 'Particular', os: 'Obra social', pack: 'Pack' };
const TYPE_STYLES = {
    particular: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border-blue-100 dark:border-blue-500/20',
    os: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border-emerald-100 dark:border-emerald-500/20',
    pack: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 border-purple-100 dark:border-purple-500/20',
};
const STATUS_STYLES = {
    pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
};

// ── Sub-componentes ───────────────────────────────────────────────────────────

const KPICard = ({ label, value, sub, accent }) => (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <p className={`text-2xl font-bold tracking-tight ${accent || 'text-slate-900 dark:text-white'}`}>{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
    </div>
);

const TypeBadge = ({ type }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${TYPE_STYLES[type] || ''}`}>
        {TYPE_LABELS[type] || type}
    </span>
);

const SplitBar = ({ proPct, clinicPct }) => (
    <div>
        <div className="flex h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#50e3c2]" style={{ width: `${proPct}%` }} />
            <div className="bg-slate-200 dark:bg-slate-600" style={{ width: `${clinicPct}%` }} />
        </div>
        <div className="flex justify-between text-[9px] text-slate-400 mt-1">
            <span>{proPct}% profesional</span>
            <span>{clinicPct}% clínica</span>
        </div>
    </div>
);

// ── Página principal ──────────────────────────────────────────────────────────
export const BillingPage = () => {
    const { user, activeClinic, hasRole } = useAuth();
    const isOwner = hasRole(['Tech Owner', 'Owner']);

    const {
        kpis, transactions, settlements, rules, loading,
        fetchKPIs, fetchTransactions, createTransaction,
        markPaid, previewSplit,
        fetchSettlements, generateSettlement, approveSettlement,
        fetchRules, updateRule,
    } = useBilling();

    const { patients } = usePatients(activeClinic?.id, user?.id, () => { });

    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [tab, setTab] = useState('overview'); // overview | transactions | settlements | rules | register
    const [typeFilter, setTypeFilter] = useState('');

    // Formulario de registro
    const [form, setForm] = useState({
        transactionType: 'particular',
        patientId: '',
        amountGross: '',
        paymentMethod: 'efectivo',
        transactionDate: now.toISOString().split('T')[0],
        notes: '',
    });
    const [splitPreview, setSplitPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Fetch inicial y al cambiar período
    const reload = useCallback(() => {
        if (!activeClinic?.id) return;
        fetchKPIs(activeClinic.id, year, month);
        fetchTransactions(activeClinic.id, year, month, typeFilter);
        if (isOwner) {
            fetchSettlements(activeClinic.id, year, month);
            fetchRules(activeClinic.id);
        }
    }, [activeClinic?.id, year, month, typeFilter, isOwner]);

    useEffect(() => { reload(); }, [reload]);

    // Preview split en tiempo real
    useEffect(() => {
        if (!form.amountGross || !activeClinic?.id) { setSplitPreview(null); return; }
        const timeout = setTimeout(async () => {
            const preview = await previewSplit(activeClinic.id, form.transactionType, form.amountGross);
            setSplitPreview(preview);
        }, 400);
        return () => clearTimeout(timeout);
    }, [form.amountGross, form.transactionType, activeClinic?.id]);

    const prevMonth = () => {
        if (month === 1) { setYear(y => y - 1); setMonth(12); }
        else setMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (month === 12) { setYear(y => y + 1); setMonth(1); }
        else setMonth(m => m + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.amountGross || parseFloat(form.amountGross) <= 0) {
            toast.error('Ingresá un monto válido');
            return;
        }
        setSubmitting(true);
        try {
            await createTransaction({ ...form, clinicId: activeClinic.id });
            toast.success('Cobro registrado correctamente');
            setForm(f => ({ ...f, amountGross: '', notes: '', patientId: '' }));
            setSplitPreview(null);
            setTab('transactions');
            reload();
        } catch {
            toast.error('Error al registrar el cobro');
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkPaid = async (txId) => {
        try {
            await markPaid(txId);
            toast.success('Transacción marcada como cobrada');
        } catch {
            toast.error('Error al actualizar');
        }
    };

    const handleApprove = async (settlementId, role) => {
        try {
            await approveSettlement(settlementId, role);
            toast.success('Liquidación aprobada');
        } catch {
            toast.error('Error al aprobar');
        }
    };

    const TABS = [
        { id: 'overview', label: 'Resumen' },
        { id: 'transactions', label: 'Transacciones' },
        ...(isOwner ? [
            { id: 'settlements', label: 'Liquidaciones' },
            { id: 'rules', label: 'Reglas de split' },
        ] : []),
        { id: 'register', label: '+ Registrar cobro' },
    ];

    if (!activeClinic?.id) return (
        <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            Seleccioná una clínica para continuar.
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 animate-in fade-in duration-700">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-slate-900 dark:bg-[#50e3c2]/10 rounded-2xl text-white dark:text-[#50e3c2] border border-slate-800 dark:border-[#50e3c2]/20">
                        <CreditCard className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Honorarios y <span className="text-[#50e3c2]">Finanzas</span>
                        </h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">
                            Control de ingresos clínicos · Modelo de split
                        </p>
                    </div>
                </div>

                {/* Selector de período */}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm">
                    <button onClick={prevMonth} className="p-1.5 text-slate-400 hover:text-[#50e3c2] transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 px-3 min-w-[140px] text-center">
                        {MONTHS[month - 1]} {year}
                    </span>
                    <button onClick={nextMonth} className="p-1.5 text-slate-400 hover:text-[#50e3c2] transition-colors">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-8 overflow-x-auto">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all
                            ${tab === t.id
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            } ${t.id === 'register' ? 'text-[#50e3c2]' : ''}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-[#50e3c2]" size={24} />
                </div>
            )}

            {!loading && (
                <>
                    {/* ── RESUMEN ── */}
                    {tab === 'overview' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <KPICard
                                    label="Ingreso bruto"
                                    value={fmt(kpis?.gross_total)}
                                    sub={`${kpis?.transaction_count || 0} transacciones`}
                                />
                                <KPICard
                                    label={isOwner ? 'Comisión clínica' : 'Comisión clínica'}
                                    value={fmt(kpis?.clinic_total)}
                                    accent="text-blue-500"
                                />
                                <KPICard
                                    label="Honorario neto"
                                    value={fmt(kpis?.professional_total)}
                                    accent="text-[#50e3c2]"
                                />
                                <KPICard
                                    label="Pendiente de cobro"
                                    value={fmt(kpis?.pending_total)}
                                    accent={parseFloat(kpis?.pending_total) > 0 ? 'text-amber-500' : ''}
                                />
                            </div>

                            {/* Últimas transacciones */}
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                    Últimas transacciones
                                </p>
                                {transactions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
                                        <Wallet size={36} className="text-slate-200 dark:text-slate-700 mb-4" strokeWidth={1} />
                                        <p className="text-slate-400 text-sm font-medium">Sin transacciones este mes</p>
                                        <button
                                            onClick={() => setTab('register')}
                                            className="mt-4 text-[#50e3c2] text-xs font-black uppercase tracking-widest hover:opacity-70 transition-opacity"
                                        >
                                            Registrar primer cobro →
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                                        {transactions.slice(0, 5).map(tx => (
                                            <div key={tx.id} className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                        {tx.patient_name || 'Sin paciente'}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                                        {new Date(tx.transaction_date).toLocaleDateString('es-AR')} · {tx.payment_method}
                                                    </p>
                                                </div>
                                                <TypeBadge type={tx.transaction_type} />
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{fmt(tx.amount_gross)}</p>
                                                    <p className="text-[11px] text-[#50e3c2]">Neto: {fmt(tx.amount_professional)}</p>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${STATUS_STYLES[tx.status]}`}>
                                                    {tx.status === 'paid' ? 'Cobrado' : 'Pendiente'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── TRANSACCIONES ── */}
                    {tab === 'transactions' && (
                        <div className="space-y-4">
                            {/* Filtros */}
                            <div className="flex gap-2">
                                {['', 'particular', 'os', 'pack'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTypeFilter(t)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all
                                            ${typeFilter === t
                                                ? 'bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 border-transparent'
                                                : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                                    >
                                        {t === '' ? 'Todos' : TYPE_LABELS[t]}
                                    </button>
                                ))}
                            </div>

                            {transactions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
                                    <Receipt size={36} className="text-slate-200 dark:text-slate-700 mb-4" strokeWidth={1} />
                                    <p className="text-slate-400 text-sm">Sin transacciones para este filtro</p>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                                    {/* Header tabla */}
                                    <div className="grid grid-cols-12 px-6 py-3 bg-slate-50 dark:bg-slate-800/60 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <div className="col-span-3">Paciente</div>
                                        <div className="col-span-2">Tipo</div>
                                        <div className="col-span-2">Fecha</div>
                                        <div className="col-span-2 text-right">Bruto</div>
                                        <div className="col-span-2 text-right">Neto</div>
                                        <div className="col-span-1 text-right">Estado</div>
                                    </div>
                                    {transactions.map(tx => (
                                        <div key={tx.id} className="grid grid-cols-12 items-center px-6 py-4 border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                            <div className="col-span-3">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                    {tx.patient_name || '—'}
                                                </p>
                                                {isOwner && (
                                                    <p className="text-[10px] text-slate-400">{tx.professional_name}</p>
                                                )}
                                            </div>
                                            <div className="col-span-2"><TypeBadge type={tx.transaction_type} /></div>
                                            <div className="col-span-2 text-[11px] text-slate-500">
                                                {new Date(tx.transaction_date).toLocaleDateString('es-AR')}
                                            </div>
                                            <div className="col-span-2 text-right text-sm font-bold text-slate-900 dark:text-white">
                                                {fmt(tx.amount_gross)}
                                            </div>
                                            <div className="col-span-2 text-right text-sm font-bold text-[#50e3c2]">
                                                {fmt(tx.amount_professional)}
                                            </div>
                                            <div className="col-span-1 text-right">
                                                {tx.status === 'pending' ? (
                                                    <button
                                                        onClick={() => handleMarkPaid(tx.id)}
                                                        className="text-amber-500 hover:text-emerald-500 transition-colors"
                                                        title="Marcar como cobrada"
                                                    >
                                                        <Clock size={14} />
                                                    </button>
                                                ) : (
                                                    <CheckCircle2 size={14} className="text-emerald-500 ml-auto" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── LIQUIDACIONES ── */}
                    {tab === 'settlements' && isOwner && (
                        <div className="space-y-4">
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                Cada liquidación requiere firma doble — el profesional aprueba primero, luego el Owner cierra el período.
                            </p>
                            {settlements.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
                                    <ShieldCheck size={36} className="text-slate-200 dark:text-slate-700 mb-4" strokeWidth={1} />
                                    <p className="text-slate-400 text-sm mb-4">Sin liquidaciones generadas para este período</p>
                                </div>
                            ) : (
                                settlements.map(s => (
                                    <div key={s.id} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{s.member_name}</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">{MONTHS[s.period_month - 1]} {s.period_year}</p>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider
                                                ${s.status === 'closed'
                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                    : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                                                {s.status === 'closed' ? 'Cerrada' : 'Pendiente firma'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                            {[
                                                { label: 'Ingreso bruto', value: fmt(s.gross_total) },
                                                { label: 'Comisión clínica', value: `-${fmt(s.clinic_fee)}`, accent: 'text-red-500' },
                                                { label: 'Honorario neto', value: fmt(s.net_honorario), accent: 'text-[#50e3c2]' },
                                            ].map(({ label, value, accent }) => (
                                                <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                                                    <p className="text-[10px] text-slate-400 mb-1">{label}</p>
                                                    <p className={`text-base font-bold ${accent || 'text-slate-900 dark:text-white'}`}>{value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                                    <div className={`w-2 h-2 rounded-full ${s.approved_by_member_at ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                                    Profesional: {s.approved_by_member_at ? 'aprobado' : 'pendiente'}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                                    <div className={`w-2 h-2 rounded-full ${s.approved_by_owner_at ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                                    Owner: {s.approved_by_owner_at ? 'aprobado' : 'pendiente'}
                                                </div>
                                            </div>
                                            {s.status !== 'closed' && (
                                                <div className="flex gap-2">
                                                    {!s.approved_by_member_at && (
                                                        <button
                                                            onClick={() => handleApprove(s.id, 'member')}
                                                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                                                        >
                                                            Firmar como profesional
                                                        </button>
                                                    )}
                                                    {!s.approved_by_owner_at && (
                                                        <button
                                                            onClick={() => handleApprove(s.id, 'owner')}
                                                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-all"
                                                        >
                                                            Aprobar como Owner
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ── REGLAS DE SPLIT ── */}
                    {tab === 'rules' && isOwner && (
                        <div className="space-y-3">
                            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                                Las reglas se aplican automáticamente al registrar cada cobro. Los porcentajes deben sumar 100.
                            </p>
                            {rules.map(rule => (
                                <RuleCard
                                    key={rule.id}
                                    rule={rule}
                                    onSave={async (proPct, clinicPct) => {
                                        try {
                                            await updateRule(rule.id, proPct, clinicPct);
                                            toast.success('Regla actualizada');
                                        } catch {
                                            toast.error('Los porcentajes deben sumar 100');
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* ── REGISTRAR COBRO ── */}
                    {tab === 'register' && (
                        <div className="max-w-lg">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Tipo */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                        Tipo de cobro
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { value: 'particular', label: 'Particular' },
                                            { value: 'os', label: 'Obra social' },
                                            { value: 'pack', label: 'Pack' },
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setForm(f => ({ ...f, transactionType: opt.value }))}
                                                className={`py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all
                                                    ${form.transactionType === opt.value
                                                        ? 'bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 border-transparent'
                                                        : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Paciente */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                        Paciente
                                    </label>
                                    <select
                                        value={form.patientId}
                                        onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-[#50e3c2] transition-all dark:text-white"
                                    >
                                        <option value="">Seleccionar paciente...</option>
                                        {(patients || []).map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Monto y fecha */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                            Monto bruto
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="100"
                                                value={form.amountGross}
                                                onChange={e => setForm(f => ({ ...f, amountGross: e.target.value }))}
                                                className="w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-[#50e3c2] transition-all dark:text-white"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                            Fecha
                                        </label>
                                        <input
                                            type="date"
                                            value={form.transactionDate}
                                            onChange={e => setForm(f => ({ ...f, transactionDate: e.target.value }))}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-[#50e3c2] transition-all dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Método de pago */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                        Método de pago
                                    </label>
                                    <select
                                        value={form.paymentMethod}
                                        onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-[#50e3c2] transition-all dark:text-white"
                                    >
                                        <option value="efectivo">Efectivo</option>
                                        <option value="transferencia">Transferencia</option>
                                        <option value="tarjeta">Tarjeta</option>
                                        <option value="os_pendiente">Pendiente cobro OS</option>
                                    </select>
                                </div>

                                {/* Preview split */}
                                {splitPreview && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                            Distribución automática
                                        </p>
                                        <div className="space-y-2 mb-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Monto bruto</span>
                                                <span className="font-bold text-slate-900 dark:text-white">{fmt(splitPreview.gross)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Comisión clínica ({splitPreview.clinicPct}%)</span>
                                                <span className="font-bold text-red-500">−{fmt(splitPreview.amountClinic)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm border-t border-slate-200 dark:border-slate-600 pt-2 mt-2">
                                                <span className="font-bold text-slate-700 dark:text-slate-200">Tu honorario neto</span>
                                                <span className="font-bold text-[#50e3c2] text-base">{fmt(splitPreview.amountProfessional)}</span>
                                            </div>
                                        </div>
                                        <SplitBar proPct={splitPreview.proPct} clinicPct={splitPreview.clinicPct} />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {submitting
                                        ? <Loader2 size={16} className="animate-spin" />
                                        : <TrendingUp size={16} />}
                                    {submitting ? 'Registrando...' : 'Confirmar cobro'}
                                </button>
                            </form>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// ── RuleCard — edición inline de porcentajes ──────────────────────────────────
const RuleCard = ({ rule, onSave }) => {
    const TYPE_ICONS = { particular: '👤', os: '🏥', pack: '📦' };
    const [editing, setEditing] = useState(false);
    const [proPct, setProPct] = useState(parseFloat(rule.professional_pct));
    const [saving, setSaving] = useState(false);
    const clinicPct = 100 - proPct;

    const handleSave = async () => {
        if (proPct <= 0 || proPct >= 100) { toast.error('El porcentaje debe estar entre 1 y 99'); return; }
        setSaving(true);
        try {
            await onSave(proPct, clinicPct);
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {TYPE_LABELS[rule.transaction_type]}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        {rule.trigger_event === 'on_payment' && 'Trigger: al marcar como cobrada'}
                        {rule.trigger_event === 'on_os_payment' && 'Trigger: al recibir pago de la OS'}
                        {rule.trigger_event === 'on_sale' && 'Trigger: al vender el bono'}
                    </p>
                </div>
                <button
                    onClick={() => setEditing(e => !e)}
                    className="p-2 text-slate-400 hover:text-[#50e3c2] transition-colors"
                >
                    <Settings2 size={16} />
                </button>
            </div>

            {editing ? (
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                            <span>Profesional: <strong className="text-slate-900 dark:text-white">{proPct}%</strong></span>
                            <span>Clínica: <strong className="text-slate-900 dark:text-white">{clinicPct}%</strong></span>
                        </div>
                        <input
                            type="range"
                            min="50" max="95" step="5"
                            value={proPct}
                            onChange={e => setProPct(parseInt(e.target.value))}
                            className="w-full accent-[#50e3c2]"
                        />
                    </div>
                    <SplitBar proPct={proPct} clinicPct={clinicPct} />
                    <div className="flex gap-2">
                        <button onClick={() => setEditing(false)} className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </div>
            ) : (
                <SplitBar proPct={parseFloat(rule.professional_pct)} clinicPct={parseFloat(rule.clinic_pct)} />
            )}
        </div>
    );
};