import React from "react";
import { FaCalendarAlt, FaTools, FaCheckCircle } from "react-icons/fa";

export const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-[#f3f4f6] px-4 sm:px-6 lg:px-8 py-10 text-[#1f2937]">
      <div className="max-w-7xl mx-auto">

        <div className="bg-white rounded-xl shadow p-6 mb-10 text-center sm:text-left">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">
            ¡Hola, Administrador!
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Desde aquí puedes gestionar las citas, el estado de los servicios y
            la información general del taller. Revisa los datos más importantes
            de hoy a continuación.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full text-xl">
              <FaCalendarAlt />
            </div>
            <div>
              <p className="text-sm text-gray-500">Citas agendadas hoy</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
            <div className="bg-yellow-100 text-yellow-600 p-3 rounded-full text-xl">
              <FaTools />
            </div>
            <div>
              <p className="text-sm text-gray-500">Servicios pendientes</p>
              <p className="text-2xl font-bold">5</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
            <div className="bg-green-100 text-green-600 p-3 rounded-full text-xl">
              <FaCheckCircle />
            </div>
            <div>
              <p className="text-sm text-gray-500">Servicios finalizados</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500 text-sm sm:text-base">
            <span className="block">Gráfica de desempeño general</span>
            <span className="text-xs text-gray-400">Próximamente</span>
          </div>
        </div>
      </div>
    </div>
  );
};
