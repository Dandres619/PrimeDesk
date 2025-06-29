import React from "react";
import { Routes, Route } from "react-router-dom";
import { ClienteLayout } from "../layouts/ClienteLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { Home } from "../pages/Home";
import { Agendar } from "../pages/Agendar";
import { AdminDashboard } from "../pages/AdminDashboard";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<ClienteLayout />}>
        <Route index element={<Home />} />
        <Route path="/agendar" element={<Agendar />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
};
