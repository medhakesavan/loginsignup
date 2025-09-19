import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from "./pages/Dashboard.jsx";
import Expenditure from "./pages/Expenditure";
import Sidebar from "./Sidebar.jsx";
import Settings from "./pages/Settings";
import './App.css';

const MainLayout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  return (
    <div className="App flex min-h-screen bg-gray-100">
      {!isLoginPage && <Sidebar />}
      <div className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenditure" element={<Expenditure />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

export default App;