import {
    useCallback,
    useEffect,
    useState,
    type FormEvent
} from "react";

import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import Campo from "../../Components/campo/Campo";
import Botao from "../../Components/Botao/botao";
import ModalConfirmacao from "../../Components/ModalConfirmacao/ModalConfirmacao";

import lapis from "../../assets/lapis.svg";
import lixeira from "../../assets/lixeira.svg";

import { tipoUsuarioService } from "../../services/eventPlusservice";
import { getApiErrorMessage } from "../../services/api";
import type { TipoUsuario as TipoUsuarioModel } from "../../types/api";

import "./TipoUsuario.css";

function TipoUsuario() {
    const [titulo, setTitulo] = useState("");
    const [tipos, setTipos] = useState<TipoUsuarioModel[]>([]);
    const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);
    const [selecionado, setSelecionado] = useState<TipoUsuarioModel | null>(null);

    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState("");

    const carregar = useCallback(async () => {
        setCarregando(true);
        setMensagem("");

        try {
            const dados = await tipoUsuarioService.listar();
            setTipos(dados);
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    function limpar() {
        setTitulo("");
        setIdEmEdicao(null);
        setMensagem("");
    }

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!titulo.trim()) {
            setMensagem("Informe o título do tipo de usuário.");
            return;
        }

        setEnviando(true);
        setMensagem("");

        try {
            const payload = {
                titulo: titulo.trim()
            };

            if (idEmEdicao) {
                await tipoUsuarioService.atualizar(idEmEdicao, payload);
            } else {
                await tipoUsuarioService.cadastrar(payload);
            }

            limpar();
            await carregar();
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
        } finally {
            setEnviando(false);
        }
    }

    function editar(item: TipoUsuarioModel) {
        setIdEmEdicao(item.idTipoUsuario);
        setTitulo(item.titulo);
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
            await tipoUsuarioService.excluir(selecionado.idTipoUsuario);

            if (idEmEdicao === selecionado.idTipoUsuario) {
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

            <main className="tipo-usuario-page">
                <section className="tipo-usuario-cadastro">
                    <h1 className="tipo-usuario-titulo">
                        ADMINISTRAÇÃO TIPO DE USUÁRIOS
                    </h1>
                    <hr className="tipo-usuario-linha-titulo" />

                    <div className="tipo-usuario-conteudo">
                        <div
                            className="tipo-usuario-ilustracao"
                            aria-hidden="true"
                        >
                            <div className="tipo-usuario-ilustracao-janela">
                                <div className="tipo-usuario-bolinhas">
                                    <span />
                                    <span />
                                    <span />
                                </div>

                                <div className="tipo-usuario-linhas">
                                    <span />
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            </div>

                            <div className="tipo-usuario-avatar">
                                <div className="tipo-usuario-cabelo" />
                                <div className="tipo-usuario-rosto" />
                                <div className="tipo-usuario-corpo" />
                                <span className="tipo-usuario-mais">+</span>
                            </div>
                        </div>

                        <form
                            className="tipo-usuario-formulario"
                            onSubmit={salvar}
                        >
                            <label
                                className="visually-hidden"
                                htmlFor="titulo-tipo-usuario"
                            >
                                Título
                            </label>

                            <Campo
                                id="titulo-tipo-usuario"
                                name="titulo"
                                type="text"
                                value={titulo}
                                onChange={(event) => setTitulo(event.target.value)}
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
                                    className="tipo-usuario-cancelar"
                                    type="button"
                                    onClick={limpar}
                                    disabled={enviando}
                                >
                                    Cancelar edição
                                </button>
                            )}

                            {mensagem && (
                                <p
                                    className="tipo-usuario-mensagem"
                                    role="alert"
                                >
                                    {mensagem}
                                </p>
                            )}
                        </form>
                    </div>
                </section>

                <section className="tipo-usuario-lista">
                    <div className="tipo-usuario-lista-container">
                        <h2>LISTA TIPO DE USUÁRIOS</h2>
                        <hr className="tipo-usuario-linha-lista" />

                        <table className="tipo-usuario-tabela">
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
                                        <td colSpan={3}>Carregando...</td>
                                    </tr>
                                ) : tipos.length === 0 ? (
                                    <tr>
                                        <td colSpan={3}>
                                            Nenhum tipo de usuário cadastrado.
                                        </td>
                                    </tr>
                                ) : (
                                    tipos.map((item) => (
                                        <tr key={item.idTipoUsuario}>
                                            <td>{item.titulo}</td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="tipo-usuario-acao"
                                                    aria-label={`Editar ${item.titulo}`}
                                                    onClick={() => editar(item)}
                                                >
                                                    <img src={lapis} alt="Editar" />
                                                </button>
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="tipo-usuario-acao"
                                                    aria-label={`Excluir ${item.titulo}`}
                                                    onClick={() => setSelecionado(item)}
                                                >
                                                    <img src={lixeira} alt="Excluir" />
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
                    titulo="Excluir tipo de usuário"
                    mensagem={
                        selecionado
                            ? `Deseja excluir "${selecionado.titulo}"?`
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

export default TipoUsuario;