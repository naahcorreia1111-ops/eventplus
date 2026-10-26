
export interface TipoEvento {
    idTipoEvento: string;
    tituloTipoEvento: string;
    evento?: unknown[];
}

export interface TipoUsuario {
    idTipoUsuario: string;
    titulo: string;
}

export interface Instituicao {
    idInstituicao: string;
    cnpj: string;
    nomeFantasia: string;
    endereco: string;
}

// Alias para garantir compatibilidade caso algum arquivo use em minúsculo
export type instituicao = Instituicao;

export interface Usuario {
    idUsuario: string;
    nome: string;
    email: string;
    idTipoUsuario?: string;
    idTipoUsuarioNavigation?: TipoUsuario | null;
}

export interface Evento {
    idEvento: string;
    nome: string;
    descricao: string;
    dataEvento: string;
    imagemUrl?: string | null;
    idTipoEvento?: string | null;
    idTipoInstituicao?: string | null;
    idTipoEventoNavigation?: TipoEvento | null;
    idInstituicaoNavigation?: Instituicao | null;
}

export interface Comentario {

    idComentario: string;
    descricao: string;
    dataComentario: string;
    exibe: boolean;
    idEvento: string;
    idUsuario?: string | null;
    idUsuarioNavigation: Usuario | null;
}


export interface Presenca {
    idPresenca: string;
    situacao: boolean;
    idEvento: string;
    idUsuario?: string | null;
    idEventoNavigation?: Evento | null;
}

export interface ComentarioPayload {

    descricao: string;
    idEvento: string;
    idUsuario: string | null;

}

export interface PresencaPayload {

    situacao: boolean;
    idEvento: string;
    idUsuario: string | null;

}

export interface MensagemModeracao {

    mensagem: string;
    motivo?: string;

}


export interface LoginPayload {
    email: string;
    senha: string;
}

export interface LoginResponse {
    token: string;
    expiracao: string;
    usuario: Usuario;
}

export interface AuthSession extends LoginResponse {
    usuario: Usuario;
}

export interface UsuarioPayLoad {


    nome: string;
    email: string;
    senha: string;
    idTipoUsuario: string | null;

}

export interface PresencaPayload {
    situacao: boolean;
    idEvento: string;
    idUsuario: string | null;
}