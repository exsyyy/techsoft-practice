import axios from 'axios'
import { API_URL } from './apiConfig' // Импортируем нашу динамическую константу

export interface UserResponse {
    id: number
    username: string
    email: string
    role: string // Сервер возвращает это поле
    created_at: string
}

export interface Token {
    access_token: string
    token_type: string
}

// Автоматический перехватчик для прикрепления JWT токена во все запросы
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
        // Запросы идут через правильный путь /api/auth
        const response = await axios.post<UserResponse>(`${API_URL}/api/auth/register`, {
            username, email, role, password,
        })
        return response.data
    },

    login: async (username: string, password?: string): Promise<Token> => {
        const formData = new URLSearchParams()
        formData.append('username', username)
        if (password) formData.append('password', password)

        // Запросы идут через правильный путь /api/auth
        const response = await axios.post<Token>(`${API_URL}/api/auth/login`, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })

        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token)
            localStorage.setItem('username', username)

            // Безопасно получаем данные профиля, чтобы узнать роль сразу при логине
            try {
                const profile = await axios.get<UserResponse>(`${API_URL}/api/auth/me`)
                localStorage.setItem('role', profile.data.role)
            } catch (e) {
                console.error("Не удалось получить роль пользователя через")

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

    getCurrentRole: (): string | null => localStorage.getItem('role')
}