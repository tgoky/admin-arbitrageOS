import { ChevronDown, ChevronUp, Shield, Settings } from "lucide-react";
import { useTheme } from "../../providers/ThemeProvider";

interface AdminHeaderProps {
  collapsed: boolean;
  adminDropdownOpen: boolean;
  setAdminDropdownOpen: (open: boolean) => void;
}

// export const AdminHeader = ({
//   collapsed,
//   adminDropdownOpen,
//   setAdminDropdownOpen,
// }: AdminHeaderProps) => {
//   const { theme } = useTheme();

//   return (
//     <div
//       className={`p-1 border-b ${
//         theme === "dark" ? "bg-black border-gray-800" : "bg-white border-gray-200"
//       } relative`}
//     >
//       {!collapsed ? (
//         <div className="relative">
//           <button
//             onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
//             className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors border-none ${
//               theme === "dark" 
//                 ? "bg-black hover:bg-gray-900" 
//                 : "bg-white hover:bg-gray-100"
//             } group`}
//           >
//             {/* Admin Shield Icon */}
//             <div
//               className={`w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform`}
//             >
//               <Shield size={16} />
//             </div>
            
//             {/* Admin Info */}
//             <div className="flex-1 text-left min-w-0">
//               <div
//                 className={`font-semibold truncate text-sm ${
//                   theme === "dark" ? "text-gray-100" : "text-gray-900"
//                 }`}
//                 title="Administrator"
//               >
//                 Administrator
//               </div>
//               <div
//                 className={`text-xs ${
//                   theme === "dark" ? "text-gray-400" : "text-gray-500"
//                 }`}
//               >
//                 Control Panel
//               </div>
//             </div>

//             {/* Dropdown Arrows */}
//             <div className="flex flex-col items-center -space-y-2">
//               <ChevronUp
//                 className={`w-4 h-4 transition-transform ${
//                   adminDropdownOpen ? "rotate-180" : ""
//                 } ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
//               />
//               <ChevronDown
//                 className={`w-4 h-4 transition-transform ${
//                   adminDropdownOpen ? "rotate-180" : ""
//                 } ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
//               />
//             </div>
//           </button>
//         </div>
//       ) : (
//         <div
//           className={`flex justify-center ${
//             theme === "dark" ? "bg-black" : "bg-white"
//           }`}
//         >
//           <button
//             onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
//             className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg hover:scale-105 transition-transform`}
//             title="Admin Panel"
//           >
//             <Shield size={18} />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// Alternative simpler version without dropdown arrows
export const SimpleAdminHeader = ({ collapsed }: { collapsed: boolean }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`p-1 border-b ${
        theme === "dark" ? "bg-black border-gray-800" : "bg-white border-gray-200"
      }`}
    >
      {!collapsed ? (
        <div className="flex items-center gap-3 p-3">
          {/* Admin Badge */}
          <div
            className={`w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0 shadow-lg`}
          >
            <Shield size={16} />
          </div>
          
          {/* Admin Text */}
          <div className="flex-1 text-left min-w-0">
            <div
              className={`font-bold text-sm ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Admin
            </div>
            <div
              className={`text-xs ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Management Console
            </div>
          </div>

          {/* Settings Icon */}
          <Settings 
            size={16} 
            className={theme === "dark" ? "text-gray-400" : "text-gray-500"} 
          />
        </div>
      ) : (
        <div className="flex justify-center p-2">
          <div
            className={`w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg`}
            title="Admin Panel"
          >
            <Shield size={18} />
          </div>
        </div>
      )}
    </div>
  );
};

// Premium version with stats
export const WorkspaceHeader = ({ collapsed }: { collapsed: boolean }) => {
  const { theme } = useTheme();

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
              className={`w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0 shadow-lg`}
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

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className={`text-xs font-semibold ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}>
                24
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
                156
              </div>
              <div className={`text-[10px] ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}>
                Tools
              </div>
            </div>
            <div>
              <div className={`text-xs font-semibold ${
                theme === "dark" ? "text-purple-400" : "text-purple-600"
              }`}>
                12
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