import React from "react";
import { Link } from "react-router-dom";

export const NotFound = () => {
  return (
    <main className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <svg
          className="mx-auto mb-8 w-40 h-40 text-blue-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93"
          />
        </svg>

        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-lg text-gray-600 mb-6">
          La página que estás buscando no existe.
        </p>

        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
};
