import { useLocation, useNavigate } from "react-router-dom";
import logoEvent from "../../assets/logo-event.svg";


import "./Login.css";


function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, autenticado } = useAuth();


    return (
        <main>
            <img src={logoEvent} alt="EventPlus logo" />
        </main>
    );
}


export default Login;