// admin-app/src/components/WorkspaceHeader.tsx
"use client";

import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { useTheme } from "../../providers/ThemeProvider";

interface WorkspaceHeaderProps {
  collapsed: boolean;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalToolsUsed: number;
}

export const WorkspaceHeader = ({ collapsed }: WorkspaceHeaderProps) => {
  const { theme } = useTheme();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalToolsUsed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/statistics');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setStats({
              totalUsers: result.data.totalUsers,
              activeUsers: result.data.activeUsers,
              totalToolsUsed: result.data.totalToolsUsed,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`p-1 border-b ${
        theme === "dark" 
          ? "bg-gradient-to-r from-gray-900 to-black border-gray-800" 
          : "bg-gradient-to-r from-blue-50 to-white border-gray-200"
      }`}
    >
      {!collapsed ? (
        <div className="p-3">
          {/* Main Admin Info */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 rounded-xl  flex items-center justify-center text-white font-medium text-sm flex-shrink-0 shadow-lg`}
            >
              <Shield size={18} />
            </div>
            
            <div className="flex-1 text-left">
              <div
                className={`font-bold text-sm ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                System Administrator
              </div>
              <div
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Full Access
              </div>
            </div>
          </div>

          {/* Quick Stats - Real Data */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className={`text-xs font-semibold ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}>
                {loading ? '...' : stats.totalUsers}
              </div>
              <div className={`text-[10px] ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}>
                Users
              </div>
            </div>
            <div>
              <div className={`text-xs font-semibold ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              }`}>
                {loading ? '...' : stats.totalToolsUsed}
              </div>
              <div className={`text-[10px] ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}>
                Deliverables
              </div>
            </div>
            <div>
              <div className={`text-xs font-semibold ${
                theme === "dark" ? "text-purple-400" : "text-purple-600"
              }`}>
                {loading ? '...' : stats.activeUsers}
              </div>
              <div className={`text-[10px] ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}>
                Active
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center p-2">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg relative`}
            title="System Administrator"
          >
            <Shield size={20} />
            {/* Online indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceHeader;