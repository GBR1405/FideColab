import React, { Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; // Import default CSS for toastify
import ErrorWindowSize from "./components/ErrorWindowSize"; // Importa el componente de error

import Home from "./pages/Home";
import UserHomeScreen from "./pages/UserHomeScreen";

const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const Help = lazy(() => import("./pages/Help"));
const Signup = lazy(() => import("./pages/Signup"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const EditUser = lazy(() => import("./pages/EditUser"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const TestView = lazy(() => import("./pages/TestView"));
const Manual = lazy(() => import("./pages/Manual"));
const Tutorial = lazy(() => import("./pages/Tutorial"));
const Preguntasfrecuentes = lazy(() => import("./pages/Questions"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Historial = lazy(() => import("./pages/Historial"));
const Reports = lazy(() => import("./pages/Reports"));
const Depuration = lazy(() => import("./pages/Depuration"));
const Personalization = lazy(() => import("./pages/Personalization"));
const Professor = lazy(() => import("./pages/Professor"));
const Course = lazy(() => import("./pages/Course"));

const App = () => {
  const location = useLocation();
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (isSmallScreen) {
    return <ErrorWindowSize />; // Muestra solo el mensaje de error y nada más
  }

  return (
    <>
      <Suspense fallback={<div></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/help" element={<Help />} />
          <Route path="/help/manual" element={<Manual />} />
          <Route path="/help/tutorial" element={<Tutorial />} />
          <Route path="/help/preguntasfrecuentes" element={<Preguntasfrecuentes />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/homeScreen" element={<UserHomeScreen />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/edit-user" element={<EditUser />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/test-view" element={<TestView />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/depuration" element={<Depuration />} />
          <Route path="/personalization" element={<Personalization />} />
          <Route path="/professor" element={<Professor />} />
          <Route path="/course" element={<Course />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={true}
        closeOnClick
        theme="colored"
      />
    </>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
