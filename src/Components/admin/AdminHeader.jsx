import React from "react";
import { NavLink } from "react-router-dom";
import { LogOut, Settings, Calendar } from "lucide-react";

export const AdminHeader = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1f2937] text-center sm:text-left">
          Panel Administrativo - Rafa Motos
        </h1>

        <nav className="flex flex-wrap justify-center sm:justify-end items-center gap-3 text-sm font-medium">
          <NavLink
            to="/admin/citas"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1 rounded-md transition ${
                isActive
                  ? "bg-[#2563eb] text-white"
                  : "text-gray-600 hover:text-[#1f2937] hover:bg-gray-100"
              }`
            }
          >
            <Calendar size={16} />
            Citas
          </NavLink>

          <NavLink
            to="/admin/configuracion"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1 rounded-md transition ${
                isActive
                  ? "bg-[#2563eb] text-white"
                  : "text-gray-600 hover:text-[#1f2937] hover:bg-gray-100"
              }`
            }
          >
            <Settings size={16} />
            Configuración
          </NavLink>

          <button className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition text-sm px-3 py-1 cursor-pointer">
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </nav>
      </div>
    </header>
  );
};
