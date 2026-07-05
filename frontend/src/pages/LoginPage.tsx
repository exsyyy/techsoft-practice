import { Link } from 'react-router-dom'

function LoginPage() {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-line bg-surface p-6">
      <div className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted">доступ к редактору</div>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Вход</h1>
      <p className="mt-2 text-sm text-muted">
        Публичные кейсы доступны без авторизации. Вход нужен редакторам и администраторам для управления карточками и публикацией.
      </p>
      <form className="mt-6 space-y-4">
        <label className="block text-xs font-medium text-muted">
          Email
          <input type="email" className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink" placeholder="editor@example.com" />
        </label>
        <label className="block text-xs font-medium text-muted">
          Пароль
          <input type="password" className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink" placeholder="••••••••" />
        </label>
        <div className="rounded-lg border border-line bg-paper p-3 text-xs text-muted">
          Роли: публичный пользователь смотрит опубликованные кейсы, редактор создает и редактирует, администратор управляет публикацией и пользователями.
        </div>
        <Link to="/admin" className="block rounded-lg bg-accent px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-accent-deep">
          Войти в админ-панель
        </Link>
      </form>
    </div>
  )
}

export default LoginPage
