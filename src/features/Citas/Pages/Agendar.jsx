import React from "react";
import {
  HiUser,
  HiPhone,
  HiIdentification,
  HiPencilSquare,
  HiCalendarDays,
  HiClock,
  HiWrenchScrewdriver,
} from "react-icons/hi2";

export const Agendar = () => {
  return (
    <main className="min-h-screen bg-[#f3f4f6] py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-[#1f2937] mb-6 text-center">
          Agendar una cita
        </h1>
        <p className="text-sm text-gray-600 text-center mb-10">
          Completa los siguientes datos para programar tu cita en Rafa Motos. Te
          contactaremos si es necesario.
        </p>

        <form className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-1">
                <HiUser className="text-blue-500" /> Nombre completo
              </label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-1">
                <HiPhone className="text-blue-500" /> Número de contacto
              </label>
              <input
                type="tel"
                placeholder="Ej. 3001234567"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-1">
              <HiIdentification className="text-blue-500" />
              Placa de la moto
            </label>
            <input
              type="text"
              placeholder="Ej. ABC123"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-1">
              <HiIdentification className="text-blue-500" />
              Referencia de la moto
            </label>
            <input
              type="text"
              placeholder="Yamaha FZ 2.0"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-1">
              <HiPencilSquare className="text-blue-500" />
              Motivo de la cita
            </label>
            <textarea
              placeholder="Ej. Revisión general, cambio de aceite..."
              rows="4"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-1">
                <HiCalendarDays className="text-blue-500" />
                Fecha preferida
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-1">
                <HiClock className="text-blue-500" />
                Hora estimada
              </label>
              <select className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Selecciona una hora</option>
                <option>8:00 AM</option>
                <option>9:00 AM</option>
                <option>10:00 AM</option>
                <option>11:00 AM</option>
                <option>2:00 PM</option>
                <option>3:00 PM</option>
                <option>4:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-1">
              <HiWrenchScrewdriver className="text-blue-500" />
              Mecánico asignado
            </label>
            <select
              defaultValue="Johan Castillo"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Johan Castillo">Johan Castillo</option>
            </select>
          </div>

          <div className="pt-6 text-center">
            <button
              type="submit"
              className="bg-[#2563eb] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1d4ed8] transition duration-300 shadow-md cursor-pointer"
            >
              Confirmar cita
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};
