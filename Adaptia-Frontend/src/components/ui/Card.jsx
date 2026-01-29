export const Card = ({ children, title, extra, className = "" }) => {
    return (
        <div className={`bg-white dark:bg-dark-surface border border-[#e5e5e3] dark:border-dark-border rounded-[2rem] overflow-hidden shadow-sm ${className}`}>
            {(title || extra) && (
                <div className="px-6 py-5 border-b border-[#e5e5e3] dark:border-dark-border flex justify-between items-center">
                    {title && (
                        <h3 className="font-bold text-gray-800 dark:text-white text-sm tracking-tight uppercase">
                            {title}
                        </h3>
                    )}
                    {extra && <div className="flex items-center">{extra}</div>}
                </div>
            )}
            <div className="w-full">{children}</div>
        </div>
    );
};