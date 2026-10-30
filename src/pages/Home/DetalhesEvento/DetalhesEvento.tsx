import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import "./DetalhesEvento.css";

import type {
    Comentario,
    Evento,
    Presenca,
    MensagemModeracao,
} from "../../../types/api";

import {
    comentarioService,
    eventoService,
    presencaService,
} from "../../../services/eventPlusservice";

import Botao from "../../../Components/Botao/botao";
import Campo from "../../../Components/campo/Campo";

import imagemPadrao from "../../../assets/banner-1.png";
import relogio from "../../../assets/relogio.svg";
import predio from "../../../assets/predio.svg";
import filtro from "../../../assets/filtro.svg";
import enviar from "../../../assets/enviar.svg";

import Header from "../../../Components/Header/Header";
import Footer from "../../../Components/Footer/Footer";
import ModalConfirmacao from "../../../Components/ModalConfirmacao/ModalConfirmacao";

import { useAuth } from "../../../context/auth";
import { getApiErrorMessage } from "../../../services/api";

function formatarDataExtenso(value?: string) {
    if (!value) return "Data não informada";
    const data = new Date(value);
    if (Number.isNaN(data.getTime())) return "Data não informada";
    const dia = data.getDate();
    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const mes = meses[data.getMonth()];
    const hora = String(data.getHours()).padStart(2, "0");
    const minuto = String(data.getMinutes()).padStart(2, "0");
    return `${dia} de ${mes} às ${hora}:${minuto}`;
}

function formatarDataComentario(value: string) {
    const data = new Date(value);
    if (Number.isNaN(data.getTime())) return "";
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const hora = String(data.getHours()).padStart(2, "0");
    const minuto = String(data.getMinutes()).padStart(2, "0");
    return `${dia}/${mes} - ${hora}:${minuto}`;
}

