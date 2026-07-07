import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

export interface UserResponse {
    id: number
    username: string
    email: string
    role: string // Предполагаем, что сервер возвращает это поле
    created_at: string
}

export interface Token {
    access_token: string
    token_type: string
}

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

export const authService = {
    register: async (username: string, email: string, role = 'editor', password?: string): Promise<UserResponse> => {
        const response = await axios.post<UserResponse>(`${API_URL}/auth/register`, {
            username, email, role, password,
        })
        return response.data
    },

    login: async (username: string, password?: string): Promise<Token> => {
        const formData = new URLSearchParams()
        formData.append('username', username)
        if (password) formData.append('password', password)

        const response = await axios.post<Token>(`${API_URL}/auth/login`, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })

        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token)
            localStorage.setItem('username', username)

            // Получаем данные профиля, чтобы узнать роль сразу при логине
            try {
                const profile = await axios.get<UserResponse>(`${API_URL}/auth/me`)
                localStorage.setItem('role', profile.data.role)
            } catch (e) {
                console.error("Не удалось получить роль пользователя")
            }
        }
        return response.data
    },

    logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('role')
    },

    isAuthenticated: (): boolean => !!localStorage.getItem('token'),

    getCurrentUsername: (): string | null => localStorage.getItem('username'),

    // Добавляем метод получения роли
    getCurrentRole: (): string | null => localStorage.getItem('role')
}