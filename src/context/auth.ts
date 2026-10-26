import { createContext, useContext } from "react";
import type { AuthSession, LoginPayload, Usuario } from "../types/api";

export interface AuthContextValue {
    session: AuthSession | null;
    usuario: Usuario | null;
    perfil: string;
    autenticado: boolean;
    carregandoSessao: boolean;
    login: (payload: LoginPayload) => Promise<void>;
    logout: () => void;
    atualizarUsuario: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth precisa estar dentro de AuthProvider.");
    }
    return context;
}

export function perfilEhAdministrador(perfil: string) {
    const perfilNormalizado = perfil?.trim().toLowerCase();

    return (
        perfilNormalizado === "admin" ||
        perfilNormalizado === "administrador"
    );
}

export function perfilEhOrganizador(perfil: string) {
    const perfilNormalizado = perfil?.trim().toLowerCase();

    return (
        perfilEhAdministrador(perfilNormalizado) ||
        perfilNormalizado === "organizador"
    );
}