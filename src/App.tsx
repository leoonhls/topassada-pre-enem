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
import ScheduleManager from "./features/schedule/ScheduleManager";
import CadastroHorarios from "./features/horarios/CadastroHorarios";
import ProfessorsManager from "./features/professor/professorsManager";
import LessonsManager from "./features/lesson/LessonsManager";
import Management from "./features/management";

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
                <LessonsManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="gestao"
            element={
              <ProtectedRoute>
                <Management />
              </ProtectedRoute>
            }
          />
          <Route
            path="professores"
            element={
              <ProtectedRoute>
                <ProfessorsManager />
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
