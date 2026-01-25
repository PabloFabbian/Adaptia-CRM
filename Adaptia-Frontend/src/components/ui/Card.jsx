export const Card = ({ children, title, extra }) => {
    return (
        <div className="bg-white border border-[#e5e5e3] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            {/* Cabecera de la tarjeta (opcional) */}
            {(title || extra) && (
                <div className="px-6 py-4 border-b border-[#e5e5e3] flex justify-between items-center bg-white">
                    {title && (
                        <h3 className="font-semibold text-gray-800 text-sm tracking-tight">
                            {title}
                        </h3>
                    )}
                    {extra && <div className="flex items-center">{extra}</div>}
                </div>
            )}

            {/* Cuerpo de la tarjeta */}
            <div className="w-full">
                {children}
            </div>
        </div>
    );
};