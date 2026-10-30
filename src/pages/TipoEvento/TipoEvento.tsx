import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import Campo from "../../Components/campo/Campo";
import Botao from "../../Components/Botao/botao";
import ModalConfirmacao from "../../Components/ModalConfirmacao/ModalConfirmacao";

import lapis from "../../assets/lapis.svg";
import lixeira from "../../assets/lixeira.svg";
import ilustracao from "../../assets/Vector.png";

import { tipoEventoService } from "../../services/eventPlusservice";
import { getApiErrorMessage } from "../../services/api";
import type { TipoEvento as TipoEventoModel } from "../../types/api";
import "./TipoEvento.css";

function TipoEvento() {
    const [titulo, setTitulo] = useState("");
    const [tiposEventos, setTiposEventos] = useState<TipoEventoModel[]>([]);
    const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);
    const [selecionado, setSelecionado] = useState<TipoEventoModel | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState("");

    const carregar = useCallback(async () => {
        setCarregando(true);
        setMensagem("");

        try {
            const dados = await tipoEventoService.listar();
            setTiposEventos(dados);
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => void carregar(), 0);
        return () => window.clearTimeout(timeout);
    }, [carregar]);

    function limpar() {
        setTitulo("");
        setIdEmEdicao(null);
        setMensagem("");
    }

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!titulo.trim()) {
            setMensagem("Informe o título do tipo de evento.");
            return;
        }

        setEnviando(true);
        setMensagem("");

        try {
            const payload = {
                tituloTipoEvento: titulo.trim(),
                titulo: titulo.trim()
            };

            if (idEmEdicao) {
                await tipoEventoService.atualizar(idEmEdicao, payload);
            } else {
                await tipoEventoService.cadastrar(payload);
            }

            limpar();
            await carregar();
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
        } finally {
            setEnviando(false);
        }
    }

    function editar(item: TipoEventoModel) {
        setIdEmEdicao(item.idTipoEvento);
        setTitulo(item.tituloTipoEvento || item.titulo || "");
        setMensagem("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    async function excluir() {
        if (!selecionado) return;

        setEnviando(true);
        setMensagem("");

        try {
            await tipoEventoService.excluir(selecionado.idTipoEvento);
            if (idEmEdicao === selecionado.idTipoEvento) {
                limpar();
            }
            setSelecionado(null);
            await carregar();
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
            setSelecionado(null);
        } finally {
            setEnviando(false);
        }
    }

    return (
        <>
            <Header />

            <main className="tipo-evento-page">
                <section className="tipo-evento-cadastro">
                    <h1 className="tipo-evento-titulo">
                        ADMINISTRAÇÃO TIPO DE EVENTOS
                    </h1>

                    <hr className="tipo-evento-linha-titulo" />

                    <div className="tipo-evento-conteudo">
                        <div className="tipo-evento-ilustracao">
                            <img
                                src={ilustracao}
                                alt="Ilustração tipo de evento"
                            />
                        </div>

                        <form
                            className="tipo-evento-formulario"
                            onSubmit={salvar}
                        >
                            <label
                                className="visually-hidden"
                                htmlFor="titulo-tipo-evento"
                            >
                                Título
                            </label>

                            <Campo
                                id="titulo-tipo-evento"
                                name="titulo"
                                type="text"
                                value={titulo}
                                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                    setTitulo(event.target.value)
                                }
                                placeholder="Título"
                                maxLength={100}
                                required
                            />

                            <Botao
                                texto={
                                    enviando
                                        ? "Salvando..."
                                        : idEmEdicao
                                            ? "Atualizar"
                                            : "Cadastrar"
                                }
                                type="submit"
                                disabled={enviando}
                            />

                            {idEmEdicao && (
                                <button
                                    type="button"
                                    className="tipo-evento-cancelar"
                                    onClick={limpar}
                                    disabled={enviando}
                                >
                                    Cancelar edição
                                </button>
                            )}

                            {mensagem && (
                                <p role="alert">{mensagem}</p>
                            )}
                        </form>
                    </div>
                </section>

                <section className="tipo-evento-lista-section">
                    <div className="tipo-evento-lista-container">
                        <h2>LISTA TIPO DE EVENTOS</h2>

                        <hr className="tipo-evento-linha-lista" />

                        <table className="tipo-evento-tabela">
                            <thead>
                                <tr>
                                    <th>Título</th>
                                    <th>Editar</th>
                                    <th>Deletar</th>
                                </tr>
                            </thead>

                            <tbody>
                                {carregando ? (
                                    <tr>
                                        <td colSpan={3}>
                                            Carregando...
                                        </td>
                                    </tr>
                                ) : tiposEventos.length === 0 ? (
                                    <tr>
                                        <td colSpan={3}>
                                            Nenhum tipo de evento cadastrado
                                        </td>
                                    </tr>
                                ) : (
                                    tiposEventos.map((item) => (
                                        <tr key={item.idTipoEvento}>
                                            <td>{item.tituloTipoEvento || item.titulo}</td>

                                            <td>
                                                <button
                                                    type="button"
                                                    aria-label={`Editar ${item.tituloTipoEvento || item.titulo || ""}`}
                                                    onClick={() => editar(item)}
                                                >
                                                    <img
                                                        src={lapis}
                                                        alt="Editar"
                                                    />
                                                </button>
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    aria-label={`Excluir ${item.tituloTipoEvento || item.titulo || ""}`}
                                                    onClick={() => setSelecionado(item)}
                                                >
                                                    <img
                                                        src={lixeira}
                                                        alt="Deletar"
                                                    />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <ModalConfirmacao
                    show={Boolean(selecionado)}
                    titulo="Excluir Tipo de Evento"
                    mensagem={
                        selecionado
                            ? `Deseja excluir "${selecionado.tituloTipoEvento || selecionado.titulo || ""}"?`
                            : ""
                    }
                    textoCancelar="Cancelar"
                    onClose={() => setSelecionado(null)}
                    onConfirm={() => void excluir()}
                />
            </main>

            <Footer />
        </>
    );
}

export default TipoEvento;
