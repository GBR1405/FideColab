import React, { Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; 
import ErrorWindowSize from "./components/ErrorWindowSize"; 
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PrivateRoute from './LN/PrivateRoute.js';

import Home from "./pages/Home";
import UserHomeScreen from "./pages/UserHomeScreen";

//User
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
const PersonalizacionEditor = lazy(() => import("./pages/Personalizacion.js"));
const AgregarPersonalizaciones = lazy(() => import("./pages/Personalization.js"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.js"));
const AdminCursos = lazy(() => import("./pages/Course.js"));
const AdminDepuracion = lazy(() => import("./pages/Depuration.js"));
const AdminHistorial = lazy(() => import("./pages/Historial.js"));
const AdminReportes = lazy(() => import("./pages/Reports.js"));
const AdminProfesores = lazy(() => import("./pages/Professor.js"));

//Admin
const AgregarContenido = lazy(() => import("./pages/AddGames.js"));

const App = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (isSmallScreen) {
    return <ErrorWindowSize />;
  }

  return (
    <>
      <Suspense fallback={<div></div>}>
      <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/help" element={<Help />} />
          <Route path="/help/manual" element={<Manual />} />
          <Route path="/help/tutorial" element={<Tutorial />} />
          <Route path="/help/preguntasfrecuentes" element={<Preguntasfrecuentes />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Rutas protegidas para Estudiantes o Profesores */}
          <Route path="/profile" element={<PrivateRoute element={<Profile />} allowedRoles={['Estudiante', 'Profesor']} />} />
          <Route path="/homeScreen" element={<PrivateRoute element={<UserHomeScreen />} allowedRoles={['Estudiante', 'Profesor']} />} />
          <Route path="/edit-user" element={<PrivateRoute element={<EditUser />} allowedRoles={['Estudiante', 'Profesor']} />} />
          <Route path="/user-profile" element={<PrivateRoute element={<UserProfile />} allowedRoles={['Estudiante', 'Profesor']} />} />

          {/* Rutas para Profesor */}
          <Route path="/personalize/editor" element={ <PrivateRoute element={ <DndProvider backend={HTML5Backend}> <PersonalizacionEditor /></DndProvider>}
            allowedRoles={['Profesor']}
          />
          }
/>

          {/* Rutas para Administrador */}
          <Route path="/admin" element={<PrivateRoute element={<AdminDashboard />} allowedRoles={['Administrador']} />} />
          <Route path="/admin/add_game" element={<PrivateRoute element={<AgregarContenido />} allowedRoles={['Administrador']} />} />
          <Route path="/admin/personalize_editor" element={<PrivateRoute element={<AgregarPersonalizaciones />} allowedRoles={['Administrador']} />} />
          <Route path="/admin/history" element={<PrivateRoute element={<AdminHistorial />} allowedRoles={['Administrador']} />} />
          <Route path="/admin/reports" element={<PrivateRoute element={<AdminReportes />} allowedRoles={['Administrador']} />} />
          <Route path="/admin/depuration" element={<PrivateRoute element={<AdminDepuracion />} allowedRoles={['Administrador']} />} />
          <Route path="/admin/cursos" element={<PrivateRoute element={<AdminCursos />} allowedRoles={['Administrador']} />} />
          <Route path="/admin/profesores" element={<PrivateRoute element={<AdminProfesores />} allowedRoles={['Administrador']} />} />

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
