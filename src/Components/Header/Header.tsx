import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import logoEvent from "../../assets/logo-event.svg";
import "./Header.css";
import {
    perfilEhAdministrador,
    perfilEhOrganizador,
    useAuth
} from "../../context/auth";

function Header() {
    const { autenticado, perfil, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const administrador = perfilEhAdministrador(perfil);
    const organizador = perfilEhOrganizador(perfil);

    function sair() {
        logout();
        navigate("/login");
    }

    function rolarParaContato(event: React.MouseEvent<HTMLAnchorElement>) {
        if (location.pathname === "/home" || location.pathname === "/") {
            event.preventDefault();
            const elemento = document.getElementById("contato");
            if (elemento) {
                elemento.scrollIntoView({ behavior: "smooth" });
                window.history.pushState(null, "", "/home#contato");
            }
        }
    }

    return (
        <header className="header">
            <div className="header-conteudo">
                <Link to="/home" className="header-logo">
                    <img src={logoEvent} alt="Logo Event+" />
                </Link>

                <nav className="header-nav">
                    <NavLink to="/home">Home</NavLink>
                    <NavLink to="/eventos">Eventos</NavLink>

                    {organizador && (
                        <NavLink to="/cadastroEvento">Cadastro de Eventos</NavLink>
                    )}

                    {administrador && (
                        <>
                            <NavLink to="/usuarios">Usuários</NavLink>
                            <NavLink to="/tipoevento">Tipos de Evento</NavLink>
                            <NavLink to="/tipousuario">Tipos de Usuário</NavLink>
                        </>
                    )}

                    <Link to="/home#contato" onClick={rolarParaContato}>
                        Contatos
                    </Link>
                </nav>

                <div className="header-usuario-area">
                    {autenticado ? (
                        <div className="header-usuario-acoes">
                            <span className="header-usuario-label">Usuário</span>
                            <button
                                type="button"
                                className="header-btn-sair"
                                onClick={sair}
                                title="Sair da conta"
                            >
                                Sair
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="header-link-login">
                            Entrar
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
