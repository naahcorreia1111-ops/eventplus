
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import type { Evento } from "../../../types/api";
import { eventoService } from "../../../services/eventPlusservice";

import imagemPadrao from "../../../assets/banner-1.png";
import Header from "../../../Components/Header/Header";
import Footer from "../../../Components/Footer/Footer";

import "./DetalhesEvento.css";


function DetalhesEvento() {
    const { id = "" } = useParams();


    const [evento, setEvento] = useState<Evento | null>(null);
    const [secaocomentarios, setSecaoComentarios] = useState<boolean>(false);
    const [presenca, setPresenca] = useState<Presenca | null>(null);
    const [presencaCarregada, setPresencaCarregada] = useState("")
    const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false)


    useEffect(() => {
        async function carregar() {
            if (!id) return;


            const dados = await eventoService.buscar(id);


            setEvento(dados);
        }


        void carregar();
    }, [id]);


    function mostrarEvento() {
        console.log(evento)
    }


    const chavePresenca = usuario && id ? ${usuario.idUsuario}:${id} : ""
    const checandoPresenca = Boolean(chavePresenca && presencaCarregada !== chavePresenca)


    return (
        <>
            <Header />
            <main>
                <img src={evento?.imagemUrl || imagemPadrao} alt="Banner do evento" />
                <h1>{evento?.nome}</h1>
                <div>
                    <p>ID recebido: {id}</p>
                    <button onClick={() => setSecaoComentarios(false)}>Sobre o Evento</button>
                    <button onClick={() => setSecaoComentarios(true)}>Comentários</button>
                    {secaocomentarios ? <h2>Comentários</h2> : <h2>Descrição do evento</h2>}
                    :
                    <>
                        <p>{evento?.descricao}</p>
                    </>
                </div>


                <div>
                    <h2>Informações principais</h2>
                    <hr />


                    <div><img src={relogio} alt="" /><span>{evento?.dataEvento}</span></div>
                    <div><img src={filtro} alt="" /><span>{evento?.idInstituicaoNavigation?.nomeFantasia}</span></div>
                    <div><img src={predio} alt="" /><span>{evento?.idTipoEventoNavigation?.titulo}</span></div>
                    <Botao className={presenca ? "detalhe-evento-cancelar" : ""}texto={}
                    />
                </div>
            </main>
            <Footer />
        </>
    )
}


export default DetalhesEvento;