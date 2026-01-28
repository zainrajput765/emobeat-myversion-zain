import React from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Activity, Users, Music, AlertTriangle, TrendingUp, Server, Database } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const usageData = [
  { date: "Jan 1", sessions: 45, users: 28 },
  { date: "Jan 2", sessions: 52, users: 31 },
  { date: "Jan 3", sessions: 48, users: 29 },
  { date: "Jan 4", sessions: 61, users: 38 },
  { date: "Jan 5", sessions: 55, users: 34 },
  { date: "Jan 6", sessions: 67, users: 42 },
];

const emotionData = [
  { emotion: "Happy", count: 245 },
  { emotion: "Calm", count: 189 },
  { emotion: "Neutral", count: 156 },
  { emotion: "Sad", count: 98 },
  { emotion: "Energetic", count: 134 },
  { emotion: "Surprised", count: 67 },
];

const systemMetrics = [
  { name: "API Response Time", value: "125ms", status: "healthy", icon: Server },
  { name: "Database Queries", value: "1.2k/min", status: "healthy", icon: Database },
  { name: "Active Sessions", value: "42", status: "healthy", icon: Activity },
  { name: "Error Rate", value: "0.3%", status: "warning", icon: AlertTriangle },
];

const recentErrors = [
  { id: 1, time: "2:45 PM", type: "Camera Access", message: "User denied camera permission", severity: "warning" },
  { id: 2, time: "1:30 PM", type: "Spotify API", message: "Rate limit exceeded", severity: "error" },
  { id: 3, time: "12:15 PM", type: "Face Detection", message: "Low light condition detected", severity: "info" },
  { id: 4, time: "11:20 AM", type: "Network", message: "Slow connection detected", severity: "warning" },
];

export function AdminDashboard() {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "error":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      case "warning":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "info":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">System monitoring and analytics</p>
          </div>
          <Badge className="bg-[#1DB954] text-black">
            <Activity className="w-4 h-4 mr-1" />
            All Systems Operational
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#181818] border-[#282828] p-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#1DB954]/20 p-3 rounded-lg">
                <Users className="w-6 h-6 text-[#1DB954]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">1,234</p>
                <p className="text-sm text-gray-400">Total Users</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-500">+12.5%</span>
              <span className="text-gray-500">from last week</span>
            </div>
          </Card>

          <Card className="bg-[#181818] border-[#282828] p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">3,456</p>
                <p className="text-sm text-gray-400">Sessions Today</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-500">+8.3%</span>
              <span className="text-gray-500">from yesterday</span>
            </div>
          </Card>

          <Card className="bg-[#181818] border-[#282828] p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Music className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">12.5k</p>
                <p className="text-sm text-gray-400">Tracks Played</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-500">+15.7%</span>
              <span className="text-gray-500">from last week</span>
            </div>
          </Card>

          <Card className="bg-[#181818] border-[#282828] p-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">23</p>
                <p className="text-sm text-gray-400">Active Alerts</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm">
              <span className="text-gray-500">4 critical</span>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usage Trends */}
          <Card className="bg-[#181818] border-[#282828] p-6">
            <h3 className="text-white mb-4">Usage Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#282828",
                    border: "1px solid #404040",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />
                <Line type="monotone" dataKey="sessions" stroke="#1DB954" strokeWidth={2} />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Emotion Distribution */}
          <Card className="bg-[#181818] border-[#282828] p-6">
            <h3 className="text-white mb-4">Emotion Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={emotionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                <XAxis dataKey="emotion" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#282828",
                    border: "1px solid #404040",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />
                <Bar dataKey="count" fill="#1DB954" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* System Health */}
        <Card className="bg-[#181818] border-[#282828] p-6">
          <h3 className="text-white mb-4">System Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="p-4 bg-[#282828] rounded-lg flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-white font-medium">{metric.value}</p>
                    <p className="text-sm text-gray-400">{metric.name}</p>
                  </div>
                  {metric.status === "healthy" && (
                    <div className="ml-auto w-2 h-2 bg-green-500 rounded-full" />
                  )}
                  {metric.status === "warning" && (
                    <div className="ml-auto w-2 h-2 bg-yellow-500 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Errors */}
        <Card className="bg-[#181818] border-[#282828] p-6">
          <h3 className="text-white mb-4">Recent Errors & Warnings</h3>
          <div className="space-y-3">
            {recentErrors.map((error) => (
              <div key={error.id} className="p-4 bg-[#282828] rounded-lg flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={getSeverityColor(error.severity)}>
                      {error.severity.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-400">{error.time}</span>
                  </div>
                  <p className="text-white font-medium">{error.type}</p>
                  <p className="text-sm text-gray-400 mt-1">{error.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
