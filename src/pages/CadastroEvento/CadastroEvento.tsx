import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import Campo from "../../Components/campo/Campo";
import Botao from "../../Components/Botao/botao";
import CardEvento from "../../Components/CardEvento/CardEvento";
import ModalConfirmacao from "../../Components/ModalConfirmacao/ModalConfirmacao";
import ilustracaoEvento from "../../assets/evento-ilustracao.png";
import relogio from "../../assets/relogio.svg";

import type { Evento, Instituicao as instituicao, TipoEvento } from "../../types/api";
import { eventoService, instituicaoService, tipoEventoService } from "../../services/eventPlusservice";
import { getApiErrorMessage } from "../../services/api";

import "./CadastroEvento.css";

interface FormularioEvento {
    nome: string;
    dataEvento: string;
    descricao: string;
    idTipoEvento: string;
    idInstituicao: string;
    arquivoImagem: File | null;
}

const inicial: FormularioEvento = {
    nome: "",
    dataEvento: "",
    descricao: "",
    idTipoEvento: "",
    idInstituicao: "",
    arquivoImagem: null
};

function paraDataLocal(value: string) {
    const data = new Date(value);
    if (Number.isNaN(data.getTime())) return value.slice(0, 16);
    const local = new Date(data.getTime() - data.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
}

function CadastroEvento() {
    const fotoInputRef = useRef<HTMLInputElement>(null);
    const [formulario, setFormulario] = useState(inicial);
    const [tipos, setTipos] = useState<TipoEvento[]>([]);
    const [instituicoes, setInstituicoes] = useState<instituicao[]>([]);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);
    const [selecionado, setSelecionado] = useState<Evento | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [progresso, setProgresso] = useState(0);
    const [mensagem, setMensagem] = useState("");

    const carregar = useCallback(async () => {
        setCarregando(true);
        setMensagem("");
        try {
            const [tiposApi, instituicoesApi, eventosApi] = await Promise.all([
                tipoEventoService.listar(),
                instituicaoService.listar(),
                eventoService.listar()
            ]);

            setTipos(tiposApi);
            setInstituicoes(instituicoesApi);
            setEventos(eventosApi);

            setFormulario((value) => ({
                ...value,
                idTipoEvento: value.idTipoEvento || tiposApi[0]?.idTipoEvento || "",
                idInstituicao: value.idInstituicao || instituicoesApi[0]?.idInstituicao || ""
            }));
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

    function atualizar(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setFormulario((value) => ({ ...value, [event.target.name]: event.target.value }));
    }

    function limparFormulario() {
        setFormulario({
            ...inicial,
            idTipoEvento: tipos[0]?.idTipoEvento || "",
            idInstituicao: instituicoes[0]?.idInstituicao || ""
        });
        setIdEmEdicao(null);
        setProgresso(0);
        if (fotoInputRef.current) fotoInputRef.current.value = "";
    }

    function editar(evento: Evento) {
        setIdEmEdicao(evento.idEvento);
        setFormulario({
            nome: evento.nome,
            dataEvento: paraDataLocal(evento.dataEvento),
            descricao: evento.descricao,
            idTipoEvento: evento.idTipoEvento || evento.idTipoEventoNavigation?.idTipoEvento || "",
            idInstituicao: evento.idInstituicao || evento.idTipoInstituicao || evento.idInstituicaoNavigation?.idInstituicao || "",
            arquivoImagem: null
        });
        if (fotoInputRef.current) fotoInputRef.current.value = "";
        setMensagem(`Editando "${evento.nome}".`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setEnviando(true);
        setMensagem("");
        setProgresso(0);

        try {
            const eventoAtual = eventos.find((item) => item.idEvento === idEmEdicao);
            const payload = {
                nome: formulario.nome.trim(),
                descricao: formulario.descricao.trim(),
                dataEvento: new Date(formulario.dataEvento).toISOString(),
                idTipoEvento: formulario.idTipoEvento,
                idInstituicao: formulario.idInstituicao,
                arquivoImagem: formulario.arquivoImagem,
                imagemUrl: formulario.arquivoImagem ? null : eventoAtual?.imagemUrl
            };

            if (idEmEdicao) {
                await eventoService.atualizar(idEmEdicao, payload, setProgresso);
            } else {
                await eventoService.cadastrar(payload, setProgresso);
            }

            const mensagemSucesso = idEmEdicao
                ? "Evento atualizado com sucesso."
                : "Evento cadastrado com sucesso.";

            limparFormulario();
            setEventos(await eventoService.listar());
            setMensagem(mensagemSucesso);
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
        } finally {
            setEnviando(false);
            setProgresso(0);
        }
    }

    async function excluir() {
        if (!selecionado) return;
        setEnviando(true);
        setMensagem("");

        try {
            await eventoService.excluir(selecionado.idEvento);
            if (idEmEdicao === selecionado.idEvento) limparFormulario();
            setEventos(await eventoService.listar());
            setMensagem("Evento excluído com sucesso.");
            setSelecionado(null);
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

            <main className="cadastro-evento-page">
                {/* Seção Cadastro / Edição */}
                <section className="cadastro-evento-cabecalho">
                    <h1 className="cadastro-evento-titulo">ADMINISTRAÇÃO EVENTO</h1>
                    <hr className="cadastro-evento-linha-titulo" />

                    <div className="cadastro-evento-conteudo">
                        <div className="cadastro-evento-ilustracao">
                            <img src={ilustracaoEvento} alt="Ilustração da administração de eventos" />
                        </div>

                        <form className="cadastro-evento-formulario" onSubmit={salvar}>
                            {/* Linha 1: Nome + Data */}
                            <div className="cadastro-evento-linha-dupla">
                                <label className="visually-hidden" htmlFor="evento-nome">
                                    Nome
                                </label>
                                <Campo
                                    id="evento-nome"
                                    name="nome"
                                    value={formulario.nome}
                                    onChange={atualizar}
                                    placeholder="Nome"
                                    maxLength={100}
                                    required
                                />

                                <div className="cadastro-evento-data-wrapper">
                                    <label className="visually-hidden" htmlFor="evento-data">
                                        Data e Horário
                                    </label>
                                    <img src={relogio} alt="" className="cadastro-evento-relogio-icon" />
                                    <Campo
                                        id="evento-data"
                                        name="dataEvento"
                                        type="datetime-local"
                                        value={formulario.dataEvento}
                                        onChange={atualizar}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Linha 2: Descrição */}
                            <label className="visually-hidden" htmlFor="evento-descricao">
                                Descrição
                            </label>
                            <Campo
                                id="evento-descricao"
                                name="descricao"
                                value={formulario.descricao}
                                onChange={atualizar}
                                placeholder="Descrição"
                                required
                            />

                            {/* Linha 3: Tipo de Evento + Instituição */}
                            <div className="cadastro-evento-linha-dupla">
                                <label className="visually-hidden" htmlFor="evento-tipo">
                                    Tipo de Evento
                                </label>
                                <select
                                    id="evento-tipo"
                                    name="idTipoEvento"
                                    className="cadastro-evento-select"
                                    value={formulario.idTipoEvento}
                                    onChange={atualizar}
                                    required
                                >
                                    <option value="" disabled>Tipo de Evento</option>
                                    {tipos.map((tipo) => (
                                        <option value={tipo.idTipoEvento} key={tipo.idTipoEvento}>
                                            {tipo.titulo || tipo.tituloTipoEvento}
                                        </option>
                                    ))}
                                </select>

                                <label className="visually-hidden" htmlFor="evento-instituicao">
                                    Instituição
                                </label>
                                <select
                                    id="evento-instituicao"
                                    name="idInstituicao"
                                    className="cadastro-evento-select"
                                    value={formulario.idInstituicao}
                                    onChange={atualizar}
                                    required
                                >
                                    <option value="" disabled>Instituição</option>
                                    {instituicoes.map((inst) => (
                                        <option value={inst.idInstituicao} key={inst.idInstituicao}>
                                            {inst.nomeFantasia}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Linha 4: Upload da Foto */}
                            <label htmlFor="foto-evento" className="cadastro-evento-upload-linha">
                                <span className="cadastro-evento-upload-texto">
                                    {formulario.arquivoImagem?.name ||
                                        (idEmEdicao ? "Manter imagem atual ou escolher nova" : "Foto")}
                                </span>
                                <svg
                                    className="cadastro-evento-upload-icon"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </label>
                            <input
                                ref={fotoInputRef}
                                id="foto-evento"
                                className="visually-hidden"
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    setFormulario((value) => ({
                                        ...value,
                                        arquivoImagem: event.target.files?.[0] || null
                                    }))
                                }
                            />

                            {/* Barra de progresso do envio da imagem */}
                            {enviando && progresso > 0 && (
                                <div className="cadastro-evento-progresso-container">
                                    <div
                                        className="cadastro-evento-progresso-barra"
                                        style={{ width: `${progresso}%` }}
                                        role="progressbar"
                                        aria-valuenow={progresso}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    />
                                    <span className="cadastro-evento-progresso-texto">
                                        Enviando: {progresso}%
                                    </span>
                                </div>
                            )}

                            {/* Linha 5: Botão Cadastrar / Atualizar */}
                            <Botao
                                texto={
                                    enviando
                                        ? progresso > 0
                                            ? `Enviando ${progresso}%`
                                            : "Salvando..."
                                        : idEmEdicao
                                          ? "Salvar alterações"
                                          : "Cadastrar"
                                }
                                type="submit"
                                disabled={enviando || carregando}
                                className="cadastro-evento-btn-cadastrar"
                            />

                            {idEmEdicao && (
                                <button
                                    className="cadastro-evento-cancelar"
                                    type="button"
                                    onClick={() => {
                                        limparFormulario();
                                        setMensagem("");
                                    }}
                                >
                                    Cancelar Edição
                                </button>
                            )}

                            {mensagem && (
                                <p className="cadastro-evento-mensagem" role="status">
                                    {mensagem}
                                </p>
                            )}
                        </form>
                    </div>
                </section>

                {/* Seção Listagem de Eventos - Fundo Branco e Título Centralizado com linha vermelha */}
                <section className="cadastro-evento-lista-section">
                    <div className="cadastro-evento-lista-container">
                        <h2>EVENTOS</h2>
                        <hr className="cadastro-evento-linha-titulo" />

                        {carregando && (
                            <p className="cadastro-evento-status">Carregando eventos...</p>
                        )}

                        {!carregando && eventos.length === 0 && (
                            <p className="cadastro-evento-status">Nenhum evento cadastrado no momento.</p>
                        )}

                        <div className="cadastro-evento-cards-grid">
                            {eventos.map((evento) => (
                                <CardEvento
                                    key={evento.idEvento}
                                    id={evento.idEvento}
                                    imagem={evento.imagemUrl}
                                    categoria={
                                        evento.idTipoEventoNavigation?.titulo ||
                                        evento.idTipoEventoNavigation?.tituloTipoEvento ||
                                        "Categoria"
                                    }
                                    titulo={evento.nome}
                                    descricao={evento.descricao}
                                    emEdicao={idEmEdicao === evento.idEvento}
                                    onEditar={() => editar(evento)}
                                    onExcluir={() => setSelecionado(evento)}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Modal de Confirmação de Exclusão */}
                <ModalConfirmacao
                    show={Boolean(selecionado)}
                    titulo="Excluir evento"
                    mensagem={
                        selecionado
                            ? `Deseja realmente excluir "${selecionado.nome}"? As inscrições e comentários vinculados também serão removidos.`
                            : ""
                    }
                    textoConfirmar={enviando ? "Excluindo..." : "Excluir evento"}
                    textoCancelar="Cancelar"
                    onClose={() => setSelecionado(null)}
                    onConfirm={() => void excluir()}
                />
            </main>

            <Footer />
        </>
    );
}

export default CadastroEvento;
