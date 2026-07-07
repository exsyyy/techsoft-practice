    import { axiosClient } from './axiosClient'
    // Импортируем типы из каталога
    import type { CaseStudy, CountryResponse, TechnologyResponse } from '../data/catalog'

    export type CreateCaseStudyDto = Omit<
        CaseStudy,
        | 'id'
        | 'status'
        | 'created_at'
        | 'updated_at'
        | 'technologies'
        | 'verifier_id'
        | 'verification_date'
    >
    export const caseService = {
        // GET /api/cases/ — Получить список всех кейсов с фильтрами
        getAll: async (params?: Record<string, string | number | boolean | null>): Promise<CaseStudy[]> => {
            const response = await axiosClient.get<CaseStudy[]>('/api/cases/', { params })
            return response.data
        },

        // GET /api/cases/{case_id} — Получить конкретный кейс по ID
        getById: async (caseId: string | number): Promise<CaseStudy> => {
            const response = await axiosClient.get<CaseStudy>(`/api/cases/${caseId}`)
            return response.data
        },

        // POST /api/cases/admin/cases — Создать кейс
        // Опускаем поля, которые генерирует сам бэкенд при создании (id, даты, статус и вложенный массив технологий)
        create: async (
            caseData: CreateCaseStudyDto
        ): Promise<CaseStudy> => {
            const response = await axiosClient.post<CaseStudy>(
                '/api/cases/admin/cases',
                caseData
            )

            return response.data
        },

        // PUT /api/cases/admin/cases/{case_id} — Обновить кейс
        update: async (
            caseId: string | number,
            caseData: Partial<Omit<CaseStudy, 'id' | 'created_at' | 'updated_at' | 'technologies'>>
        ): Promise<CaseStudy> => {
            const response = await axiosClient.put<CaseStudy>(`/api/cases/admin/cases/${caseId}`, caseData)
            return response.data
        },

        // DELETE /api/cases/admin/cases/{case_id} — Удалить кейс
        delete: async (caseId: string | number): Promise<{ success: boolean }> => {
            const response = await axiosClient.delete(`/api/cases/admin/cases/${caseId}`)
            return response.data
        },

        // GET /api/countries/ — Получить список стран (теперь возвращает объекты CountryResponse)
        getCountries: async (): Promise<CountryResponse[]> => {
            const response = await axiosClient.get<CountryResponse[]>('/api/countries/')
            return response.data
        },

        // GET /api/technologies/ — Получить список технологий (теперь возвращает объекты TechnologyResponse)
        getTechnologies: async (): Promise<TechnologyResponse[]> => {
            const response = await axiosClient.get<TechnologyResponse[]>('/api/technologies/')
            return response.data
        }
    }