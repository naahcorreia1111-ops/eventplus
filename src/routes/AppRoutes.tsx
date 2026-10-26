import { Navigate, Route, Routes } from "react-router-dom";

import Home from "../pages/Home/Home";
import Eventos from "../pages/Home/Eventos/eventos";
import DetalhesEvento from "../pages/Home/DetalhesEvento/DetalhesEvento";
import Login from "../pages/Login/Login";
import Usuarios from "../pages/Usuarios/Usuarios";
import TipoEvento from "../pages/TipoEvento/TipoEvento";
import { useAuth, perfilEhAdministrador } from "../context/auth";
import TipoUsuario from "../pages/TipoUsuario/TipoUsuario";

function AppRoutes() {
    const { autenticado, perfil, carregandoSessao } = useAuth();

    const administrador = perfilEhAdministrador(perfil);

    if (carregandoSessao) {
        return <p>Carregando...</p>;
    }

    return (
        <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route
                path="/eventos/:id"
                element={<DetalhesEvento />}
            />
            <Route path="/login" element={<Login />} />

            <Route
                path="/usuarios"
                element={
                    autenticado && administrador
                        ? <Usuarios />
                        : <Navigate to="/home" replace />
                }
            />

            <Route
                path="/tipoevento"
                element={
                    autenticado && administrador
                        ? <TipoEvento />
                        : <Navigate to="/home" replace />
                }
            />

            <Route
                path="/tipousuario"
                element={
                    autenticado && administrador
                        ? <TipoUsuario />
                        : <Navigate to="/home" replace />
                }
            />

            <Route
                path="*"
                element={<Navigate to="/home" replace />}
            />
        </Routes>
    );
}

export default AppRoutes;
