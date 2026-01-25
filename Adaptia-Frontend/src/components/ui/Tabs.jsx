import { useState } from 'react';

export const Tabs = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState(tabs[2].id); // tabs[2] es "Roles" en tu lista, para que aparezca activo al cargar

    return (
        <div className="flex items-center gap-6 border-b border-[#e5e5e3] mb-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-2 text-sm font-medium transition-all relative cursor-pointer whitespace-nowrap ${activeTab === tab.id
                        ? "text-black after:absolute after:bottom-[-1px] after:left-0 after:w-full after:h-[2px] after:bg-black after:z-10"
                        : "text-[#a1a19f] hover:text-gray-600"
                        }`}
                >
                    <span className="flex items-center gap-2">
                        {tab.icon && <span className="text-base">{tab.icon}</span>}
                        {tab.label}
                    </span>
                </button>
            ))}
        </div>
    );
};