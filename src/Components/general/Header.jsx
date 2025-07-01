import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

export const Header = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const toggleMenu = () => setMenuAbierto(!menuAbierto);
  const closeMenu = () => setMenuAbierto(false);

  const links = [
    { path: "/", label: "Inicio" },
    { path: "/agendar", label: "Agendar Cita" },
    { path: "/estado", label: "Consultar estado de cita" },
    { path: "/contacto", label: "Contacto" },
  ];

  return (
    <header className="w-full bg-[#f9fafb] border-b border-gray-300 shadow-sm z-50 relative">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-bold text-[#1f2937] tracking-tight"
        >
          Rafa Motos
        </Link>

        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          {links.map((item, index) => (
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

        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-700 text-xl focus:outline-none"
        >
          {menuAbierto ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {menuAbierto && (
        <div className="md:hidden px-6 pb-4">
          <nav className="flex flex-col space-y-2 text-sm font-medium bg-white rounded-lg shadow p-4 border border-gray-200 animate-fade-in">
            {links.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md transition ${
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
      )}
    </header>
  );
};
