import "./Home.css";

import visaoImg from "../../assets/visao-img.png";

import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import CardEvento from "../../Components/CardEvento/CardEvento";
import Carrossel from "../../Components/Carrossel/Carrossel";
import { useCallback, useEffect, useState } from "react";
import type { Evento } from "../../types/api";
import { eventoService } from "../../services/eventPlusservice";
import { getApiErrorMessage } from "../../services/api";

function Home() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
        const dados = await eventoService.listarProximos();
        
        // Obter a data atual
        const hoje = new Date();

        // Filtrar apenas eventos cuja data seja maior ou igual a hoje
        const eventosFuturos = dados.filter((item) => {
            if (!item.dataEvento) return true;
            return new Date(item.dataEvento) >= hoje;
        });

        setEventos(eventosFuturos.slice(0, 3));
    } catch (error) {
        setErro(getApiErrorMessage(error));
    } finally {
        setCarregando(false);
    }
}, []);


    useEffect(() => {
        const timeout = window.setTimeout(() => void carregar(), 0);
        return () => window.clearTimeout(timeout);
    }, [carregar]);

    useEffect(() => {
        if (window.location.hash === '#contato') {
            requestAnimationFrame(() => document.querySelector('#contato')?.scrollIntoView());
        }
    }, []);

    return (
        <>
            <Header />

            <main>
                <Carrossel />

                <section className="home-visao">
                    <div className="home-visao-container">
                        <img src={visaoImg} alt="Pessoas confraternizando" />

                        <div className="home-visao-texto">
                            <h1>Visão</h1>
                            <p>A EventPlus organiza eventos e informações em uma interface direta, facilitando a consulta da agenda e a participação dos usuários.</p>
                        </div>
                    </div>
                </section>

                <section id="eventos" className="home-eventos">
                    <div className="home-eventos-titulo">
                        <h2>Próximos Eventos</h2>
                        <hr />
                    </div>

                    {carregando ? (
                        <p>Carregando próximos eventos...</p>
                    ) : null}

                    {erro ? (
                        <p className="home-mensagem-erro">{erro}</p>
                    ) : null}

                    {!carregando && !erro && eventos.length === 0 ? (
                        <p>Nenhum próximo evento cadastrado</p>
                    ) : null}

                    <div className="home-eventos-lista">
                        {eventos.map((evento) => (
                            <CardEvento
                                key={evento.idEvento}
                                id={evento.idEvento}
                                titulo={evento.nome}
                                imagem={evento.imagemUrl}
                                descricao={evento.descricao}
                                categoria={evento.idTipoEventoNavigation?.tituloTipoEvento}
                            />
                        ))}
                    </div>
                </section>

                <section id="contato" className="home-contato">
                    <div className="home-contato-container">
                        <div className="home-contato-titulo">
                            <h2>Contato</h2>
                            <hr />
                        </div>

                        <div className="home-contato-conteudo">
                            <div className="home-contato-texto">
                                <p>Rua Niterói, 180 - Centro</p>
                                <p>São Caetano do Sul - SP</p>
                            </div>

                            <iframe
                                title="Localização do SENAI São Caetano do Sul"
                                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d29245.59119805405!2d-46.5707243!3d-23.6151292!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5d11c031c57f%3A0x8f79f71018065a16!2sSENAI%20S%C3%A3o%20Caetano%20do%20Sul%20-%20Cyber%20e%20IA!5e0!3m2!1spt-BR!2sbr!4v1791222415327!5m2!1spt-BR!2sbr"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}

export default Home;