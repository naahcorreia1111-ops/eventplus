import { axiosInstance } from "./api";

import type {
    Comentario,
    ComentarioPayload,
    Evento,
    Instituicao,
    LoginPayload,
    LoginResponse,
    MensagemModeracao,
    Presenca,
    PresencaPayload,
    TipoEvento,
    TipoUsuario,
    Usuario,
    UsuarioPayLoad
} from "../types/api";

export interface EventoPayload {
    nome: string;
    descricao: string;
    dataEvento: string;
    idTipoEvento: string;
    idInstituicao: string;
    arquivoImagem?: File | null;
    imagemUrl?: string | null;
}

function eventoFormData(payload: EventoPayload) {
    const formData = new FormData();
    formData.append("Nome", payload.nome);
    formData.append("Descricao", payload.descricao);
    formData.append("DataEvento", payload.dataEvento);
    formData.append("IdTipoEvento", payload.idTipoEvento || "");
    formData.append("IdInstituicao", payload.idInstituicao || "");

    if (payload.arquivoImagem) {
        formData.append("ArquivoImagem", payload.arquivoImagem);
    }
    if (payload.imagemUrl) {
        formData.append("ImagemUrl", payload.imagemUrl);
    }

    return formData;
}

function progressoUpload(onProgress?: (porcentagem: number) => void) {
    return {
        onUploadProgress: (progress: { loaded: number; total?: number }) => {
            if (progress.total && onProgress) {
                onProgress(Math.round((progress.loaded * 100) / progress.total));
            }
        }
    };
}

export const authService = {
    async login(payload: LoginPayload) {
        const { data } = await axiosInstance.post<LoginResponse>(
            "Login",
            payload
        );

        return data;
    }
};

export const instituicaoService = {
    async listar() {
        const { data } = await axiosInstance.get<Instituicao[]>("Instituicao");
        return data;
    }
};

export const eventoService = {
    async listar() {
        const { data } = await axiosInstance.get<Evento[]>("Evento");
        return data;
    },

    async listarProximos() {
        try {
            const { data } = await axiosInstance.get<Evento[]>("Evento/ListarProximos");
            return data;
        } catch {
            const { data } = await axiosInstance.get<Evento[]>("Evento");
            return data;
        }
    },

    async buscar(id: string) {
        const { data } = await axiosInstance.get<Evento>(`Evento/${id}`);
        return data;
    },

    async cadastrar(payload: EventoPayload, onProgress?: (percentage: number) => void) {
        const { data } = await axiosInstance.post<Evento>(
            "Evento",
            eventoFormData(payload),
            progressoUpload(onProgress)
        );
        return data;
    },

    async atualizar(id: string, payload: EventoPayload, onProgress?: (percentage: number) => void) {
        await axiosInstance.put(
            `Evento/${id}`,
            eventoFormData(payload),
            progressoUpload(onProgress)
        );
    },

    async excluir(id: string) {
        await axiosInstance.delete(`Evento/${id}`);
    }
};

export const comentarioService = {
    async listarPorEvento(idEvento: string) {
        const { data } = await axiosInstance.get<Comentario[]>(
            `Comentario/ListarPorEvento/${idEvento}`
        );

        return data;
    },

    async cadastrar(payload: ComentarioPayload) {
        const { data } = await axiosInstance.post<
            Comentario | MensagemModeracao
        >("Comentario", payload);

        return data;
    }
};

export const presencaService = {
    async listarPorUsuario(idUsuario: string) {
        const { data } = await axiosInstance.get<Presenca[]>(
            `Presenca/Minhas/${idUsuario}`
        );

        return data;
    },

    async cadastrar(payload: PresencaPayload) {
        const { data } = await axiosInstance.post<Presenca>(
            "Presenca",
            payload
        );

        return data;
    },

    async excluir(id: string) {
        await axiosInstance.delete(`Presenca/${id}`);
    }
};

export const usuarioService = {
    async listar() {
        const { data } = await axiosInstance.get<Usuario[]>("Usuario");
        return data;
    },

    async buscar(id: string) {
        const { data } = await axiosInstance.get<Usuario>(
            `Usuario/${id}`
        );

        return data;
    },

    async cadastrar(payload: UsuarioPayLoad) {
        const { data } = await axiosInstance.post<Usuario>(
            "Usuario",
            payload
        );

        return data;
    },

    async atualizar(id: string, payload: UsuarioPayLoad) {
        await axiosInstance.put(`Usuario/${id}`, payload);
    },

    async excluir(id: string) {
        await axiosInstance.delete(`Usuario/${id}`);
    }
};

export const tipoEventoService = {
    async listar() {
        const { data } = await axiosInstance.get<TipoEvento[]>("TipoEvento");
        return data;
    },

    async cadastrar(payload: { tituloTipoEvento: string }) {
        const { data } = await axiosInstance.post<TipoEvento>(
            "TipoEvento",
            payload
        );

        return data;
    },

    async atualizar(
        id: string,
        payload: { tituloTipoEvento: string }
    ) {
        await axiosInstance.put(`TipoEvento/${id}`, payload);
    },

    async excluir(id: string) {
        await axiosInstance.delete(`TipoEvento/${id}`);
    }
};

export const tipoUsuarioService = {
    async listar() {
        const { data } = await axiosInstance.get<TipoUsuario[]>(
            "TipoUsuario"
        );

        return data;
    },

    async cadastrar(payload: { titulo: string }) {
        const { data } = await axiosInstance.post<TipoUsuario>(
            "TipoUsuario",
            payload
        );

        return data;
    },

    async atualizar(id: string, payload: { titulo: string }) {
        await axiosInstance.put(`TipoUsuario/${id}`, payload);
    },

    async excluir(id: string) {
        await axiosInstance.delete(`TipoUsuario/${id}`);
    }
};