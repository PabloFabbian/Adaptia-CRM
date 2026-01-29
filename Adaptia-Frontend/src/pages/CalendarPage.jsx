import { Calendar as CalendarIcon } from 'lucide-react';

export const CalendarPage = () => (
    <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-[#50e3c2] rounded-xl text-gray-900 shadow-lg shadow-[#50e3c2]/20">
                <CalendarIcon className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendario Maestro</h1>
        </header>
        <div className="bg-white dark:bg-[#101828] border rounded-2xl p-12 text-center border-dashed border-gray-300 dark:border-gray-800">
            <div className="w-16 h-16 bg-[#50e3c2]/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="text-[#50e3c2] opacity-40" />
            </div>
            <p className="text-gray-400 dark:text-gray-500 font-medium">Vista de calendario mensual en desarrollo...</p>
        </div>
    </div>
);