import { axiosClient } from './axiosClient' // Используем наш настроенный клиент axios с поддержкой токенов
import { API_URL } from './apiConfig' // Импортируем нашу динамическую константу адреса бэкенда

// 1. Описываем интерфейс данных, которые возвращает бэкенд
export interface GlossaryTerm {
    id: number
    term: string
    definition: string
}

export const glossaryService = {
    // Получение списка терминов с поддержкой поиска и пагинации
    getTerms: async (search?: string, skip: number = 0, limit: number = 50): Promise<GlossaryTerm[]> => {
        const params: any = { skip, limit }
        if (search) {
            params.search = search
        }

        // Запросы отправляются через axiosClient с использованием динамического API_URL из apiConfig
        const response = await axiosClient.get<GlossaryTerm[]>(`${API_URL}/api/glossary/`, { params })
        return response.data
    },

    // (Опционально) Создание нового термина
    createTerm: async (term: string, definition: string): Promise<GlossaryTerm> => {
        const response = await axiosClient.post<GlossaryTerm>(`${API_URL}/api/glossary/`, { term, definition })
        return response.data
    }
}