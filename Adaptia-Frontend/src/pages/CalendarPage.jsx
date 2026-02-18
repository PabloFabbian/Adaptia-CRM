import { useMemo, useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Info, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CalendarPage = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    // Detectamos si el usuario tiene activado el modo oscuro en el sistema o via clase .dark
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

    // Escuchador por si cambian el modo oscuro mientras están en la página
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const isSecretaria = user?.role === 'Secretaría' || user?.role === 'admin';

    const calendarUrl = useMemo(() => {
        // En el URL, cambiamos el bgcolor según el modo
        const bgColor = isDarkMode ? '333333' : 'ffffff';
        const base = `https://calendar.google.com/calendar/embed?src=pablo.fabbian@gmail.com&ctz=America%2FArgentina%2FBuenos_Aires&showPrint=0&showTabs=1&showCalendars=1&bgcolor=%23${bgColor}`;

        return isSecretaria ? `${base}&mode=AGENDA&showNav=1` : `${base}&mode=WEEK&showNav=0`;
    }, [isSecretaria, isDarkMode]);

    return (
        <div className="max-w-7xl mx-auto px-4 pt-0 space-y-6 animate-in fade-in duration-700">
            <header className="flex items-center gap-4">
                <div className="p-3 bg-[#50e3c2] rounded-2xl text-gray-900 shadow-lg shadow-[#50e3c2]/20">
                    <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-light dark:text-white">
                        Panel de <span className="font-bold">Control de Citas</span>
                    </h1>
                    <p className="text-sm text-gray-500">Sincronización directa con Google Calendar</p>
                </div>
            </header>

            {/* Contenedor del Iframe */}
            <div className={`p-6 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[750px] relative border transition-colors duration-500 
                ${isDarkMode ? 'bg-[#212428] border-white/5' : 'bg-[#F0F4F9] border-gray-100'}`}>

                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-[#1a1a1a] z-10">
                        <Loader2 className="w-8 h-8 text-[#50e3c2] animate-spin" />
                    </div>
                )}

                <iframe
                    src={calendarUrl}
                    width="100%"
                    height="700px"
                    frameBorder="0"
                    onLoad={() => setIsLoading(false)}
                    /* LA MAGIA: 
                       1. invert(90%) invierte casi todo el blanco a gris muy oscuro.
                       2. hue-rotate(180deg) corrige los colores de las etiquetas de las citas para que no se vean opuestos.
                    */
                    className={`transition-all duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'} 
                        ${isDarkMode ? 'invert-[0.9] hue-rotate-180 contrast-100' : ''}`}
                    style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }}
                />
            </div>
        </div>
    );
};