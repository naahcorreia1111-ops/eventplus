import { Navigate, Route, Routes } from "react-router-dom";

import Home from "../pages/Home/Home";
import Eventos from "../pages/Home/Eventos/eventos";
import DetalhesEvento from "../pages/Home/DetalhesEvento/DetalhesEvento";
import Login from "../pages/Login/Login";
import Usuarios from "../pages/Usuarios/Usuarios";
import TipoEvento from "../pages/TipoEvento/TipoEvento";
import TipoUsuario from "../pages/TipoUsuario/TipoUsuario";
import CadastroEvento from "../pages/CadastroEvento/CadastroEvento";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/eventos/:id" element={<DetalhesEvento />} />
            <Route path="/login" element={<Login />} />

            <Route
                path="/cadastroEvento"
                element={
                    <ProtectedRoute role="organizador">
                        <CadastroEvento />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/usuarios"
                element={
                    <ProtectedRoute role="administrador">
                        <Usuarios />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/tipoevento"
                element={
                    <ProtectedRoute role="administrador">
                        <TipoEvento />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/tipousuario"
                element={
                    <ProtectedRoute role="administrador">
                        <TipoUsuario />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
    );
}

export default AppRoutes;
