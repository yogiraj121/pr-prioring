import { Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import LandingPageWithChatbot from "./pages/Landing";
import LoginComponent from "./pages/Login";
import SignupComponent from "./pages/Signup";
import TicketDashboard from "./pages/Dashboard";
import ContactCenter from "./pages/chatcenter";
import CustomerAnalyticsDashboard from "./pages/Analytics";
import ChatBotCustomization from "./pages/Custom";
import TeamManagement from "./pages/Team";
import SettingsProfileForm from "./pages/Prof";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { useAuth } from "./context/AuthContext";
import { ChatCustomizationProvider } from "./context/ChatCustomizationContext";


const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <ChatCustomizationProvider>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPageWithChatbot />
            </PublicRoute>
          }
        />
        <Route
          path="/chatbot-custom"
          element={
            <PublicRoute>
              <ChatBotCustomization />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginComponent />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupComponent />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <TicketDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat-center/:ticketId?"
          element={
            <ProtectedRoute>
              <ContactCenter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analysis"
          element={
            <ProtectedRoute>
              <CustomerAnalyticsDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <TeamManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <SettingsProfileForm />
            </ProtectedRoute>
          }
        />

        {/* Fallback Route - redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ChatCustomizationProvider>
  );
};

export default App;
