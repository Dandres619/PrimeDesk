import React from "react";
import { Link, NavLink } from "react-router-dom";

export const Header = () => {
  return (
    <header className="w-full bg-[#f9fafb] border-b border-gray-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-bold text-[#1f2937] tracking-tight"
        >
          Rafa Motos
        </Link>

        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          {[
            { path: "/", label: "Inicio" },
            { path: "/agendar", label: "Agendar Cita" },
            { path: "/estado", label: "Consultar estado de cita" },
            { path: "/contacto", label: "Contacto" },
          ].map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-1 rounded-md transition font-medium ${
                  isActive
                    ? "bg-[#e5e7eb] text-[#1f2937]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-[#1f2937]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};
