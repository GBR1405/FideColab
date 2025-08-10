import React, { Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ErrorWindowSize from "./components/ErrorWindowSize";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PrivateRoute from './LN/PrivateRoute.js';
import Home from "./pages/Home";
import UserHomeScreen from "./pages/UserHomeScreen";
import { SocketProvider } from './context/SocketContext';

import FullScreenLoader from "./components/FullScreenLoader";
import DelayedSuspense from "./components/DelayedSuspense";

window.addEventListener("error", (e) => {
  if (e?.message?.includes("ChunkLoadError") || e?.message?.includes("Loading chunk")) {
    console.warn("⚠️ Error de carga de chunk detectado. Recargando...");
    window.location.reload();
  }
});

// Rutas de usuario s
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
const PaginSimulacion = lazy(() => import("./pages/FilterPersonalization.js"));
const Resultados = lazy(() => import("./pages/ResultsTeacher.js"));
const TeacherHistory = lazy(() => import("./pages/TeacherHistory.js"));
const StudentHistory = lazy(() => import("./pages/StudentHistory.js"));

// Rutas de administración
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.js"));
const AdminCursosYProfesores = lazy(() => import("./pages/TeacherAndCourses.js"));
const AdminDepuracion = lazy(() => import("./pages/Depuration.js"));
const AdminHistorial = lazy(() => import("./pages/Historial.js"));
const AdminReportes = lazy(() => import("./pages/Reports.js"));
const ResultadosAdmin = lazy(() => import("./pages/ResultAdmin.js"));

const AgregarContenido = lazy(() => import("./pages/AddGames.js"));



// Componente principal de la app
const App = () => {
 const [isSmallScreen, setIsSmallScreen] = useState(
    window.innerWidth < 810 || window.innerHeight < 550
  );
  const location = useLocation();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 810 || window.innerHeight < 550);
    };

    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Lista de rutas que pueden mostrarse en pantallas pequeñas
  const allowedSmallScreenRoutes = [
    "/resultados/",
    "/resultadosAdmin/"
  ];

  if (isSmallScreen && !allowedSmallScreenRoutes.some(route => location.pathname.includes(route))) {
    return <ErrorWindowSize />;
  }

  return (
    <DelayedSuspense fallback={<FullScreenLoader />} minDuration={1200}>
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
        <Route path="/resultados/:partidaId" element={<PrivateRoute element={<Resultados />} allowedRoles={['Estudiante', 'Profesor']} />} />
        <Route path="/student-history" element={<PrivateRoute element={<StudentHistory />} allowedRoles={['Estudiante', 'Profesor']} />} />
        <Route path="/teacher-history" element={<PrivateRoute element={<TeacherHistory />} allowedRoles={['Estudiante', 'Profesor']} />} />

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
        <Route path="/resultadosAdmin/:partidaId" element={<PrivateRoute element={<ResultadosAdmin />} allowedRoles={['Administrador']} />} />

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
    </DelayedSuspense>
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