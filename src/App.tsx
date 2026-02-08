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
import Management from "./features/Management";
import ScheduleManager from "./features/schedule/ScheduleManager";
import NovaChamada from "./pages/NovaChamada";
import ChamadasTabela from "./pages/ChamadasTabela";

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
            path="gestao"
            element={
              <ProtectedRoute>
                <Management />
              </ProtectedRoute>
            }
          />
          <Route
            path="chamada"
            element={
              <ProtectedRoute>
                <NovaChamada />
              </ProtectedRoute>
            }
          />
          <Route
            path="chamadas"
            element={
              <ProtectedRoute>
                <ChamadasTabela />
              </ProtectedRoute>
            }
          />
        </Route>
      </>,
    ),
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
