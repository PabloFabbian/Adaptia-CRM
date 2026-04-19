import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Calendar as CalendarIcon, RefreshCw, Loader2, Info,
    ExternalLink, MapPin, Clock, ChevronLeft, ChevronRight,
    CheckCircle2, AlertCircle, Link as LinkIcon, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const API = 'http://localhost:3001';

const getToken = () =>
    localStorage.getItem('adaptia_token') ||
    localStorage.getItem('token') ||
    (() => { try { return JSON.parse(localStorage.getItem('adaptia_user'))?.token; } catch { return null; } })();

const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

export const CalendarPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [connected, setConnected] = useState(null); // null = loading
    const [connectionEmail, setConnectionEmail] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Semana actual: array de 7 días desde lunes
    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(selectedDate);
            const day = d.getDay() || 7;
            d.setDate(d.getDate() - day + 1 + i);
            return d;
        });
    }, [selectedDate]);

    /**
     * Verificar status de conexión con el backend
     * Esto persiste porque está guardado en BD
     */
    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`${API}/api/calendar/status`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const data = await res.json();
            setConnected(data.connected);
            setConnectionEmail(data.email);
        } catch (err) {
            console.error('Error fetching status:', err);
            setConnected(false);
        }
    }, []);

    /**
     * Obtener eventos de la semana
     */
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const date = weekDays[0].toISOString().split('T')[0];
            const res = await fetch(`${API}/api/calendar/events?date=${date}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const data = await res.json();
            setConnected(data.connected);
            setEvents(data.data || []);
        } catch (err) {
            console.error('Error fetching events:', err);
            toast.error('Error al cargar eventos');
        } finally {
            setLoading(false);
        }
    }, [weekDays]);

    /**
     * Detectar callback de OAuth
     * El backend ya guardó los tokens, solo confirmamos
     */
    useEffect(() => {
        const connected = searchParams.get('connected');
        const error = searchParams.get('error');

        if (connected === 'true') {
            toast.success('¡Google Calendar conectado correctamente!');
            fetchStatus();
            fetchEvents();
            // Limpiar URL
            navigate('/calendario', { replace: true });
        }
        if (error === 'true') {
            toast.error('Error al conectar Google Calendar');
            navigate('/calendario', { replace: true });
        }
    }, [searchParams, fetchStatus, fetchEvents, navigate]);

    /**
     * Verificar estado al montar
     */
    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    /**
     * Cargar eventos cuando está conectado
     */
    useEffect(() => {
        if (connected) {
            fetchEvents();
        } else if (connected === false) {
            setLoading(false);
        }
    }, [connected, fetchEvents]);

    /**
     * Iniciar flujo OAuth
     */
    const handleConnect = async () => {
        setConnecting(true);
        try {
            const res = await fetch(`${API}/api/calendar/oauth/start`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const data = await res.json();
            window.location.href = data.url;
        } catch (err) {
            toast.error('Error al iniciar conexión con Google');
            setConnecting(false);
        }
    };

    /**
     * Desconectar Google Calendar
     */
    const handleDisconnect = async () => {
        if (!window.confirm('¿Desconectar Google Calendar? Podrás reconectarlo en cualquier momento.')) return;

        try {
            await fetch(`${API}/api/calendar/disconnect`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setConnected(false);
            setEvents([]);
            toast.success('Google Calendar desconectado');
        } catch (err) {
            toast.error('Error al desconectar');
        }
    };

    const prevWeek = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 7);
        setSelectedDate(d);
    };

    const nextWeek = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 7);
        setSelectedDate(d);
    };

    const eventsForDay = (day) =>
        events.filter(e => isSameDay(new Date(e.start), day));

    // Estado: cargando conexión
    if (connected === null) return (
        <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-[#50e3c2]" size={28} />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 animate-in fade-in duration-700 space-y-8">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-900 dark:bg-[#50e3c2] rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 dark:shadow-[#50e3c2]/10 transition-colors duration-500">
                        <CalendarIcon className="w-7 h-7 text-white dark:text-slate-900" strokeWidth={1.5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-[#50e3c2] font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                            {connected ? `Sincronizado: ${connectionEmail || 'Google Calendar'}` : 'Sin conexión'}
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Control de <span className="text-[#50e3c2]">Citas</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {connected ? (
                        <>
                            {/* Navegación semana */}
                            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm">
                                <button onClick={prevWeek} className="p-1 text-slate-400 hover:text-[#50e3c2] transition-colors">
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 px-2">
                                    {weekDays[0].toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} — {weekDays[6].toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                                </span>
                                <button onClick={nextWeek} className="p-1 text-slate-400 hover:text-[#50e3c2] transition-colors">
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            <button
                                onClick={fetchEvents}
                                disabled={loading}
                                className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-[#50e3c2] transition-all shadow-sm disabled:opacity-50"
                                title="Actualizar"
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            </button>

                            {/* Botón desconectar */}
                            <button
                                onClick={handleDisconnect}
                                className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm"
                                title="Desconectar Google Calendar"
                            >
                                <LogOut size={16} />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleConnect}
                            disabled={connecting}
                            className="flex items-center gap-2 bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-lg disabled:opacity-50"
                        >
                            {connecting
                                ? <Loader2 size={14} className="animate-spin" />
                                : <LinkIcon size={14} />}
                            Conectar Google Calendar
                        </button>
                    )}
                </div>
            </header>

            {/* Sin conexión */}
            {!connected && (
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-16 flex flex-col items-center text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-700">
                        <CalendarIcon size={36} className="text-slate-300 dark:text-slate-600" strokeWidth={1} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                        Conectá tu Google Calendar
                    </h3>
                    <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-8">
                        Las citas que agenden tus pacientes en Cal.com se sincronizan automáticamente con tu Google Calendar. Conectalo una sola vez para verlas aquí.
                    </p>
                    <button
                        onClick={handleConnect}
                        disabled={connecting}
                        className="flex items-center gap-2 bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl disabled:opacity-50"
                    >
                        {connecting ? <Loader2 size={16} className="animate-spin" /> : <LinkIcon size={16} />}
                        Conectar ahora
                    </button>
                </div>
            )}

            {/* Grilla semanal */}
            {connected && (
                <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">

                    {/* Cabecera días */}
                    <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-700">
                        {weekDays.map((day, i) => {
                            const isToday = isSameDay(day, new Date());
                            const hasEvents = eventsForDay(day).length > 0;
                            return (
                                <div
                                    key={i}
                                    className={`p-4 text-center border-r last:border-r-0 border-slate-100 dark:border-slate-700
                                        ${isToday ? 'bg-[#50e3c2]/5' : ''}`}
                                >
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                        {day.toLocaleDateString('es-AR', { weekday: 'short' })}
                                    </p>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm font-bold transition-colors
                                        ${isToday
                                            ? 'bg-[#50e3c2] text-slate-900'
                                            : 'text-slate-700 dark:text-slate-200'}`}>
                                        {day.getDate()}
                                    </div>
                                    {hasEvents && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#50e3c2] mx-auto mt-1.5" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Eventos por día */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin text-[#50e3c2] mb-3" size={24} />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cargando eventos...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 min-h-[400px]">
                            {weekDays.map((day, i) => {
                                const dayEvents = eventsForDay(day);
                                const isToday = isSameDay(day, new Date());

                                return (
                                    <div
                                        key={i}
                                        className={`p-3 border-r last:border-r-0 border-slate-100 dark:border-slate-700 space-y-2
                                            ${isToday ? 'bg-[#50e3c2]/3' : ''}`}
                                    >
                                        {dayEvents.length === 0 ? (
                                            <div className="h-full flex items-center justify-center">
                                                <div className="w-1 h-8 bg-slate-100 dark:bg-slate-700 rounded-full" />
                                            </div>
                                        ) : (
                                            dayEvents.map(event => (
                                                <div
                                                    key={event.id}
                                                    className="group bg-[#50e3c2]/10 border border-[#50e3c2]/30 rounded-xl p-2.5 hover:bg-[#50e3c2]/20 transition-all cursor-default"
                                                >
                                                    <p className="text-[10px] font-black text-slate-800 dark:text-slate-100 leading-tight line-clamp-2 mb-1">
                                                        {event.title}
                                                    </p>

                                                    {!event.isAllDay && (
                                                        <div className="flex items-center gap-1 text-[9px] text-slate-500 dark:text-slate-400">
                                                            <Clock size={9} />
                                                            {formatTime(event.start)}
                                                            {event.end && ` — ${formatTime(event.end)}`}
                                                        </div>
                                                    )}

                                                    {event.location && (
                                                        <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5 truncate">
                                                            <MapPin size={9} className="shrink-0" />
                                                            <span className="truncate">{event.location}</span>
                                                        </div>
                                                    )}

                                                    {event.htmlLink && (
                                                        <a
                                                            href={event.htmlLink}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="mt-1.5 flex items-center gap-1 text-[9px] text-[#50e3c2] opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <ExternalLink size={9} /> Ver en Google
                                                        </a>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            {
                connected && events.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle2 size={28} className="text-slate-200 dark:text-slate-700 mb-3" />
                        <p className="text-sm font-bold text-slate-400">Sin citas esta semana</p>
                        <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                            Las citas agendadas en Cal.com aparecerán aquí automáticamente.
                        </p>
                    </div>
                )
            }

            <footer className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Info size={16} className="text-[#50e3c2] shrink-0" />
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Las citas se sincronizan automáticamente desde Cal.com a través de Google Calendar.
                    {connected && ` Conectado como ${connectionEmail}`}
                </p>
            </footer>
        </div >
    );
};