"use client";

import { useBreadcrumb } from "@refinedev/core";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useTheme } from "../../providers/ThemeProvider";

// export const Breadcrumb = () => {
//   const { breadcrumbs } = useBreadcrumb();
//   const { theme } = useTheme();

//   // Don't render if no breadcrumbs
//   if (!breadcrumbs || breadcrumbs.length === 0) {
//     return null;
//   }

//   return (
//     <nav 
//       className={`flex items-center py-3 px-6 ${
//         theme === "dark" 
//           ? "bg-gray-900/50 border-b border-gray-800" 
//           : "bg-gray-50 border-b border-gray-200"
//       }`}
//       aria-label="Breadcrumb"
//     >
//       <ol className="flex items-center space-x-1">
//         {/* Home icon as first item */}
//         <li className="flex items-center">
//           <Link
//             href="/"
//             className={`flex items-center transition-all duration-200 rounded-lg p-2 ${
//               theme === "dark" 
//                 ? "text-gray-400 hover:text-white hover:bg-gray-800" 
//                 : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
//             }`}
//             title="Home"
//           >
//             <Home size={16} />
//           </Link>
//         </li>

//         {breadcrumbs.map((breadcrumb, index) => {
//           const isLast = index === breadcrumbs.length - 1;
          
//           return (
//             <li key={`breadcrumb-${breadcrumb.label}-${index}`} className="flex items-center">
//               {/* Separator */}
//               <ChevronRight 
//                 size={16} 
//                 className={`mx-2 ${
//                   theme === "dark" ? "text-gray-600" : "text-gray-400"
//                 }`} 
//               />
              
//               {/* Breadcrumb item */}
//               {breadcrumb.href && !isLast ? (
//                 <Link
//                   href={breadcrumb.href}
//                   className={`flex items-center transition-all duration-200 rounded-lg px-3 py-1 text-sm font-medium ${
//                     theme === "dark"
//                       ? "text-gray-300 hover:text-white hover:bg-gray-800"
//                       : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
//                   }`}
//                 >
//                   {breadcrumb.label}
//                 </Link>
//               ) : (
//                 <span
//                   className={`px-3 py-1 text-sm font-semibold ${
//                     theme === "dark"
//                       ? "text-white"
//                       : "text-gray-900"
//                   }`}
//                 >
//                   {breadcrumb.label}
//                 </span>
//               )}
//             </li>
//           );
//         })}
//       </ol>
//     </nav>
//   );
// };

// Alternative version with better visual hierarchy
export const Breadcrumb = () => {
  const { breadcrumbs } = useBreadcrumb();
  const { theme } = useTheme();

  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className={`px-6 py-4 ${
      theme === "dark" 
        ? "bg-gradient-to-r from-gray-900/80 to-gray-800/80" 
        : "bg-gradient-to-r from-blue-50/80 to-purple-50/80"
    } border-b ${
      theme === "dark" ? "border-gray-700" : "border-gray-200"
    }`}>
      <div className="flex items-center space-x-1 text-sm">
        {/* Home */}
        <Link
          href="/"
          className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
            theme === "dark"
              ? "text-gray-400 hover:text-white hover:bg-gray-700"
              : "text-gray-600 hover:text-gray-900 hover:bg-white"
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
                      : "text-gray-600 hover:text-gray-900 hover:bg-white"
                  }`}
                >
                  {breadcrumb.label}
                </Link>
              ) : (
                <span
                  className={`px-2 py-1 font-semibold ${
                    theme === "dark" 
                      ? "text-white bg-gray-700 rounded-md" 
                      : "text-gray-900 bg-white rounded-md shadow-sm"
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
  );
};

// Minimal version for compact layouts
export const MinimalBreadcrumb = () => {
  const { breadcrumbs } = useBreadcrumb();
  const { theme } = useTheme();

  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className={`px-6 py-3 ${
      theme === "dark" ? "bg-gray-900/30" : "bg-gray-50"
    }`}>
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
  );
};

// Main export with the best version
export default Breadcrumb;