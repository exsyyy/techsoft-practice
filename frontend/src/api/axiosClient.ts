import axios from 'axios'

// Если бэкенд запущен на другом порту (например, 8000), измени его здесь
const API_BASE_URL = 'http://localhost:8000'

export const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Автоматически добавляем токен в заголовки для защищенных запросов (POST/PUT/DELETE)
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})