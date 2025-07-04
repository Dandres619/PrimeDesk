import React from "react";
import { FaSearch } from "react-icons/fa";

export const FiltroNombre = ({ filtro, setFiltro }) => {
  return (
    <div className="flex-1 flex items-center gap-2">
      <FaSearch className="text-gray-500" />
      <input
        type="text"
        placeholder="Buscar por nombre del cliente"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};
