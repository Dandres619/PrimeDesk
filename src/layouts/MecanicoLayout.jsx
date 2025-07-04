import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { MecanicoSideBar } from "../components/Sidebar/Pages/MecanicoSideBar";
import { AdminFooter } from "../Components/shared/AdminFooter";
import { Menu } from "lucide-react";

export const MecanicoLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden">
      <MecanicoSideBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b bg-white shadow">
          <h1 className="text-lg font-semibold text-gray-800">Rafa Motos</h1>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600"
          >
            <Menu size={24} />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto bg-[#f9fafb] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        <AdminFooter />
      </div>
    </div>
  );
};
