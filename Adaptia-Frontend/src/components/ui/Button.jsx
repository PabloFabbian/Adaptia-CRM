export const Button = ({ children, variant = 'primary', ...props }) => {
    // Estilos base: fuente pequeña, bordes redondeados y transición suave
    const baseStyles = "px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 border cursor-pointer";

    const variants = {
        // Botón negro de la imagen (+ Nuevo rol)
        primary: "bg-black text-white border-black hover:bg-gray-800 active:scale-95",

        // Botón blanco con borde gris
        secondary: "bg-white text-gray-700 border-[#e5e5e3] hover:bg-gray-50 active:scale-95",

        // Botón sin fondo ni borde
        ghost: "border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]}`}
            {...props}
        >
            {children}
        </button>
    );
};