import { useEffect, useState } from "react";

import Header from "../../../Components/Header/Header";
import Footer from "../../../Components/Footer/Footer";
import CardEvento from "../../../Components/CardEvento/CardEvento";

import type { Evento } from "../../../types/api";
import { eventoService } from "../../../services/eventPlusservice";
import { getApiErrorMessage } from "../../../services/api";

import "./Eventos.css";

function Eventos() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let montado = true;

        async function carregar() {
            try {
                setCarregando(true);
                setErro("");

                const dados = await eventoService.listar();
                if (montado) {
                    setEventos(Array.isArray(dados) ? dados : []);
                }
            } catch (error) {
                if (montado) {
                    setErro(getApiErrorMessage(error));
                }
            } finally {
                if (montado) {
                    setCarregando(false);
                }
            }
        }

        const timeout = window.setTimeout(() => void carregar(), 0);
        return () => {
            montado = false;
            window.clearTimeout(timeout);
        };
    }, []);

    return (
        <>
            <Header />

            <main className="eventos-pagina">
                <section className="eventos-container">
                    <div className="eventos-titulo">
                        <h1>Catálogo de eventos</h1>
                        <hr />
                    </div>

                    <div className="eventos-lista">
                        {carregando ? (
                            <p className="eventos-sem-resultado">
                                Carregando eventos...
                            </p>
                        ) : erro ? (
                            <p className="eventos-sem-resultado">
                                {erro}
                            </p>
                        ) : eventos.length > 0 ? (
                            eventos.map((evento) => (
                                <CardEvento
                                    key={evento.idEvento}
                                    id={String(evento.idEvento)}
                                    imagem={evento.imagemUrl}
                                    categoria={
                                        evento.idTipoEventoNavigation?.titulo ||
                                        evento.idTipoEventoNavigation?.tituloTipoEvento ||
                                        "Evento"
                                    }
                                    titulo={
                                        evento.nome ||
                                        (evento as unknown as { titulo?: string })?.titulo ||
                                        (evento as unknown as { nomeEvento?: string })?.nomeEvento ||
                                        "Evento"
                                    }
                                    descricao={evento.descricao}
                                />
                            ))
                        ) : (
                            <p className="eventos-sem-resultado">
                                Nenhum evento cadastrado no momento.
                            </p>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}

export default Eventos;