function DetalhesEvento() {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const { autenticado, usuario } = useAuth();

    const [evento, setEvento] = useState<Evento | null>(null);
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [secaoComentarios, setSecaoComentarios] = useState(false);

    const [presenca, setPresenca] = useState<Presenca | null>(null);
    const [presencaCarregada, setPresencaCarregada] = useState("");

    const [confirmandoCancelamento, setConfirmandoCancelamento] =
        useState(false);

    const [enviandoInscricao, setEnviandoInscricao] = useState(false);
    const [mensagemInscricao, setMensagemInscricao] = useState("");

    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    const [novoComentario, setNovoComentario] = useState("");
    const [mensagemComentario, setMensagemComentario] = useState("");
    const [enviandoComentario, setEnviandoComentario] = useState(false);

    const carregar = useCallback(async () => {
        if (!id) return;

        setCarregando(true);
        setErro("");

        try {
            const eventoAtual = await eventoService.buscar(id);

            const itemEncontrado = Array.isArray(eventoAtual)
                ? eventoAtual[0]
                : (eventoAtual as unknown as { dados?: Evento })?.dados || eventoAtual;

            setEvento(itemEncontrado || null);

            try {
                const comentariosAtuais = await comentarioService.listarPorEvento(id);
                setComentarios(comentariosAtuais);
            } catch {
                setComentarios([]);
            }
        } catch (error) {
            setErro(getApiErrorMessage(error));
        } finally {
            setCarregando(false);
        }
    }, [id]);

    useEffect(() => {
        const timeout = window.setTimeout(() => void carregar(), 0);
        return () => window.clearTimeout(timeout);
    }, [carregar]);

    useEffect(() => {
        let ativo = true;

        async function verificarPresenca() {
            if (!id || !autenticado || !usuario?.idUsuario) {
                setPresenca(null);
                setPresencaCarregada("");
                return;
            }

            const chave = `${usuario.idUsuario}:${id}`;

            setPresencaCarregada("");
            setPresenca(null);

            try {
                const presencas = await presencaService.listarPorUsuario(
                    usuario.idUsuario
                );

                if (!ativo) return;

                const encontrada = presencas.find(
                    (item) =>
                        String(item.idEvento) === String(id) &&
                        item.situacao === true
                );

                setPresenca(encontrada ?? null);
            } catch {
                if (ativo) {
                    setPresenca(null);
                }
            } finally {
                if (ativo) {
                    setPresencaCarregada(chave);
                }
            }
        }

        void verificarPresenca();

        return () => {
            ativo = false;
        };
    }, [id, autenticado, usuario?.idUsuario]);

    const chavePresenca =
        autenticado && usuario && id
            ? `${usuario.idUsuario}:${id}`
            : "";

    const checandoPresenca = Boolean(
        chavePresenca && presencaCarregada !== chavePresenca
    );

    function exigirLogin() {
        if (autenticado && usuario) return false;

        navigate("/login", {
            state: { from: location.pathname },
        });

        return true;
    }

    async function inscrever() {
        if (exigirLogin() || !usuario || !evento) return;

        if (enviandoInscricao || checandoPresenca || presenca) return;

        setEnviandoInscricao(true);
        setMensagemInscricao("");
        setErro("");

        try {
            const novaPresenca = await presencaService.cadastrar({
                situacao: true,
                idEvento: evento.idEvento,
                idUsuario: usuario.idUsuario,
            });

            setPresenca(novaPresenca);
            setPresencaCarregada(chavePresenca);
            setMensagemInscricao("Inscrição realizada com sucesso.");
        } catch (error) {
            setMensagemInscricao(getApiErrorMessage(error));
        } finally {
            setEnviandoInscricao(false);
        }
    }

    async function cancelarInscricao() {
        if (!presenca || enviandoInscricao) return;

        setEnviandoInscricao(true);
        setMensagemInscricao("");

        try {
            await presencaService.excluir(presenca.idPresenca);

            setPresenca(null);
            setConfirmandoCancelamento(false);
            setMensagemInscricao("Inscrição cancelada com sucesso.");
        } catch (error) {
            setMensagemInscricao(getApiErrorMessage(error));
        } finally {
            setEnviandoInscricao(false);
        }
    }

    async function comentar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (exigirLogin() || !usuario || !evento) return;

        if (!novoComentario.trim() || enviandoComentario) return;

        setEnviandoComentario(true);
        setMensagemComentario("");
        setErro("");

        try {
            const response = await comentarioService.cadastrar({
                descricao: novoComentario.trim(),
                idEvento: evento.idEvento,
                idUsuario: usuario.idUsuario,
            });

            if ("mensagem" in response) {
                setMensagemComentario(
                    (response as MensagemModeracao).mensagem
                );
            } else {
                setComentarios((items) => [...items, response]);
                setMensagemComentario("Comentário publicado.");
                setNovoComentario("");
            }
        } catch (error) {
            setMensagemComentario(getApiErrorMessage(error));
        } finally {
            setEnviandoComentario(false);
        }
    }

    const tituloEvento =
        evento?.nome ||
        (evento as unknown as { titulo?: string })?.titulo ||
        (evento as unknown as { nomeEvento?: string })?.nomeEvento ||
        "Título do Evento";

    return (
        <>
            <Header />

            <main className="detalhes-evento-pagina">
                <div className="detalhes-evento-container">
                    {/* Imagem do Banner */}
                    <div className="detalhes-evento-banner-wrapper">
                        <img
                            src={evento?.imagemUrl || imagemPadrao}
                            alt={`Banner de ${tituloEvento}`}
                            className="detalhes-evento-banner"
                        />
                    </div>

                    {/* Título do Evento */}
                    <h1 className="detalhes-evento-titulo-principal">
                        {carregando ? "Carregando evento..." : tituloEvento}
                    </h1>

                    {erro && <p className="detalhes-evento-alerta-erro" role="alert">{erro}</p>}

                    {/* Grid de 2 Colunas */}
                    <div className="detalhes-evento-grid">
                        {/* Coluna Esquerda: Abas + Conteúdo */}
                        <div className="detalhes-evento-coluna-esquerda">
                            <div className="detalhes-evento-abas">
                                <button
                                    type="button"
                                    className={`detalhes-evento-aba-btn ${!secaoComentarios ? "ativo" : ""}`}
                                    onClick={() => setSecaoComentarios(false)}
                                >
                                    Sobre o evento
                                </button>

                                <button
                                    type="button"
                                    className={`detalhes-evento-aba-btn ${secaoComentarios ? "ativo" : ""}`}
                                    onClick={() => setSecaoComentarios(true)}
                                >
                                    Comentários
                                </button>
                            </div>

                            {secaoComentarios ? (
                                <div className="detalhes-evento-comentarios-secao">
                                    <form onSubmit={comentar} className="detalhes-evento-comentario-form">
                                        <label
                                            className="visually-hidden"
                                            htmlFor="novo-comentario"
                                        >
                                            Comentar
                                        </label>

                                        <div className="detalhes-evento-input-enviar-wrapper">
                                            <Campo
                                                id="novo-comentario"
                                                value={novoComentario}
                                                maxLength={200}
                                                placeholder="Comentar"
                                                onChange={(event) =>
                                                    setNovoComentario(
                                                        event.target.value
                                                    )
                                                }
                                                required
                                            />

                                            <button
                                                type="submit"
                                                className="detalhes-evento-btn-enviar"
                                                aria-label="Enviar comentário"
                                                disabled={
                                                    enviandoComentario ||
                                                    !novoComentario.trim()
                                                }
                                            >
                                                <img src={enviar} alt="Enviar" />
                                            </button>
                                        </div>
                                    </form>

                                    {mensagemComentario && (
                                        <p
                                            className="detalhe-evento-mensagem-status"
                                            role="status"
                                        >
                                            {mensagemComentario}
                                        </p>
                                    )}

                                    <div className="detalhes-evento-lista-comentarios">
                                        {comentarios.length > 0 ? (
                                            comentarios.map((comentario) => (
                                                <article
                                                    key={comentario.idComentario}
                                                    className="detalhes-evento-comentario-card"
                                                >
                                                    <div className="detalhes-evento-comentario-cabecalho">
                                                        <strong className="detalhes-evento-comentario-autor">
                                                            {comentario.idUsuarioNavigation?.nome || "Usuário"}
                                                        </strong>
                                                        <span className="detalhes-evento-comentario-data">
                                                            {formatarDataComentario(comentario.dataComentario)}
                                                        </span>
                                                    </div>

                                                    <p className="detalhes-evento-comentario-texto">
                                                        {comentario.descricao}
                                                    </p>
                                                </article>
                                            ))
                                        ) : (
                                            <p className="detalhes-evento-sem-comentarios">
                                                Nenhum comentário publicado ainda. Seja o primeiro a comentar!
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="detalhes-evento-sobre-secao">
                                    <p className="detalhes-evento-descricao-texto">
                                        {evento?.descricao ||
                                            "Nenhuma descrição detalhada informada para este evento."}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Coluna Direita: Informações Principais */}
                        <div className="detalhes-evento-coluna-direita">
                            <h2 className="detalhes-evento-info-titulo">
                                INFORMAÇÕES PRINCIPAIS
                            </h2>
                            <hr className="detalhes-evento-info-linha" />

                            <div className="detalhes-evento-info-lista">
                                <div className="detalhes-evento-info-item">
                                    <img src={relogio} alt="Horário" />
                                    <span>{formatarDataExtenso(evento?.dataEvento)}</span>
                                </div>

                                <div className="detalhes-evento-info-item">
                                    <img src={predio} alt="Instituição" />
                                    <span>
                                        {evento?.idInstituicaoNavigation?.nomeFantasia ||
                                            "Senai Cyber & IA - São Caetano do Sul"}
                                    </span>
                                </div>

                                <div className="detalhes-evento-info-item">
                                    <img src={filtro} alt="Categoria" />
                                    <span>
                                        {evento?.idTipoEventoNavigation?.titulo ||
                                            evento?.idTipoEventoNavigation?.tituloTipoEvento ||
                                            "Inteligência Artificial"}
                                    </span>
                                </div>
                            </div>

                            <Botao
                                className="detalhes-evento-btn-inscricao"
                                texto={
                                    checandoPresenca
                                        ? "Verificando inscrição..."
                                        : enviandoInscricao
                                          ? "Aguarde..."
                                          : presenca
                                            ? "Cancelar Inscrição"
                                            : "Se-inscrever"
                                }
                                type="button"
                                disabled={
                                    checandoPresenca ||
                                    enviandoInscricao ||
                                    carregando ||
                                    !evento
                                }
                                onClick={() => {
                                    if (checandoPresenca || enviandoInscricao) return;

                                    if (presenca) {
                                        setConfirmandoCancelamento(true);
                                    } else {
                                        void inscrever();
                                    }
                                }}
                            />

                            {mensagemInscricao && (
                                <p
                                    className="detalhe-evento-mensagem-status"
                                    role="status"
                                >
                                    {mensagemInscricao}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <ModalConfirmacao
                show={confirmandoCancelamento}
                titulo="Cancelar inscrição"
                mensagem={`Deseja cancelar sua inscrição em "${tituloEvento}"?`}
                textoConfirmar={
                    enviandoInscricao
                        ? "Cancelando..."
                        : "Cancelar Inscrição"
                }
                textoCancelar="Manter inscrição"
                onClose={() => {
                    if (!enviandoInscricao) {
                        setConfirmandoCancelamento(false);
                    }
                }}
                onConfirm={() => void cancelarInscricao()}
            />

            <Footer />
        </>
    );
}

export default DetalhesEvento;
