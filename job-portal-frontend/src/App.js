import React, { Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ErrorWindowSize from "./components/ErrorWindowSize";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PrivateRoute from './LN/PrivateRoute.js';
import Home from "./pages/Home";
import UserHomeScreen from "./pages/UserHomeScreen";
import { SocketProvider } from './context/SocketContext';

// Rutas de usuario
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const Help = lazy(() => import("./pages/Help"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const EditUser = lazy(() => import("./pages/EditUser"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const TestView = lazy(() => import("./pages/TestView"));
const Manual = lazy(() => import("./pages/Manual"));
const Tutorial = lazy(() => import("./pages/Tutorial"));
const Preguntasfrecuentes = lazy(() => import("./pages/Questions"));
const SalasDeGrupo = lazy(() => import("./pages/Game.js").then(module => ({ default: module.default })));
//const Personalizacion_Prueba = lazy(() => import("./pages/Personalizacion.js"));
const ProfesorEstudiantes = lazy(() => import("./pages/ProfessorStudents.js"));
const PersonalizacionEditor = lazy(() => import("./pages/CreatePersonalization.js"));
const EditarPersonalizacion = lazy(() => import("./pages/EditPersonalization.js"));
const AgregarPersonalizaciones = lazy(() => import("./pages/Personalization.js"));
const SalaEspera = lazy(() => import("./pages/WaitingRoom.js"));
const PanelProfesor = lazy(() => import("./pages/ProfessorDashboard.js"));
const Ejemplo = lazy(() => import("./pages/Signup.js"));
const Canvas = lazy(() => import("./pages/Canvas.js"));

// Rutas de administración
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.js"));
const AdminCursosYProfesores = lazy(() => import("./pages/TeacherAndCourses.js"));
const AdminDepuracion = lazy(() => import("./pages/Depuration.js"));
const AdminHistorial = lazy(() => import("./pages/Historial.js"));
const AdminReportes = lazy(() => import("./pages/Reports.js"));
const PaginSimulacion = lazy(() => import("./pages/FilterPersonalization.js"));
const AgregarContenido = lazy(() => import("./pages/AddGames.js"));



// Componente principal de la app
const App = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  // Detecta el tamaño de la pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Si la pantalla es pequeña, muestra un mensaje de error
  if (isSmallScreen) {
    return <ErrorWindowSize />;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SocketProvider>
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
        <Route path="/test-view" element={<TestView />} />
        <Route path="/ejemplo" element={<Ejemplo />} />
        <Route path="/canvas" element={<Canvas />} />

        {/* Rutas protegidas para Estudiantes o Profesores */}
        <Route path="/profile" element={<PrivateRoute element={<Profile />} allowedRoles={['Estudiante', 'Profesor']} />} />
        <Route path="/homeScreen" element={<PrivateRoute element={<UserHomeScreen />} allowedRoles={['Estudiante', 'Profesor']} />} />
        <Route path="/edit-user" element={<PrivateRoute element={<EditUser />} allowedRoles={['Estudiante', 'Profesor']} />} />
        <Route path="/user-profile" element={<PrivateRoute element={<UserProfile />} allowedRoles={['Estudiante', 'Profesor']} />} />
        <Route path="/waiting-room/:partidaId" element={<PrivateRoute element={<SalaEspera />} allowedRoles={['Estudiante', 'Profesor']} />} />
        <Route path="/team-room/:partidaId/:equipoNumero" element={<PrivateRoute element={<SalasDeGrupo />} allowedRoles={['Estudiante', 'Profesor']} />} />
        <Route path="/professor-dashboard/:partidaId" element={<PrivateRoute element={<PanelProfesor />} allowedRoles={['Estudiante', 'Profesor']} />} />

        {/* Rutas para Profesor */}
        <Route path="/simulations" element={<PrivateRoute element={<PaginSimulacion />} allowedRoles={['Profesor']} />} />
        <Route path="/students" element={<PrivateRoute element={<ProfesorEstudiantes />} allowedRoles={['Profesor']} />} />
        <Route path="/simulations/editor" element={
          <PrivateRoute element={
            <DndProvider backend={HTML5Backend}>
              <PersonalizacionEditor />
            </DndProvider>
          } allowedRoles={['Profesor']} />
        } />
        <Route path="/editar-personalizacion/:id" element={
          <PrivateRoute element={
            <DndProvider backend={HTML5Backend}>
              <EditarPersonalizacion />
            </DndProvider>
          } allowedRoles={['Profesor']} />
        } />

        {/* Rutas para Administrador */}
        <Route path="/admin" element={<PrivateRoute element={<AdminDashboard />} allowedRoles={['Administrador']} />} />
        <Route path="/admin/add_game" element={<PrivateRoute element={<AgregarContenido />} allowedRoles={['Administrador']} />} />
        <Route path="/admin/personalize_editor" element={<PrivateRoute element={<AgregarPersonalizaciones />} allowedRoles={['Administrador']} />} />
        <Route path="/admin/history" element={<PrivateRoute element={<AdminHistorial />} allowedRoles={['Administrador']} />} />
        <Route path="/admin/reports" element={<PrivateRoute element={<AdminReportes />} allowedRoles={['Administrador']} />} />
        <Route path="/admin/depuration" element={<PrivateRoute element={<AdminDepuracion />} allowedRoles={['Administrador']} />} />
        <Route path="/admin/cursos" element={<PrivateRoute element={<AdminCursosYProfesores />} allowedRoles={['Administrador']} />} />

        {/* Ruta para páginas no encontradas */}
        <Route path="*" element={<NotFound />} />
        
      </Routes>
      </SocketProvider>

      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={true}
        closeOnClick
        theme="colored"
      />
    </Suspense>
  );
};

const AppWrapper = () => (
  <DndProvider backend={HTML5Backend}>
    <Router>
      <App />
    </Router>
  </DndProvider>
);

export default AppWrapper;