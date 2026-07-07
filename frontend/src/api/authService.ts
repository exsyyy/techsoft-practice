import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

export interface UserResponse {
    id: number
    username: string
    email: string
    role: string
    created_at: string
}

export interface Token {
    access_token: string
    token_type: string
}

// Настройка перехватчика (interceptors) для автоматического добавления JWT в заголовки
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export const authService = {
    // Регистрация нового пользователя
    register: async (username: string, email: string, role = 'editor', password?: string): Promise<UserResponse> => {
        const response = await axios.post<UserResponse>(`${API_URL}/auth/register`, {
            username,
            email,
            role,
            password,
        })
        return response.data
    },

    // Вход в систему (передача данных в формате URL-encoded согласно OAuth2)
    login: async (username: string, password?: string): Promise<Token> => {
        const formData = new URLSearchParams()
        formData.append('username', username)
        if (password) {
            formData.append('password', password)
        }

        const response = await axios.post<Token>(`${API_URL}/auth/login`, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })

        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token)
            localStorage.setItem('username', username)
        }
        return response.data
    },

    // Выход из системы
    logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
    },

    // Проверка, авторизован ли пользователь локально
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token')
    },

    // Получить имя текущего пользователя
    getCurrentUsername: (): string | null => {
        return localStorage.getItem('username')
    }
}