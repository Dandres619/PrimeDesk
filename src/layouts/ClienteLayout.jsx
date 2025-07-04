import React from "react";
import { Header } from "../Components/Shared/Header";
import { Footer } from "../Components/Shared/Footer";
import { Outlet } from "react-router-dom";

export const ClienteLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
