import type { Usuario } from "../../types/api";
import "./ListaUsuarios.css";
import lapis from "../../assets/lapis.svg";
import lixeira from "../../assets/lixeira.svg";

interface ListaUsuariosProps {
    usuarios: Usuario[];
    idEmEdicao: string | null;
    carregando?: boolean;
    onEditar: (usuario: Usuario) => void;
    onExcluir: (usuario: Usuario) => void;
}

function ListaUsuarios({
    usuarios,
    idEmEdicao,
    carregando,
    onEditar,
    onExcluir
}: ListaUsuariosProps) {
    return (
        <section className="usuarios-lista-section">
            <div className="usuarios-lista-container">
                <h2>USUÁRIOS CADASTRADOS</h2>
                <hr className="usuarios-linha-lista" />

                <div className="lista-usuarios-tabela-wrapper">
                    <table className="usuarios-tabela">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>E-mail</th>
                                <th>Tipo Usuário</th>
                                <th>Editar</th>
                                <th>Deletar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carregando ? (
                                <tr>
                                    <td colSpan={5} className="lista-usuarios-tabela-vazia">
                                        Carregando...
                                    </td>
                                </tr>
                            ) : null}

                            {!carregando && usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="lista-usuarios-tabela-vazia">
                                        Nenhum usuário cadastrado.
                                    </td>
                                </tr>
                            ) : null}

                            {!carregando &&
                                usuarios.map((usuario) => (
                                    <tr
                                        className={
                                            idEmEdicao === usuario.idUsuario
                                                ? "usuarios-linha-ativa"
                                                : ""
                                        }
                                        key={usuario.idUsuario}
                                    >
                                        <td>{usuario.nome}</td>
                                        <td>{usuario.email}</td>
                                        <td>
                                            {usuario.idTipoUsuarioNavigation?.titulo || "Não informado"}
                                        </td>
                                        <td>
                                            <button
                                                className="usuarios-acao"
                                                type="button"
                                                aria-label={`Editar ${usuario.nome}`}
                                                onClick={() => onEditar(usuario)}
                                            >
                                                <img src={lapis} alt="Ícone de editar" />
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="usuarios-acao"
                                                type="button"
                                                aria-label={`Excluir ${usuario.nome}`}
                                                onClick={() => onExcluir(usuario)}
                                            >
                                                <img src={lixeira} alt="Ícone de excluir" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

export default ListaUsuarios;
