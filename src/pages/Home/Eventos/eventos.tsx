

import "./Eventos.css";

import { useEffect, useState } from "react";

import Header from "../../../Components/Header/Header";
import Footer from "../../../Components/Footer/Footer";
import CardEvento from "../../../Components/CardEvento/CardEvento";

import type { Evento } from "../../../types/api";
import { eventoService } from "../../../services/eventPlusservice";


function Eventos() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [categoriaSelecionada, setCategoriaSelecionada] =
        useState("Todos");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");


    const categorias = [
        "Todos",
        "Tecnologia",
        "Design",
        "Programação"
    ];


    useEffect(() => {
        async function carregar() {
            try {
                setCarregando(true);
                setErro("");


                const dados = await eventoService.listar();


                console.log("Eventos recebidos:", dados);


                setEventos(Array.isArray(dados) ? dados : []);
            } catch (error) {
                console.error("Erro ao buscar eventos:", error);
                setErro("Não foi possível carregar os eventos.");
            } finally {
                setCarregando(false);
            }
        }


        void carregar();
    }, []);


    const eventosFiltrados = eventos.filter((evento) => {
        if (categoriaSelecionada === "Todos") {
            return true;
        }


        const categoria =
            evento.idTipoEventoNavigation?.titulo ?? "";


        return categoria.trim().toLowerCase() ===
            categoriaSelecionada.trim().toLowerCase();
    });


    return (
        <>
            <Header />


            <main className="eventos-pagina">
                <section className="eventos-container">
                    <div className="eventos-titulo">
                        <h1>Catálogo de eventos</h1>
                        <hr />
                    </div>


                    <nav
                        className="eventos-filtros"
                        aria-label="Filtrar eventos por categoria"
                    >
                        {categorias.map((categoria) => (
                            <button
                                key={categoria}
                                type="button"
                                className={
                                    categoriaSelecionada === categoria
                                        ? "eventos-filtro ativo"
                                        : "eventos-filtro"
                                }
                                onClick={() =>
                                    setCategoriaSelecionada(categoria)
                                }
                                aria-pressed={
                                    categoriaSelecionada === categoria
                                }
                            >
                                {categoria}
                            </button>
                        ))}
                    </nav>


                    <div className="eventos-lista">
                        {carregando ? (
                            <p className="eventos-sem-resultado">
                                Carregando eventos...
                            </p>
                        ) : erro ? (
                            <p className="eventos-sem-resultado">
                                {erro}
                            </p>
                        ) : eventosFiltrados.length > 0 ? (
                            eventosFiltrados.map((evento) => (
                                <CardEvento
                                    key={evento.idEvento}
                                    id={String(evento.idEvento)}
                                    imagem={evento.imagemUrl}
                                    categoria={
                                        evento.idTipoEventoNavigation
                                            ?.titulo ??
                                        "Sem categoria"
                                    }
                                    titulo={evento.nome}
                                    descricao={evento.descricao}
                                />
                            ))
                        ) : (
                            <p className="eventos-sem-resultado">
                                {eventos.length === 0
                                    ? "Nenhum evento foi retornado pela API."
                                    : "Nenhum evento encontrado nesta categoria."}
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