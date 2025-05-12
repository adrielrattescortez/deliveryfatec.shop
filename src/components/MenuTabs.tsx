
import React, { useState } from 'react';

type MenuTabsProps = {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const MenuTabs: React.FC<MenuTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="sticky top-14 z-10 bg-white border-b">
      <div className="overflow-x-auto scrollbar-none">
        <div className="flex whitespace-nowrap px-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`py-3 px-4 text-sm font-medium menu-tab ${
                activeTab === tab ? 'active' : 'text-gray-600'
              }`}
              onClick={() => onTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuTabs;
