
import "./Usuarios.css";
import Footer from "../../Components/Footer/Footer";
import Header from "../../Components/Header/Header";
import Campo from "../../Components/campo/Campo";
import Botao from "../../Components/Botao/botao";
import ListaUsuarios from "../../Components/ListaUsuarios/ListaUsuarios";
import ModalConfirmacao from "../../Components/ModalConfirmacao/ModalConfirmacao";
import type { TipoUsuario, Usuario } from "../../types/api";
import {
    useCallback,
    useEffect,
    useState,
    type ChangeEvent,
    type FormEvent
} from "react";
import {
    tipoUsuarioService,
    usuarioService
} from "../../services/eventPlusservice";
import { getApiErrorMessage } from "../../services/api";

interface FormularioUsuario {
    nome: string;
    email: string;
    senha: string;
    idTipoUsuario: string;
}

const inicial: FormularioUsuario = {
    nome: "",
    email: "",
    idTipoUsuario: "",
    senha: ""
};

function Usuarios() {
    const [formulario, setFormulario] = useState(inicial);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [tipos, setTipos] = useState<TipoUsuario[]>([]);
    const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);
    const [selecionado, setSelecionado] = useState<Usuario | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState("");

    const carregar = useCallback(async () => {
        setCarregando(true);
        setMensagem("");

        try {
            const [usuariosApi, tiposApi] = await Promise.all([
                usuarioService.listar(),
                tipoUsuarioService.listar()
            ]);

            setUsuarios(usuariosApi);
            setTipos(tiposApi);

            setFormulario((value) => ({
                ...value,
                idTipoUsuario:
                    value.idTipoUsuario || tiposApi[0]?.idTipoUsuario || ""
            }));
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        const timeOut = window.setTimeout(() => void carregar(), 0);

        return () => window.clearTimeout(timeOut);
    }, [carregar]);

    function atualizar(
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        setFormulario((value) => ({
            ...value,
            [event.target.name]: event.target.value
        }));
    }

    function limpar() {
        setFormulario({
            ...inicial,
            idTipoUsuario: tipos[0]?.idTipoUsuario || ""
        });

        setIdEmEdicao(null);
        setMensagem("");
    }

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setEnviando(true);
        setMensagem("");

        try {
            const payload = {
                ...formulario,
                nome: formulario.nome.trim(),
                email: formulario.email.trim(),
                idTipoUsuario: formulario.idTipoUsuario || null
            };

            if (idEmEdicao) {
                await usuarioService.atualizar(idEmEdicao, payload);
            } else {
                await usuarioService.cadastrar(payload);
            }

            limpar();
            await carregar();
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
        } finally {
            setEnviando(false);
        }
    }

    function editar(usuario: Usuario) {
        setIdEmEdicao(usuario.idUsuario);

        setFormulario({
            nome: usuario.nome,
            email: usuario.email,
            idTipoUsuario: usuario.idTipoUsuario || "",
            senha: ""
        });

        setMensagem("Informe uma nova senha para concluir a edição.");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    async function excluir() {
        if (!selecionado) return;

        setEnviando(true);

        try {
            await usuarioService.excluir(selecionado.idUsuario);

            if (idEmEdicao === selecionado.idUsuario) {
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

            <main className="cadastro-usuario-page">
                <section className="cadastro-usuario-formulario-section">
                    <h1 className="section-title">
                        Administração de usuários
                    </h1>

                    <div className="cadastro-usuario-conteudo">
                        <img
                            src=""
                            alt="Ilustração da administração de usuários"
                        />

                        <form
                            className="cadasto-usuario-formulario"
                            onSubmit={salvar}
                        >
                            <h2>
                                {idEmEdicao
                                    ? "Editar Usuário"
                                    : "Cadastrar usuário"}
                            </h2>

                            <label
                                className="visually-hidden"
                                htmlFor="usuario-nome"
                            >
                                Nome
                            </label>

                            <Campo
                                id="usuario-nome"
                                name="nome"
                                type="text"
                                value={formulario.nome}
                                onChange={atualizar}
                                placeholder="Nome"
                                maxLength={100}
                                required
                            />

                            <label
                                className="visually-hidden"
                                htmlFor="usuario-email"
                            >
                                E-mail
                            </label>

                            <Campo
                                id="usuario-email"
                                name="email"
                                type="email"
                                value={formulario.email}
                                onChange={atualizar}
                                placeholder="Email"
                                maxLength={100}
                                required
                            />

                            <div className="cadastro-usuario-grid">
                                <div>
                                    <label
                                        className="visually-hidden"
                                        htmlFor="usuario-tipo"
                                    >
                                        Tipo de usuário
                                    </label>

                                    <select
                                        name="idTipoUsuario"
                                        id="usuario-tipo"
                                        value={formulario.idTipoUsuario}
                                        onChange={atualizar}
                                        required
                                    >
                                        {tipos.map((tipo) => (
                                            <option
                                                value={tipo.idTipoUsuario}
                                                key={tipo.idTipoUsuario}
                                            >
                                                {tipo.titulo}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        className="visually-hidden"
                                        htmlFor="usuario-senha"
                                    >
                                        Senha
                                    </label>

                                    <Campo
                                        id="usuario-senha"
                                        name="senha"
                                        type="password"
                                        value={formulario.senha}
                                        onChange={atualizar}
                                        placeholder={
                                            idEmEdicao
                                                ? "Nova Senha"
                                                : "Senha"
                                        }
                                        minLength={8}
                                        maxLength={60}
                                        required={!idEmEdicao}
                                    />
                                </div>

                                <Botao
                                    texto={
                                        enviando
                                            ? "Salvando..."
                                            : idEmEdicao
                                                ? "Salvar"
                                                : "Cadastrar"
                                    }
                                    type="submit"
                                    disabled={enviando}
                                />

                                {idEmEdicao ? (
                                    <button
                                        className="cadastro-usuario-cancelar"
                                        type="button"
                                        onClick={limpar}
                                    >
                                        Cancelar Edição
                                    </button>
                                ) : null}

                                {mensagem ? (
                                    <p
                                        className="cadastro-usuario-mensagem"
                                        role="alert"
                                    >
                                        {mensagem}
                                    </p>
                                ) : null}
                            </div>
                        </form>
                    </div>
                </section>

                <ListaUsuarios
                    usuarios={usuarios}
                    idEmEdicao={idEmEdicao}
                    carregando={carregando}
                    onEditar={editar}
                    onExcluir={setSelecionado}
                />

                <ModalConfirmacao
                    show={Boolean(selecionado)}
                    titulo="Excluir usuário"
                    mensagem={
                        selecionado
                            ? `Deseja excluir "${selecionado.nome}"?`
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

export default Usuarios;
