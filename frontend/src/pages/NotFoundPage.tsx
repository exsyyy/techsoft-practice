import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="py-24 text-center">
      <div className="font-mono text-xs font-medium tracking-[0.3em] text-bad">ОШИБКА</div>
      <h1 className="mt-3 font-display text-6xl font-semibold text-ink">404</h1>
      <p className="mt-3 text-sm text-muted">Страница не найдена.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-deep"
      >
        На главную
      </Link>
    </div>
  )
}

export default NotFoundPage
