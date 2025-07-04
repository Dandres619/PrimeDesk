import React from "react";

const getColorEstado = (estado) => {
  switch (estado) {
    case "Pendiente":
      return "bg-yellow-100 text-yellow-800";
    case "Atendida":
      return "bg-green-100 text-green-800";
    case "No atendida":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const CitasTable = ({ citas }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
        <thead className="bg-gray-50 text-gray-700 font-semibold">
          <tr>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Teléfono</th>
            <th className="px-4 py-3">Placa</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Hora</th>
            <th className="px-4 py-3">Motivo</th>
            <th className="px-4 py-3">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {citas.length > 0 ? (
            citas.map((cita, i) => (
              <tr key={i} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">{cita.cliente}</td>
                <td className="px-4 py-3">{cita.contacto}</td>
                <td className="px-4 py-3">{cita.placa}</td>
                <td className="px-4 py-3">{cita.fecha}</td>
                <td className="px-4 py-3">{cita.hora}</td>
                <td className="px-4 py-3">{cita.motivo}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full font-medium text-xs ${getColorEstado(
                      cita.estado
                    )}`}
                  >
                    {cita.estado}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-6 text-gray-400">
                No se encontraron citas con los filtros aplicados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
