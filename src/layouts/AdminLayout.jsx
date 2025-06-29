import React from "react";
import { Outlet } from "react-router-dom";
import { AdminHeader } from "../Components/admin/AdminHeader";
import { AdminFooter } from "../Components/admin/AdminFooter";

export const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <AdminFooter />
    </div>
  );
};
