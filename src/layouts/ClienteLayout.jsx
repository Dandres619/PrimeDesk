import React from "react";
import { Header } from "../Components/general/Header";
import { Footer } from "../Components/general/Footer";
import { Link, Outlet } from "react-router-dom";

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
