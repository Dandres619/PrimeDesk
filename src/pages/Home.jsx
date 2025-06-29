import React from "react";
import { Link } from "react-router-dom";
import {
  HiCalendarDays,
  HiMagnifyingGlass,
  HiClipboardDocumentList,
  HiBolt,
  HiArrowPathRoundedSquare,
  HiCheckBadge,
} from "react-icons/hi2";
import imagen_reparacion from "../assets/Taller/imagen-reparacion.jpeg";

export const Home = () => {
  const beneficios = [
    {
      titulo: "Agenda sin filas",
      desc: "Desde tu celular eliges el día y hora sin necesidad de venir al taller.",
      icono: <HiCalendarDays className="text-4xl text-[#2563eb]" />,
    },
    {
      titulo: "Sigue el estado",
      desc: "Consulta si tu moto está pendiente, en reparación o lista para entrega.",
      icono: <HiMagnifyingGlass className="text-4xl text-[#2563eb]" />,
    },
    {
      titulo: "Historial guardado",
      desc: "Cada visita queda registrada para futuras consultas y mantenimientos.",
      icono: <HiClipboardDocumentList className="text-4xl text-[#2563eb]" />,
    },
    {
      titulo: "Atención más ágil",
      desc: "El técnico conoce tu solicitud antes de recibir la moto.",
      icono: <HiBolt className="text-4xl text-[#2563eb]" />,
    },
    {
      titulo: "Sin repetir datos",
      desc: "Ya no tendrás que repetir tus datos o contar lo mismo cada vez que vengas.",
      icono: <HiArrowPathRoundedSquare className="text-4xl text-[#2563eb]" />,
    },
    {
      titulo: "Más confianza",
      desc: "Transparencia en todo el proceso: lo que se hace, cuándo y por qué.",
      icono: <HiCheckBadge className="text-4xl text-[#2563eb]" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#111827] font-sans">
      <section className="bg-[#1f2937] text-white py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              Tu moto en manos confiables.
            </h1>
            <p className="text-lg md:text-xl font-light text-gray-300 mb-6">
              Con Rafa Motos puedes agendar tu cita, revisar el estado de tu
              moto y obtener una atención clara y profesional, todo desde la
              comodidad de tu hogar.
            </p>
            <Link
              to="/agendar"
              className="inline-block bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-6 py-3 rounded-full shadow transition duration-300"
            >
              Agendar cita ahora
            </Link>
          </div>
          <div className="hidden md:block">
            <img
              src={imagen_reparacion}
              alt="Motocicleta en taller"
              className="rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-14 text-[#1f2937]">
          ¿Por qué usar nuestro sistema?
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {beneficios.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition duration-300"
            >
              <div className="mb-3 flex justify-center">{item.icono}</div>
              <h3 className="text-xl font-semibold mb-2 text-[#1f2937]">
                {item.titulo}
              </h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#1f2937] to-[#374151] text-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Nuestro compromiso contigo
          </h2>
          <p className="text-lg font-light mb-6">
            En Rafa Motos valoramos tu tiempo, tu seguridad y tu confianza. Este
            sistema está diseñado para darte una experiencia moderna, ordenada y
            sin complicaciones.
          </p>
          <Link
            to="/agendar"
            className="bg-white text-[#1f2937] px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
          >
            Reservar mi cita ahora
          </Link>
        </div>
      </section>
    </div>
  );
};
