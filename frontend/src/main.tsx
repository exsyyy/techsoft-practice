import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- Добавили импорт роутера
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
import { AuthProvider } from './api/AuthContext'

// Создаем клиент для кэширования запросов
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>{/* <-- Обернули здесь */}
                    <App />
                </AuthProvider>
            </BrowserRouter> {/* <-- И закрыли здесь */}
        </QueryClientProvider>
    </React.StrictMode>
)