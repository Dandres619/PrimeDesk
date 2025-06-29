import React from "react";

export const AdminFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Rafa Motos — Sistema de gestión. Todos los derechos reservados.
      </div>
    </footer>
  );
};
