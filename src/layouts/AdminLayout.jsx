import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSideBar } from "../Components/admin/Sidebar/AdminSideBar";
import { AdminFooter } from "../Components/admin/AdminFooter";
import { Menu } from "lucide-react";

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden">
      <AdminSideBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
