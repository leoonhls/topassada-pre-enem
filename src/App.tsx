import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import "./App.css";
import RootLayout from "./components/layout/RootLayout";
import Login from "./pages/Login";

import ProtectedRoute from "./components/common/ProtectedRoute";
import { ThemeProvider } from "./components/common/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import ScheduleManager from "./features/App";
import QuadroHorarios from "./features/horarios/QuadroHorarios";
import CadastroMaterias from "./features/materias/CadastroMaterias";
import CadastroProfessores from "./features/professores/CadastroProfessores";
import CadastroHorarios from "./features/horarios/CadastroHorarios";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RootLayout />}>
          <Route
            index
            element={
              <ProtectedRoute>
                <ScheduleManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="materias"
            element={
              <ProtectedRoute>
                <CadastroMaterias />
              </ProtectedRoute>
            }
          />
          <Route
            path="professores"
            element={
              <ProtectedRoute>
                <CadastroProfessores />
              </ProtectedRoute>
            }
          />
          <Route
            path="horarios"
            element={
              <ProtectedRoute>
                <CadastroHorarios />
              </ProtectedRoute>
            }
          />
        </Route>
      </>
    )
  );

  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
