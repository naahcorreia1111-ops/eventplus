import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { type Instituicao as instituicao, type TipoEvento, type Evento } from "../../types/api";
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import { eventoService, instituicaoService, tipoEventoService } from "../../services/eventPlusservice";
import { getApiErrorMessage } from "../../services/api";
import Campo from "../../Components/campo/Campo";

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
            idInstituicao: instituicoes[0]?.idInstituicao || "",
        });
        setIdEmEdicao(null);
        setProgresso(0);
        if (fotoInputRef.current) fotoInputRef.current.value = "";
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
            if (idEmEdicao) await eventoService.atualizar(idEmEdicao, payload, setProgresso);
            else await eventoService.cadastrar(payload, setProgresso);

            const mensagemSucesso = idEmEdicao ? "Evento atualizado com sucesso." : "Evento cadastrado com sucesso.";
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
                <section>
                    <h1>Administração de Eventos</h1>
                    <p>Cadastre novos eventos ou selecione um item da lista para editar ou excluir</p>
                </section>
                <div>

                    <img src="" alt="" />
                    <form onSubmit={salvar}>
                        <h2>{idEmEdicao ? "Editar Evento" : "Cadastrar Evento"}</h2>
                        <div>

                            <label className="visually-hidden" htmlFor="evento-nome">
                                Nome
                            </label>
                            <Campo id="evento-nome" name="nome" value={formulario.nome} onChange={atualizar} placeholder="Nome" maxLength={100} required />
                            <label className="visually-hidden" htmlFor="evento-data">
                                Data e Horario
                            </label>
                            <Campo id="evento-data" name="dataEvento" type="datetime-local" value={formulario.dataEvento} onChange={atualizar} required />
                        </div>
                    </form>
                </div>
            </main >
            <Footer />
        </>
    );
}

export default CadastroEvento;