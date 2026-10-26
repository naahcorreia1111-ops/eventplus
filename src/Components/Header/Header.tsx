
import { Link, NavLink } from "react-router-dom";

import logoEvent from "../../assets/logo-event.svg";
import "./Header.css";


function Header() {
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


                    <Link to="/login">Entrar</Link>
                </div>
            </header>
        )
}


export default Header