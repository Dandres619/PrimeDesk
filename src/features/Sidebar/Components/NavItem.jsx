import React from 'react'
import { NavLink } from 'react-router-dom'

export const NavItem = ({ to, icon, label, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2 rounded-md text-sm transition font-medium ${
        isActive
          ? "bg-blue-100 text-blue-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`
    }
  >
    {icon}
    {label}
  </NavLink>
);