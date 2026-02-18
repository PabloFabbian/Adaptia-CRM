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

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#50e3c2] rounded-2xl text-gray-900 shadow-xl shadow-[#50e3c2]/20">
                        <User className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-light dark:text-white">Mi <span className="font-bold">Perfil</span></h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Gestiona tu identidad profesional</p>
                    </div>
                </div>

                <button
                    onClick={handleSaveProfile}
                    disabled={isSaving || isUploading}
                    className="flex items-center gap-2 px-6 py-3 bg-[#50e3c2] hover:bg-[#40b39a] text-gray-900 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-[#50e3c2]/20 disabled:opacity-50 active:scale-95"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Guardar Cambios
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COLUMNA IZQUIERDA */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-[#161f31] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center text-center">
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            <div className="w-32 h-32 rounded-[2.2rem] bg-gradient-to-tr from-[#50e3c2] to-teal-600 p-1 transition-transform group-hover:scale-105">
                                <div className="w-full h-full rounded-[2rem] bg-white dark:bg-[#101828] flex items-center justify-center overflow-hidden border-4 border-white dark:border-[#161f31]">
                                    {isUploading ? (
                                        <Loader2 className="animate-spin text-[#50e3c2]" size={30} />
                                    ) : (previewAvatar || user?.avatar) ? (
                                        <img src={previewAvatar || user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-black text-[#50e3c2]">{name?.charAt(0)}</span>
                                    )}
                                </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                                <Camera className="text-white" size={24} />
                            </div>
                        </div>
                        <h2 className="mt-4 text-xl font-bold dark:text-white">{name || 'Usuario Adaptia'}</h2>
                        <p className="text-[#50e3c2] text-[10px] font-black uppercase tracking-[0.2em] mt-2 bg-[#50e3c2]/10 px-4 py-1.5 rounded-full inline-block">
                            {user?.role_name || 'Especialista'}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#161f31] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-6 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                            <Mail size={14} className="text-[#50e3c2]" /> Identidad Digital
                        </h3>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 break-all bg-gray-50 dark:bg-[#101828] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                            <Fingerprint size={14} className="opacity-50 text-[#50e3c2]" />
                            {user?.email}
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-[#161f31] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                            <Briefcase size={18} className="text-[#50e3c2]" />
                            Información Pública
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 mb-2 block">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-[#101828] border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:border-[#50e3c2] transition-all dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 mb-2 block">Especialidad</label>
                                <div className="relative">
                                    <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        value={specialty}
                                        onChange={(e) => setSpecialty(e.target.value)}
                                        placeholder="Ej: Psicología Clínica"
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-[#101828] border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:border-[#50e3c2] dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 mb-2 block">Biografía Profesional</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows="4"
                                placeholder="Cuéntales un poco sobre tu enfoque terapéutico..."
                                className="w-full p-5 bg-gray-50 dark:bg-[#101828] border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:border-[#50e3c2] resize-none dark:text-white leading-relaxed"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;