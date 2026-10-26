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

import "./DetalhesEvento.css";

export function formatarData(value: string) {
    const data = new Date(value);

    return Number.isNaN(data.getTime())
        ? "Data não informada"
        : new Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
          }).format(data);
}

export function formatarHora(value: string) {
    const data = new Date(value);

    return Number.isNaN(data.getTime())
        ? "Horário não informado"
        : new Intl.DateTimeFormat("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
          }).format(data);
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
        
        // Se a API retornar um array, pega o primeiro item. Se retornar { dados: ... }, ajusta
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
        void carregar();
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

    return (
        <>
            <Header />

            <main>
                <img
                    src={evento?.imagemUrl || imagemPadrao}
                    alt="Banner do evento"
                />

              <h1>
    {carregando
        ? "Carregando evento..."
        : evento?.nome || 
          (evento as unknown as { titulo?: string })?.titulo || 
          (evento as unknown as { nomeEvento?: string })?.nomeEvento || 
          "Evento não encontrado"}
</h1>
                {erro && <p role="alert">{erro}</p>}

                <div>
                    <button
                        type="button"
                        onClick={() => setSecaoComentarios(false)}
                    >
                        Sobre o Evento
                    </button>

                    <button
                        type="button"
                        onClick={() => setSecaoComentarios(true)}
                    >
                        Comentários
                    </button>

                    {secaoComentarios ? (
                        <>
                            <h2>Comentários</h2>

                            <div className="detalhe-evento-comentarios">
                                <form onSubmit={comentar}>
                                    <label
                                        className="visually-hidden"
                                        htmlFor="novo-comentario"
                                    >
                                        Comentar
                                    </label>

                                    <Campo
                                        id="novo-comentario"
                                        value={novoComentario}
                                        maxLength={200}
                                        placeholder="Escreva seu comentário..."
                                        onChange={(event) =>
                                            setNovoComentario(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <button
                                        type="submit"
                                        aria-label="Enviar comentário"
                                        disabled={
                                            enviandoComentario ||
                                            !novoComentario.trim()
                                        }
                                    >
                                        <img src={enviar} alt="" />
                                    </button>
                                </form>

                                {mensagemComentario && (
                                    <p
                                        className="detalhe-evento-mensagem"
                                        role="status"
                                    >
                                        {mensagemComentario}
                                    </p>
                                )}

                                {comentarios.length > 0 ? (
                                    comentarios.map((comentario) => (
                                        <article
                                            key={comentario.idComentario}
                                        >
                                            <p>
                                                {comentario.idUsuarioNavigation
                                                    ?.nome || "Usuário"}
                                            </p>

                                            <p>{comentario.descricao}</p>
                                        </article>
                                    ))
                                ) : (
                                    <p>Nenhum comentário publicado.</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <section>
                            <h2>Sobre o Evento</h2>
                            <p>{evento?.descricao}</p>
                        </section>
                    )}
                </div>

                <div>
                    <h2>Informações principais</h2>
                    <hr />

                    <div>
                        <img src={relogio} alt="" />

                        <span>
                            {evento?.dataEvento
                                ? `${formatarData(evento.dataEvento)} às ${formatarHora(evento.dataEvento)}`
                                : "Data não informada"}
                        </span>
                    </div>

                    <div>
                        <img src={predio} alt="" />

                        <span>
                            {evento?.idInstituicaoNavigation?.nomeFantasia}
                        </span>
                    </div>

                    <div>
                        <img src={filtro} alt="" />

                        <span>
                            {evento?.idTipoEventoNavigation?.titulo}
                        </span>
                    </div>

                    <Botao
                        className={
                            presenca ? "detalhe-evento-cancelar" : ""
                        }
                        texto={
                            checandoPresenca
                                ? "Verificando inscrição..."
                                : enviandoInscricao
                                  ? "Aguarde..."
                                  : presenca
                                    ? "Cancelar inscrição"
                                    : "Se inscrever"
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
                            className="detalhe-evento-mensagem"
                            role="status"
                        >
                            {mensagemInscricao}
                        </p>
                    )}
                </div>
            </main>

            <ModalConfirmacao
                show={confirmandoCancelamento}
                titulo="Cancelar inscrição"
                mensagem={`Deseja cancelar sua inscrição em "${evento?.nome || "este evento"}"?`}
                textoConfirmar={
                    enviandoInscricao
                        ? "Cancelando..."
                        : "Cancelar inscrição"
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