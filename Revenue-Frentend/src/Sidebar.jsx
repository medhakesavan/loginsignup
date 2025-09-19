import React, { useState } from "react";
import { LayoutDashboard, LandmarkIcon, BarChart3, ChevronLeft } from "lucide-react";

const Sidebar = () => {
  const currentPath = window.location.pathname;
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Income", icon: LayoutDashboard, page: "/dashboard" },
    { name: "expenditure", icon: LandmarkIcon, page: "/expenditure" },
    // { name: "analytics", icon: BarChart3, page: "/analytics" },
  ];

  return (
    <div
      className={`group fixed top-0 left-0 z-50 h-screen overflow-hidden bg-[#0d0b37] text-white p-6 transition-all duration-300 ease-in-out md:static ${
        isOpen ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex justify-between items-center mb-10">
        <h1 className={`text-2xl font-bold tracking-wide transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>CONCEPT</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
        >
          <ChevronLeft className={`w-6 h-6 transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`} />
        </button>
      </div>
      <ul className="space-y-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.name}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                currentPath === item.page
                  ? "bg-blue-600 text-white shadow-lg"
                  : "hover:bg-blue-600/20 hover:text-blue-200"
              }`}
              onClick={() => {
                window.location.pathname = item.page;
              }}
            >
              <Icon size={20} className="w-6 shrink-0" />
              <span className={`capitalize transition-opacity duration-300 whitespace-nowrap ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                {item.name}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;