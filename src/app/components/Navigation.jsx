"use client";

import { Home, History, Settings, LayoutDashboard, Music2 } from "lucide-react";
import { Button } from "./ui/button";

export function Navigation({ currentPage, onNavigate, isAdmin = false }) {
  const navItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ id: "admin", label: "Admin", icon: LayoutDashboard });
  }

  return (
    <nav className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-[#1DB954] p-2 rounded-lg">
              <Music2 className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold text-white">EmoBeat</span>
          </div>

          {/* Navigation Items */}
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
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
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
        </div>
      </div>
    </nav>
  );
}
