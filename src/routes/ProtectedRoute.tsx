import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { perfilEhAdministrador, perfilEhOrganizador, useAuth } from "../context/auth";

interface ProtectedRouteProps extends PropsWithChildren {
    role?: "administrador" | "organizador";
}

function ProtectedRoute({ children, role }: ProtectedRouteProps) {
    const { autenticado, carregandoSessao, perfil } = useAuth();
    const location = useLocation();

    if (carregandoSessao) {
        return (
            <main style={{ padding: "40px 20px", textAlign: "center" }}>
                <p>Carregando sessão...</p>
            </main>
        );
    }

    if (!autenticado) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    const autorizado =
        !role ||
        (role === "administrador" && perfilEhAdministrador(perfil)) ||
        (role === "organizador" && perfilEhOrganizador(perfil));

    if (!autorizado) {
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;
