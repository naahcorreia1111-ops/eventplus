export interface TipoEvento {
    idTipoEvento: string;
    titulo: string;
}


export interface TipoUsuario{
    idTipoUsuario: string;
    titulo: string;
}


export interface instituicao{
    idInstituicao: string;
    cnpj: string;
    nomeFantasia: string;
    endereco: string
}


export interface Usuario{
    idUsuario: string;
    nome: string;
    email: string;
    idTipoUsuario?: string;
    idTipoUsuarioNavigation?: TipoUsuario | null;
}


export interface Evento{
    idEvento: string;
    nome: string;
    descricao: string;
    dataEvento: string;
    imagemUrl?: string | null;
    idTipoEvento?: string | null;
    idTipoInstituicao?: string | null;
    idTipoEventoNavigation?: TipoEvento | null;
    idInstituicaoNavigation?: instituicao | null
}


export interface Presenca{
    idPresenca: string;
    situacao: boolean;
    idEvento: string;
    idUsuario?: string | null;
    idEventoNavigation?: Evento | null
}


export interface PresencaPayload{
    situacao: boolean;
    idEvento: string;
    idUsuario: string | null;
}