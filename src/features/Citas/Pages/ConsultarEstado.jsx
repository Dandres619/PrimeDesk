import React, { useState } from "react";
import {
  FaSearch,
  FaMotorcycle,
  FaUser,
  FaClipboardList,
  FaUndoAlt,
} from "react-icons/fa";

export const ConsultarEstado = () => {
  const [placa, setPlaca] = useState("");
  const [datosCita, setDatosCita] = useState(null);
  const [error, setError] = useState("");

  const citasMock = [
    {
      placa: "ABC123",
      cliente: "Juan Pérez",
      referencia: "Yamaha FZ 2.0",
      estado: "Pendiente",
    },
    {
      placa: "XYZ789",
      cliente: "Laura Gómez",
      referencia: "Honda CB 160",
      estado: "Lista para entrega",
    },
  ];

  const getColorEstado = (estado) => {
    switch (estado) {
      case "Lista para entrega":
        return "bg-green-100 text-green-800";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleBuscar = (e) => {
    e.preventDefault();

    if (placa.trim() === "") {
      setError("Por favor ingresa una placa antes de buscar.");
      setDatosCita(null);
      return;
    }

    const resultado = citasMock.find(
      (cita) => cita.placa.toUpperCase() === placa.toUpperCase()
    );

    if (resultado) {
      setDatosCita(resultado);
      setError("");
    } else {
      setDatosCita(null);
      setError("No se encontró ninguna cita asociada a esa placa.");
    }
  };

  const handleReset = () => {
    setPlaca("");
    setDatosCita(null);
    setError("");
  };

  return (
    <main className="min-h-screen bg-[#f3f4f6] py-16 px-4">
      <div className="max-w-xl mx-auto bg-white shadow-xl rounded-xl p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-[#1f2937] mb-6 text-center">
          Consultar estado de la moto
        </h1>
        <p className="text-sm text-gray-600 text-center mb-8">
          Ingresa la placa de tu motocicleta para ver el estado actual de la misma.
        </p>

        <form onSubmit={handleBuscar} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Ej. ABC123"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            className={`flex-1 border ${
              error ? "border-red-500" : "border-gray-300"
            } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <button
            type="submit"
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-2 rounded-md font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <FaSearch /> Buscar
          </button>
        </form>

        {error && (
          <div className="mt-4 text-red-600 text-center text-sm font-medium">
            {error}
          </div>
        )}

        {datosCita && (
          <div className="mt-10 bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3 text-gray-700">
              <FaMotorcycle className="text-blue-600" />
              <p>
                <strong>Placa:</strong> {datosCita.placa}
              </p>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <FaUser className="text-blue-600" />
              <p>
                <strong>Cliente:</strong> {datosCita.cliente}
              </p>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <FaClipboardList className="text-blue-600" />
              <p>
                <strong>Referencia:</strong> {datosCita.referencia}
              </p>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <FaClipboardList className="text-blue-600" />
              <p className="flex items-center gap-2">
                <strong>Estado:</strong>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getColorEstado(
                    datosCita.estado
                  )}`}
                >
                  {datosCita.estado}
                </span>
              </p>
            </div>
            <div className="pt-4 text-center">
              <button
                onClick={handleReset}
                className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-1 cursor-pointer"
              >
                <FaUndoAlt /> Consultar otra placa
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
