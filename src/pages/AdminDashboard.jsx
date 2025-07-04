import React from "react";
import { FaCalendarAlt, FaTools, FaCheckCircle } from "react-icons/fa";

const StatCard = ({ icon, title, value, iconBg, iconColor }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center gap-4">
    <div className={`p-3 rounded-full text-xl ${iconBg} ${iconColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-[#f9fafb] px-4 sm:px-6 lg:px-8 py-10 text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow p-6 mb-10 text-center sm:text-left border border-gray-200">
          <h2 className="text-xl font-semibold mb-2">¡Hola, Administrador!</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Desde aquí puedes gestionar las citas, el estado de los servicios y
            la información general del taller.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={<FaCalendarAlt />}
            title="Citas agendadas hoy"
            value="8"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={<FaTools />}
            title="Servicios pendientes"
            value="5"
            iconBg="bg-yellow-100"
            iconColor="text-yellow-600"
          />
          <StatCard
            icon={<FaCheckCircle />}
            title="Servicios finalizados"
            value="12"
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
        </div>

        <div className="mt-10">
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500 text-sm sm:text-base border border-gray-200">
            <span className="block">Gráfica de desempeño general</span>
            <span className="text-xs text-gray-400">Próximamente</span>
          </div>
        </div>
      </div>
    </div>
  );
};
