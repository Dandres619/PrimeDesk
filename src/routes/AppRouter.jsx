import React from "react";
import { Routes, Route } from "react-router-dom";
import { ClienteLayout } from "../layouts/ClienteLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { Home } from "../pages/Home";
import { Agendar } from "../pages/Agendar";
import { ConsultarEstado } from "../pages/ConsultarEstado";
import { AdminDashboard } from "../pages/AdminDashboard";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<ClienteLayout />}>
        <Route index element={<Home />} />
        <Route path="/agendar" element={<Agendar />} />
        <Route path="/estado" element={<ConsultarEstado />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
};
