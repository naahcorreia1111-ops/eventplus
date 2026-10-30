import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logoEvent from "../../assets/logo-event.svg";
import Botao from "../../Components/Botao/botao";
import { useAuth } from "../../context/auth";
import "./Login.css";
import Campo from "../../Components/campo/Campo";
import { getApiErrorMessage } from "../../services/api";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, autenticado } = useAuth();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (autenticado) navigate("/home", { replace: true });
    }, [autenticado, navigate]);

    async function entrar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro("");
        setEnviando(true);

        try {
            await login({ email: email.trim(), senha });
            const state = location.state as { from?: string } | null;
            navigate(state?.from || "/home", { replace: true });
        } catch (error) {
            setErro(getApiErrorMessage(error));
        } finally {
            setEnviando(false);
        }
    }

    return (
        <main className="login-page">
            <div className="login-card">
                <img src={logoEvent} alt="EventPlus logo" className="login-logo" />

                <form className="login-form" onSubmit={entrar} noValidate>
                    <div className="login-campo-grupo">
                        <label htmlFor="login-email" className="visually-hidden">
                            Login
                        </label>
                        <Campo
                            id="login-email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Login"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="login-campo-grupo">
                        <label htmlFor="login-senha" className="visually-hidden">
                            Senha
                        </label>
                        <Campo
                            id="login-senha"
                            name="senha"
                            type="password"
                            value={senha}
                            onChange={(event) => setSenha(event.target.value)}
                            placeholder="Senha"
                            autoComplete="current-password"
                            minLength={6}
                            required
                        />
                    </div>

                    <a
                        href="#esqueceu"
                        className="login-esqueceu-senha"
                        onClick={(e) => e.preventDefault()}
                    >
                        Esqueceu a senha?
                    </a>

                    <Botao
                        texto={enviando ? "Entrando..." : "Entrar"}
                        type="submit"
                        disabled={enviando}
                        className="login-btn-entrar"
                    />

                    {erro ? (
                        <p className="login-erro" role="alert">
                            {erro}
                        </p>
                    ) : null}
                </form>
            </div>
        </main>
    );
}

export default Login;
