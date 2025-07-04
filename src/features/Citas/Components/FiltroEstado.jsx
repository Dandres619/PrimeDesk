import React from "react";
import { FaFilter } from "react-icons/fa";

export const FiltroEstado = ({ filtro, setFiltro, estados }) => {
  return (
    <div className="flex items-center gap-2">
      <FaFilter className="text-gray-500" />
      <select
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
      >
        {estados.map((estado, i) => (
          <option key={i} value={estado}>
            {estado === "" ? "Todos los estados" : estado}
          </option>
        ))}
      </select>
    </div>
  );
};
