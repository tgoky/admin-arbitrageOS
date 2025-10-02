"use client";

import type { PropsWithChildren } from "react";
import { Breadcrumb } from "../breadcrumb";
import { Menu } from "../menu";
import { useTheme } from "../../providers/ThemeProvider";

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const { theme } = useTheme();
  
  return (
    <div className="flex min-h-screen w-full">
      <Menu />
      <div className={`flex-1 min-w-0 flex flex-col overflow-x-hidden ${
        theme === "dark" ? "bg-black" : "bg-gray-50"
      }`}>
        {/* Breadcrumb - full width, no padding */}
        <Breadcrumb />
        
        {/* Content area with padding */}
        <div className="flex-1 w-full min-w-0 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};