export const Tabs = ({ tabs, activeTab, onChange }) => {
    return (
        <div className="flex items-center gap-6 border-b border-[#e5e5e3] dark:border-dark-border mb-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`pb-3 text-sm font-medium transition-all relative cursor-pointer whitespace-nowrap outline-none ${isActive
                            ? "text-black dark:text-adaptia-mint"
                            : "text-[#a1a19f] hover:text-gray-600 dark:hover:text-gray-300"
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            {tab.icon}
                            {tab.label}
                        </span>
                        {isActive && (
                            <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-black dark:bg-adaptia-mint shadow-[0_0_10px_rgba(80,227,194,0.4)] animate-in fade-in zoom-in duration-300" />
                        )}
                    </button>
                );
            })}
        </div>
    );
};