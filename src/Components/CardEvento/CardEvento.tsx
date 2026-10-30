import "./CardEvento.css";
import { Link } from "react-router-dom";
import imagemPadrao from "../../assets/banner-3.png";

interface CardEventoProps {
    id: string;
    imagem?: string | null;
    categoria?: string;
    titulo: string;
    descricao: string;
    emEdicao?: boolean;
    onEditar?: () => void;
    onExcluir?: () => void;
}

function CardEvento({
    id,
    imagem,
    categoria,
    titulo,
    descricao,
    emEdicao,
    onEditar,
    onExcluir
}: CardEventoProps) {
    const adminstravel = Boolean(onEditar || onExcluir);

    return (
        <article className={`home-evento-card ${emEdicao ? "card-evento-em-edicao" : ""}`}>
            <img
                src={imagem || imagemPadrao}
                alt={`Imagem do evento ${titulo}`}
            />

            <span>{categoria || "Evento"}</span>

            <div className="home-evento-card-info">
                <h3>{titulo}</h3>
                <p>{descricao}</p>

                {adminstravel ? (
                    <div className="card-evento-admin-acoes">
                        <Link to={`/eventos/${id}`}>Ver</Link>
                        {emEdicao ? (
                            <p className="card-evento-aviso-edicao">
                                Este evento está sendo editado.
                            </p>
                        ) : null}
                        {onEditar && (
                            <button
                                type="button"
                                onClick={onEditar}
                                aria-label={`Editar ${titulo}`}
                            >
                                Editar
                            </button>
                        )}
                        {onExcluir && (
                            <button
                                type="button"
                                onClick={onExcluir}
                                aria-label={`Excluir ${titulo}`}
                            >
                                Excluir
                            </button>
                        )}
                    </div>
                ) : (
                    <Link to={`/eventos/${id}`}>
                        Ver evento
                    </Link>
                )}
            </div>
        </article>
    );
}

export default CardEvento;
