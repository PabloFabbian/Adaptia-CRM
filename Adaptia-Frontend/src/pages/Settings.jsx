import { User, Mail, Fingerprint, Camera, Briefcase, Star, Save, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Settings = () => {
    const { user } = useAuth();
    const fileInputRef = useRef(null);

    // Estados de carga
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Estados de datos
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [specialty, setSpecialty] = useState(user?.specialty || '');
    const [previewAvatar, setPreviewAvatar] = useState(null);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setBio(user.bio || '');
            setSpecialty(user.specialty || '');
        }
    }, [user]);

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) return toast.error("Selecciona una imagen válida.");
        if (file.size > 2 * 1024 * 1024) return toast.error("La imagen debe ser menor a 2MB.");

        const objectUrl = URL.createObjectURL(file);
        setPreviewAvatar(objectUrl);

        setIsUploading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success("Foto de perfil actualizada correctamente");
        } catch (error) {
            toast.error("Error al subir la imagen");
            setPreviewAvatar(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Perfil actualizado", {
                description: "Tus cambios se han guardado con éxito."
            });
        } catch (error) {
            toast.error("No se pudieron guardar los cambios");
        } finally {
            setIsSaving(false);
        }
    };

    // Estilos comunes para etiquetas
    const labelClass = "text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2";
    const inputClass = "w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-[#50e3c2] transition-all dark:text-white placeholder:text-slate-400";

    return (
        <div className="max-w-6xl mx-auto px-6 pt-8 pb-20 animate-in fade-in duration-700">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />

            {/* Header Estilo Expediente */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-[#50e3c2]" />
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                            Configuración de Cuenta
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Mi <span className="text-[#50e3c2]">Perfil</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Gestiona tu identidad profesional y biografía pública.
                    </p>
                </div>

                <button
                    onClick={handleSaveProfile}
                    disabled={isSaving || isUploading}
                    className="flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl hover:opacity-90 disabled:opacity-50 active:scale-95 shrink-0"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Guardar Cambios
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* COLUMNA IZQUIERDA - Avatar & Identidad */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-10 shadow-sm flex flex-col items-center text-center">
                        <div className="relative group cursor-pointer mb-6" onClick={handleAvatarClick}>
                            <div className="w-36 h-36 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 p-1.5 transition-transform group-hover:rotate-3 duration-500">
                                <div className="w-full h-full rounded-[2.2rem] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden relative border-2 border-slate-200 dark:border-slate-700">
                                    {isUploading ? (
                                        <Loader2 className="animate-spin text-[#50e3c2]" size={32} />
                                    ) : (previewAvatar || user?.avatar) ? (
                                        <img src={previewAvatar || user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-5xl font-black text-slate-200 dark:text-slate-700">{name?.charAt(0) || 'U'}</span>
                                    )}

                                    {/* Overlay Camera */}
                                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                                        <Camera className="text-[#50e3c2]" size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{name || 'Sin Nombre'}</h2>
                        <span className="mt-2 text-[10px] font-black text-[#50e3c2] uppercase tracking-[0.2em] bg-[#50e3c2]/10 px-4 py-1.5 rounded-full">
                            {user?.role_name || 'Especialista'}
                        </span>
                    </div>

                    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                        <h3 className={labelClass}>
                            <Fingerprint size={12} className="text-[#50e3c2]" /> Identidad Digital
                        </h3>
                        <div className="mt-4 flex items-center gap-4 px-5 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <Mail size={16} className="text-slate-400" />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 break-all">
                                {user?.email}
                            </span>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA - Formulario */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-10 shadow-sm relative overflow-hidden">
                        {/* Indicador de sección 01 */}
                        <div className="absolute top-0 right-0 p-8 text-4xl font-black text-slate-50 dark:text-slate-800/20 select-none">
                            01
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#50e3c2]" />
                            Información Profesional
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-2">
                                <label className={labelClass}>Nombre Completo</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={`${inputClass} pl-12`}
                                        placeholder="Tu nombre"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className={labelClass}>Especialidad</label>
                                <div className="relative">
                                    <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        value={specialty}
                                        onChange={(e) => setSpecialty(e.target.value)}
                                        className={`${inputClass} pl-12`}
                                        placeholder="Ej: Psicología Clínica"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={labelClass}>Biografía Profesional</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows="6"
                                placeholder="Cuéntales un poco sobre tu enfoque terapéutico, experiencia y formación..."
                                className={`${inputClass} resize-none leading-relaxed py-5`}
                            />
                            <p className="text-[10px] text-slate-400 mt-2 italic">
                                * Esta información será visible para tus pacientes al momento de agendar.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;