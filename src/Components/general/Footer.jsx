import React from "react";
import { Link } from "react-router-dom";
import { HiMapPin, HiPhone, HiEnvelope } from "react-icons/hi2";

export const Footer = () => {
  return (
    <footer className="bg-[#1f2937] text-gray-300 px-6 py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Rafa Motos</h3>
          <p className="text-sm leading-relaxed">
            Taller especializado en mantenimiento y reparación de motocicletas
            de bajo y alto cilindraje. Atención profesional, confiable y rápida.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <HiMapPin className="text-lg text-gray-400" />
              Carrera 54 #96a-17
            </p>
            <p className="flex items-center gap-2">
              <HiPhone className="text-lg text-gray-400" />
              300 123 4567
            </p>
            <p className="flex items-center gap-2">
              <HiEnvelope className="text-lg text-gray-400" />
              contacto@rafamotos.com
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Enlaces rápidos
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/agendar" className="hover:text-white transition">
                Agendar cita
              </Link>
            </li>
            <li>
              <Link to="/estado" className="hover:text-white transition">
                Consultar estado de la cita
              </Link>
            </li>
            <li>
              <Link to="/contacto" className="hover:text-white transition">
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Ubicación</h3>
          <div className="rounded-xl overflow-hidden border border-gray-600 shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.8038086152205!2d-75.5660974252488!3d6.2894985936995145!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e442932b0246f11%3A0x24ba7825e60fb56b!2sRafa%20Motos!5e0!3m2!1ses-419!2sco!4v1751167761606!5m2!1ses-419!2sco"
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Rafa Motos"
            ></iframe>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Rafa Motos. Todos los derechos
        reservados.
      </div>
    </footer>
  );
};
