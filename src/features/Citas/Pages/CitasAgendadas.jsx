import React, { useState } from "react";
import { FiltroNombre } from "../Components/FiltroNombre";
import { FiltroEstado } from "../Components/FiltroEstado";
import { CitasTable } from "../Components/CitasTable";

export const CitasAgendadas = () => {
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const citasMock = [
    {
      cliente: "Juan Pérez",
      contacto: "3001234567",
      placa: "ABC123",
      fecha: "2025-07-05",
      hora: "10:00 AM",
      motivo: "Cambio de aceite",
      estado: "Pendiente",
    },
    {
      cliente: "Laura Gómez",
      contacto: "3019876543",
      placa: "XYZ789",
      fecha: "2025-07-05",
      hora: "11:30 AM",
      motivo: "Revisión general",
      estado: "Atendida",
    },
    {
      cliente: "Carlos Ríos",
      contacto: "3005558888",
      placa: "JKL456",
      fecha: "2025-07-06",
      hora: "09:00 AM",
      motivo: "Frenos",
      estado: "No atendida",
    },
  ];

  const estados = ["", "Pendiente", "Atendida", "No atendida"];

  const citasFiltradas = citasMock.filter((cita) => {
    return (
      cita.cliente.toLowerCase().includes(filtroNombre.toLowerCase()) &&
      (filtroEstado === "" || cita.estado === filtroEstado)
    );
  });

  return (
    <main className="min-h-screen bg-gray-100 rounded-xl py-16 px-4">
      <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Citas Agendadas
        </h1>
        <p className="text-center text-sm text-gray-500 mb-8">
          Visualiza y filtra las solicitudes de servicio programadas por los clientes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
          <FiltroNombre filtro={filtroNombre} setFiltro={setFiltroNombre} />
          <FiltroEstado filtro={filtroEstado} setFiltro={setFiltroEstado} estados={estados} />
        </div>

        <CitasTable citas={citasFiltradas} />
      </div>
    </main>
  );
};
