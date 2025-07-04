import React from "react";
import { Routes, Route } from "react-router-dom";
import { ClienteLayout } from "../layouts/ClienteLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { Home } from "../pages/Home";
import { Agendar } from "../features/Citas/Pages/Agendar";
import { ConsultarEstado } from "../features/Citas/Pages/ConsultarEstado";
import { AdminDashboard } from "../pages/AdminDashboard";
import { CitasAgendadas } from "../features/Citas/Pages/CitasAgendadas";
import { NotFound } from "../pages/NotFound";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<ClienteLayout />}>
        <Route index element={<Home />} />
        <Route path="agendar" element={<Agendar />} />
        <Route path="estado" element={<ConsultarEstado />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="citas" element={<CitasAgendadas />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
