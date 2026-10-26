
import {
    useEffect,
    useRef,
    useState,
    type PropsWithChildren
} from "react";

import type { AuthSession, LoginPayload } from "../types/api";
import {
    SESSION_STORAGE_KEY,
    UNAUTHORIZED_EVENT
} from "../services/api";

import {
    authService,
    usuarioService,
    tipoUsuarioService
} from "../services/eventPlusservice";

import { AuthContext } from "./auth";

function readSession() {
    try {
        const value = localStorage.getItem(SESSION_STORAGE_KEY);

        if (!value) return null;

        const session = JSON.parse(value) as AuthSession;

        if (
            !session.token ||
            new Date(session.expiracao).getTime() <= Date.now()
        ) {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            return null;
        }

        return session;
    } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
    }
}

async function completarPerfil(usuario: AuthSession["usuario"]) {
    if (usuario.idTipoUsuarioNavigation?.titulo) {
        return usuario;
    }

    const tipos = await tipoUsuarioService.listar();

    const tipo = tipos.find(
        (item) => item.idTipoUsuario === usuario.idTipoUsuario
    );

    if (!tipo) {
        return usuario;
    }

    return {
        ...usuario,
        idTipoUsuarioNavigation: tipo
    };
}

export function AuthProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<AuthSession | null>(
        () => readSession()
    );

    const initialSession = useRef(session);

    const [carregandoSessao, setCarregandoSessao] = useState(
        Boolean(session)
    );

    function persist(next: AuthSession | null) {
        setSession(next);

        if (next) {
            localStorage.setItem(
                SESSION_STORAGE_KEY,
                JSON.stringify(next)
            );
        } else {
            localStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }

    async function atualizarUsuario() {
        if (!session) return;

        const usuario = await usuarioService.buscar(
            session.usuario.idUsuario
        );

        const usuarioCompleto = await completarPerfil(usuario);

        persist({
            ...session,
            usuario: usuarioCompleto
        });
    }

    async function login(payload: LoginPayload) {
        const loginResponse = await authService.login(payload);

        persist(loginResponse);

        try {
            const usuario = await usuarioService.buscar(
                loginResponse.usuario.idUsuario
            );

            const usuarioCompleto = await completarPerfil(usuario);

            persist({
                ...loginResponse,
                usuario: usuarioCompleto
            });
        } catch (error) {
            console.error(
                "Não foi possível carregar os dados completos do usuário:",
                error
            );
        }
    }

    function logout() {
        persist(null);
    }

    useEffect(() => {
        const handleUnauthorized = () => persist(null);

        window.addEventListener(
            UNAUTHORIZED_EVENT,
            handleUnauthorized
        );

        return () => {
            window.removeEventListener(
                UNAUTHORIZED_EVENT,
                handleUnauthorized
            );
        };
    }, []);

    useEffect(() => {
        const restored = initialSession.current;

        if (!restored) return;

        usuarioService
            .buscar(restored.usuario.idUsuario)
            .then(async (usuario) => {
                const usuarioCompleto = await completarPerfil(usuario);

                const next = {
                    ...restored,
                    usuario: usuarioCompleto
                };

                localStorage.setItem(
                    SESSION_STORAGE_KEY,
                    JSON.stringify(next)
                );

                setSession(next);
            })
            .catch((error) => {
                console.error(
                    "Não foi possível restaurar a sessão:",
                    error
                );
            })
            .finally(() => {
                setCarregandoSessao(false);
            });
    }, []);

    const perfil =
        session?.usuario.idTipoUsuarioNavigation?.titulo
            ?.trim()
            .toLowerCase() ?? "";

    return (
        <AuthContext.Provider
            value={{
                session,
                usuario: session?.usuario ?? null,
                perfil,
                autenticado: Boolean(session),
                carregandoSessao,
                login,
                logout,
                atualizarUsuario
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}