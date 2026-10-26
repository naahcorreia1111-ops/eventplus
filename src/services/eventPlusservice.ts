import { axiosInstance } from "./api";


import type { Evento, Presenca, PresencaPayload } from "../types/api";


export const eventoService = {
    async listar() {
        const { data } = await axiosInstance.get<Evento[]>("Evento")
        return data;
    },


    async listarProximos() {
        const { data } = await axiosInstance.get<Evento[]>("Evento/proximos");
        return data;
    },


    async buscar(id: string) {
        const { data } = await axiosInstance.get<Evento>(Evento/${id});
        return data;
    }
}


export const presencaService = {
    async listaPorUsuario(idUsuario: string) {
        const { data } = await axiosInstance.get<Presenca[]>(Presenca/usuario/${idUsuario});
        return data;
    },


    async cadastrar (payload: PresencaPayload) {
        const { data } = await axiosInstance.post<Presenca>("/Presenca", payload);
        return data;
    },


    async excluir(id: string){
        await axiosInstance.delete(Presenca/${id});
    }


}