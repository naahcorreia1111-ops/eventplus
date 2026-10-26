
import { Link, NavLink, useNavigate } from "react-router-dom";

import logoEvent from "../../assets/logo-event.svg";
import "./Header.css";
import { perfilEhAdministrador, perfilEhOrganizador, useAuth } from "../../context/auth";


function Header() {

    const { autenticado, usuario, perfil, logout } = useAuth();

    const navigate = useNavigate();
    const administador = perfilEhAdministrador(perfil);
    const organizador = perfilEhOrganizador(perfil);

    function sair() {

        logout();
        navigate("/");

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
                    <NavLink to="/usuarios">Usuários</NavLink>
                    <Link to="/home#contato">Contatos</Link>
                </nav>


              {autenticado ? 
              <>
              
              <Link to="/conta"> Minha Conta </Link>
              <Link onClick={logout} to="/login" >Sair</Link>
              </>
              :
               <Link to="/login">Entrar</Link>
              }

            </div>
        </header>
    )
}


export default Header