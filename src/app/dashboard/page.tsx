"use client";
import { useState } from "react";
import { MessageSquare, Database } from "lucide-react";
import ProtectedRoute from "../components/ProtectedRoute";
import ChatDashboard from "./ChatDashboard";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'admin'>('chat');

  const handleDirectusAccess = () => {
    let directusUrl;
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      directusUrl = 'http://localhost:8055';
    } else {
      directusUrl = 'https://directus-production-deda.up.railway.app/admin';
    }
    window.open(directusUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <div className="bg-white shadow-md p-4 mb-8 mt-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'chat'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <span>Chat Dashboard</span>
              </div>
            </button>
            <button
              onClick={handleDirectusAccess}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <Database className="h-5 w-5" />
              <span>Access Admin Panel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4">
        {activeTab === 'chat' ? (
          <ChatDashboard />
        ) : (
          <div className="text-center py-12">
            <p>Opening Directus Admin Panel in a new tab...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrap the component with ProtectedRoute to ensure only admin users can access it
const DashboardPage = () => {
  return (
    <ProtectedRoute adminOnly={true}>
      <AdminDashboard />
    </ProtectedRoute>
  );
};

export default DashboardPage;
