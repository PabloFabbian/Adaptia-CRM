export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer active:scale-95";

    const variants = {
        primary: "bg-gray-900 dark:bg-adaptia-blue text-white border-transparent hover:opacity-90 shadow-lg shadow-adaptia-blue/10",
        secondary: "bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border-[#e5e5e3] dark:border-dark-border hover:bg-gray-50 dark:hover:bg-white/10",
        ghost: "border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};