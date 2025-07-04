import React from "react";

export const AdminFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
        <p className="text-center sm:text-left">
          &copy; {new Date().getFullYear()} Rafa Motos. Todos los derechos
          reservados.
        </p>
        <div className="mt-2 sm:mt-0 flex space-x-4 text-gray-400 text-xs">
          <span className="hover:text-gray-600 cursor-default">
            Sistema de gestión
          </span>
        </div>
      </div>
    </footer>
  );
};
