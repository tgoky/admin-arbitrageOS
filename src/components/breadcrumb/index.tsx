"use client";

import { useBreadcrumb } from "@refinedev/core";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useTheme } from "../../providers/ThemeProvider";

// Fixed version matching AdminDashboard styling
export const Breadcrumb = () => {
  const { breadcrumbs } = useBreadcrumb();
  const { theme } = useTheme();

  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${
      theme === "dark" 
        ? "bg-[#181919] border-gray-700" 
        : "bg-white border-gray-200"
    } border-b`}>
      <div className="w-full px-6 py-4">
        <div className="flex items-center space-x-1 text-sm">
          {/* Home */}
          <Link
            href="/"
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
              theme === "dark"
                ? "text-gray-400 hover:text-white hover:bg-gray-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Home size={14} />
            <span>Home</span>
          </Link>

          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return (
              <div key={`breadcrumb-${breadcrumb.label}-${index}`} className="flex items-center">
                {/* Separator */}
                <ChevronRight 
                  size={14} 
                  className={`mx-1 ${
                    theme === "dark" ? "text-gray-600" : "text-gray-400"
                  }`} 
                />
                
                {/* Breadcrumb item */}
                {breadcrumb.href && !isLast ? (
                  <Link
                    href={breadcrumb.href}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      theme === "dark"
                        ? "text-gray-400 hover:text-white hover:bg-gray-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {breadcrumb.label}
                  </Link>
                ) : (
                  <span
                    className={`px-2 py-1 font-semibold ${
                      theme === "dark" 
                        ? "text-white bg-gray-700 rounded-md" 
                        : "text-gray-900 bg-gray-100 rounded-md"
                    }`}
                  >
                    {breadcrumb.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Fixed minimal version matching AdminDashboard
export const MinimalBreadcrumb = () => {
  const { breadcrumbs } = useBreadcrumb();
  const { theme } = useTheme();

  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${
      theme === "dark" ? "bg-[#181919]" : "bg-white"
    } border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
      <div className="w-full px-6 py-3">
        <div className="flex items-center space-x-1 text-sm">
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return (
              <div key={`breadcrumb-${breadcrumb.label}-${index}`} className="flex items-center">
                {index > 0 && (
                  <span className={`mx-2 ${
                    theme === "dark" ? "text-gray-600" : "text-gray-400"
                  }`}>/</span>
                )}
                
                {breadcrumb.href && !isLast ? (
                  <Link
                    href={breadcrumb.href}
                    className={`transition-colors hover:underline ${
                      theme === "dark" 
                        ? "text-gray-400 hover:text-white" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {breadcrumb.label}
                  </Link>
                ) : (
                  <span className={
                    theme === "dark" ? "text-white font-semibold" : "text-gray-900 font-semibold"
                  }>
                    {breadcrumb.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Main export with the best version
export default Breadcrumb;