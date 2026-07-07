import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../api/AuthContext'
import PageHeading from '../components/PageHeading'

export const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            await register(username, email, password)
            setSuccess(true)
            setTimeout(() => {
                navigate('/login')
            }, 2000)
        } catch (err: any) {
            console.error(err)
            setError(
                err.response?.data?.detail?.[0]?.msg ||
                err.response?.data?.detail ||
                'Ошибка при регистрации. Возможно, имя пользователя или email уже заняты.'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-md mx-auto space-y-6 py-8">
            <PageHeading
                eyebrow="РЕГИСТРАЦИЯ"
                title="Создать аккаунт"
                description="Получите доступ к редактору базы данных для наполнения и валидации кейсов."
            />

            <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                {error && (
                    <div className="mb-4 rounded-lg bg-bad/10 border border-bad/20 p-3 text-sm text-bad">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 rounded-lg bg-mint/20 border border-mint/40 p-3 text-sm text-accent-deep">
                        Регистрация успешна! Перенаправление на страницу входа...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                            Логин (Имя пользователя)
                        </label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="ivanov_ii"
                            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                            Электронная почта
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ivanov@example.com"
                            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                            Пароль
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || success}
                        className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-deep disabled:opacity-50"
                    >
                        {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className="mt-4 pt-4 border-t border-line text-center text-xs text-muted">
                    Уже зарегистрированы?{' '}
                    <Link to="/login" className="font-medium text-accent hover:underline">
                        Войти
                    </Link>
                </div>
            </div>
        </div>
    )
}
export default RegisterPage