import axios from 'axios'
import { API_URL } from './apiConfig' // Импортируем нашу динамическую константу

// Создаем экземпляр axios с динамическим базовым URL
export const axiosClient = axios.create({
    baseURL: API_URL, // Теперь подставляется http://localhost:8000 или домен Amvera
    headers: {
        'Content-Type': 'application/json',
    },
})

// Автоматически добавляем токен в заголовки для защищенных запросов (POST/PUT/DELETE)
axiosClient.interceptors.request.use(
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