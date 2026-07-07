import axios from 'axios';

// 1. Описываем интерфейс данных, которые возвращает бэкенд
export interface GlossaryTerm {
    id: number;
    term: string;
    definition: string;
}

const API_URL = 'http://localhost:8000/api/glossary';

export const glossaryService = {
    // Получение списка терминов с поддержкой поиска и пагинации
    getTerms: async (search?: string, skip: number = 0, limit: number = 50): Promise<GlossaryTerm[]> => {
        const params: any = { skip, limit };
        if (search) {
            params.search = search;
        }

        const response = await axios.get<GlossaryTerm[]>(`${API_URL}/`, { params });
        return response.data;
    },

    // (Опционально) Создание нового термина
    createTerm: async (term: string, definition: string): Promise<GlossaryTerm> => {
        const response = await axios.post<GlossaryTerm>(`${API_URL}/`, { term, definition });
        return response.data;
    }
};