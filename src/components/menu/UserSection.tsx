"use client";

import { useTheme } from "../../providers/ThemeProvider";

interface UserSectionProps {
  collapsed: boolean;
  handleLogout: () => void;
}

export const UserSection = ({ collapsed, handleLogout }: UserSectionProps) => {
  const { theme } = useTheme();

  return (
    <div className={`p-4 ${theme === "dark" ? "bg-gray-900" : "bg-white"} border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
      {/* Logout Button - Clean and centered */}
      <button
        onClick={handleLogout}
        className={`
          w-full flex items-center justify-center gap-2 p-3 rounded-xl transition-all duration-300
          ${theme === "dark" 
            ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40" 
            : "bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300"
          }
          shadow-sm hover:shadow-md active:scale-95
        `}
        aria-label="Logout"
        title="Logout"
      >
        {/* Logout Icon */}
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        
        {/* Text - Only show when not collapsed */}
        {!collapsed && (
          <span className="text-sm font-medium">Sign Out</span>
        )}
      </button>

      {/* Simple footer text when not collapsed */}
      {!collapsed && (
        <div className="mt-3 text-center">
          <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
            Secure • Protected
          </p>
        </div>
      )}
    </div>
  );
};