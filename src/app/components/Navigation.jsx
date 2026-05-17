"use client";

import { Home, History, Settings, LayoutDashboard, Music2, User } from "lucide-react";
import { Button } from "./ui/button";

export function Navigation({ currentPage, onNavigate, isAdmin = false, userMode = "authenticated", userData = null }) {
  const navItems = [
    { id: "dashboard", label: "Home",     icon: Home },
    { id: "history",   label: "History",  icon: History },
    { id: "settings",  label: "Settings", icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ id: "admin", label: "Admin", icon: LayoutDashboard });
  }

  const initial = userData?.displayName?.[0]?.toUpperCase();

  return (
    <nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-[#1DB954] p-2 rounded-lg">
              <Music2 className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">EmoBeat</span>
          </div>

          {/* Nav Items */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => onNavigate(item.id)}
                  className={
                    isActive
                      ? "bg-[#1DB954] text-black hover:bg-[#1ed760]"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                >
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </div>
                </Button>
              );
            })}
          </div>

          {/* User chip — shows real name from session */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-colors duration-300 ${
            userMode === "authenticated"
              ? "bg-[#1DB954]/10 border-[#1DB954]/30 text-[#1DB954]"
              : "bg-gray-100 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-500"
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
              userMode === "authenticated" ? "bg-[#1DB954] text-black" : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}>
              {initial || <User className="w-3 h-3" />}
            </div>
            <span className="max-w-[120px] truncate">
              {userData?.displayName || (userMode === "authenticated" ? "Spotify User" : "Anonymous")}
            </span>
          </div>

        </div>
      </div>
    </nav>
  );
}
