import { Link, NavLink, useNavigate } from "react-router-dom";

import logoEvent from "../../assets/logo-event.svg";
import "./Header.css";
import {
    perfilEhAdministrador,
    perfilEhOrganizador,
    useAuth
} from "../../context/auth";

function Header() {
    const { autenticado, perfil, logout } = useAuth();

    const navigate = useNavigate();
    const administrador = perfilEhAdministrador(perfil);
    const organizador = perfilEhOrganizador(perfil);

    function sair() {
        logout();
        navigate("/login");
    }

    return (
        <header className="header">
            <div className="header-conteudo">
                <Link to="/home">
                    <img src={logoEvent} alt="Logo Event+" />
                </Link>

                <nav>
                    <NavLink to="/home">Home</NavLink>
                    <NavLink to="/eventos">Eventos</NavLink>

                    {administrador && (
                        <>
                            <NavLink to="/usuarios">Usuários</NavLink>
                            <NavLink to="/tipoevento">Cadastro</NavLink>
                        </>
                    )}

                    <Link to="/home#contato">Contatos</Link>
                </nav>

                {autenticado ? (
                    <>
                        {organizador && (
                            <Link to="/conta">Minha Conta</Link>
                        )}

                        <button type="button" onClick={sair}>
                            Sair
                        </button>
                    </>
                ) : (
                    <Link to="/login">Entrar</Link>
                )}
            </div>
        </header>
    );
}

export default Header;
