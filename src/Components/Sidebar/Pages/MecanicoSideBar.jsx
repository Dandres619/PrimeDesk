import React from "react";
import { NavItem } from "../Components/NavItem";
import { Calendar, LogOut} from "lucide-react";

export const MecanicoSideBar = ({ open, onClose }) => {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed sm:static top-0 left-0 z-50 w-64 h-full bg-white border-r border-gray-200 shadow-md transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}`}
      >
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="px-6 py-5 border-b border-gray-100">
              <h1 className="text-xl font-bold text-[#1f2937] tracking-tight">
                Rafa Motos
              </h1>
              <p className="text-sm text-gray-500">Panel de mecánicos</p>
            </div>

            <nav className="flex flex-col gap-1 mt-6 px-4">
              <NavItem
                to="/mecanico"
                icon={<Calendar size={18} />}
                label="Citas"
              />
            </nav>
          </div>

          <div className="p-4 border-t border-gray-100">
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition cursor-pointer">
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};