import { useCallback, useEffect, useState, type FormEvent } from "react";

import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import Campo from "../../Components/campo/Campo";
import Botao from "../../Components/Botao/botao";
import ListaUsuarios from "../../Components/ListaUsuarios/ListaUsuarios";
import ModalConfirmacao from "../../Components/ModalConfirmacao/ModalConfirmacao";

import imagemUsuario from "../../assets/Usuario.png";

import { usuarioService, tipoUsuarioService } from "../../services/eventPlusservice";
import { getApiErrorMessage } from "../../services/api";
import type { Usuario, TipoUsuario } from "../../types/api";

import "./Usuarios.css";

function Usuarios() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [idTipoUsuario, setIdTipoUsuario] = useState("");

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [tiposUsuario, setTiposUsuario] = useState<TipoUsuario[]>([]);
    
    const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);
    const [selecionado, setSelecionado] = useState<Usuario | null>(null);

    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState("");

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        setMensagem("");

        try {
            const [listaUsuarios, listaTipos] = await Promise.all([
                usuarioService.listar(),
                tipoUsuarioService.listar(),
            ]);

            setUsuarios(listaUsuarios);
            setTiposUsuario(listaTipos);
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => void carregarDados(), 0);
        return () => window.clearTimeout(timeout);
    }, [carregarDados]);

    function limpar() {
        setNome("");
        setEmail("");
        setSenha("");
        setIdTipoUsuario("");
        setIdEmEdicao(null);
        setMensagem("");
    }

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!nome.trim() || !email.trim() || (!idEmEdicao && !senha.trim()) || !idTipoUsuario) {
            setMensagem("Preencha todos os campos obrigatórios.");
            return;
        }

        setEnviando(true);
        setMensagem("");

        try {
            const payload = {
                nome: nome.trim(),
                email: email.trim(),
                senha: senha.trim(),
                idTipoUsuario: idTipoUsuario,
            };

            if (idEmEdicao) {
                await usuarioService.atualizar(idEmEdicao, payload);
            } else {
                await usuarioService.cadastrar(payload);
            }

            limpar();
            await carregarDados();
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
        } finally {
            setEnviando(false);
        }
    }

    function editar(usuario: Usuario) {
        setIdEmEdicao(usuario.idUsuario);
        setNome(usuario.nome);
        setEmail(usuario.email);
        setSenha("");
        setIdTipoUsuario(usuario.idTipoUsuario || usuario.idTipoUsuarioNavigation?.idTipoUsuario || "");
        setMensagem("");

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function excluir() {
        if (!selecionado) return;

        setEnviando(true);
        setMensagem("");

        try {
            await usuarioService.excluir(selecionado.idUsuario);

            if (idEmEdicao === selecionado.idUsuario) {
                limpar();
            }

            setSelecionado(null);
            await carregarDados();
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

            <main className="usuarios-page">
                {/* Seção Superior - Cadastro */}
                <section className="usuarios-cadastro">
                    <h1 className="usuarios-titulo">
                        ADMINISTRAÇÃO DE USUÁRIOS
                    </h1>
                    <hr className="usuarios-linha-titulo" />

                    <div className="usuarios-conteudo">
                        <div className="usuarios-ilustracao">
                            <img src={imagemUsuario} alt="Ilustração Usuário" />
                        </div>

                        <form className="usuarios-formulario" onSubmit={salvar}>
                            <Campo
                                id="nome-usuario"
                                name="nome"
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Nome"
                                maxLength={100}
                                required
                            />

                            <Campo
                                id="email-usuario"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="E-mail"
                                maxLength={100}
                                required
                            />

                            <select
                                id="tipo-usuario"
                                className="usuarios-select"
                                value={idTipoUsuario}
                                onChange={(e) => setIdTipoUsuario(e.target.value)}
                                required
                            >
                                <option value="" disabled>
                                    Selecione o tipo de usuário
                                </option>
                                {tiposUsuario.map((tipo) => (
                                    <option key={tipo.idTipoUsuario} value={tipo.idTipoUsuario}>
                                        {tipo.titulo}
                                    </option>
                                ))}
                            </select>

                            <Campo
                                id="senha-usuario"
                                name="senha"
                                type="password"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                placeholder={idEmEdicao ? "Nova senha (opcional)" : "Senha"}
                                maxLength={50}
                                required={!idEmEdicao}
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
                                    className="usuarios-cancelar"
                                    type="button"
                                    onClick={limpar}
                                    disabled={enviando}
                                >
                                    Cancelar edição
                                </button>
                            )}

                            {mensagem && (
                                <p className="usuarios-mensagem" role="alert">
                                    {mensagem}
                                </p>
                            )}
                        </form>
                    </div>
                </section>

                {/* Seção Inferior - Lista de Usuários Reutilizável */}
                <ListaUsuarios
                    usuarios={usuarios}
                    idEmEdicao={idEmEdicao}
                    carregando={carregando}
                    onEditar={editar}
                    onExcluir={(usuario) => setSelecionado(usuario)}
                />

                <ModalConfirmacao
                    show={Boolean(selecionado)}
                    titulo="Excluir usuário"
                    mensagem={
                        selecionado
                            ? `Deseja excluir o usuário "${selecionado.nome}"?`
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
