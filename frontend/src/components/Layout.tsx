import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../api/AuthContext'

const navItems = [
  { to: '/cases', label: 'Кейсы' },
  { to: '/technologies', label: 'Технологии' },
  { to: '/countries', label: 'Страны' },
  { to: '/glossary', label: 'Глоссарий' },
]

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
      <div className="flex min-h-screen flex-col">
        <header className="intro-header sticky top-0 z-10 border-b border-line/70 bg-paper/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
            <NavLink to="/" end className="group flex flex-col leading-none" aria-label="На главную">
            <span className="font-display text-2xl font-bold tracking-tight text-accent transition group-hover:text-accent-deep">
              DOC
            </span>
              <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              digital optimization cases
            </span>
            </NavLink>

            <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-ink md:hidden"
                aria-label="Открыть меню"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((value) => !value)}
            >
            <span className="flex w-5 flex-col gap-1">
              <span className="h-0.5 rounded-full bg-ink" />
              <span className="h-0.5 rounded-full bg-ink" />
              <span className="h-0.5 rounded-full bg-ink" />
            </span>
            </button>

            {/* Десктопное меню навигации */}
            <nav className="hidden items-center gap-1.5 text-sm md:flex">
              {navItems.map((item) => (
                  <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                          `rounded-lg px-3 py-1.5 font-medium transition ${
                              isActive ? 'text-accent-deep' : 'text-muted hover:text-ink'
                          }`
                      }
                  >
                    {item.label}
                  </NavLink>
              ))}

              <div className="ml-4 flex items-center gap-3 border-l border-line/70 pl-4">
                {isAuthenticated ? (
                    <>
                      <NavLink
                          to="/admin"
                          className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-muted transition hover:border-accent hover:text-accent-deep"
                      >
                        Админка
                      </NavLink>
                      <button
                          type="button"
                          onClick={handleLogout}
                          className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-bad transition hover:border-bad/40 hover:bg-bad/5"
                      >
                        Выйти
                      </button>
                    </>
                ) : (
                    <NavLink
                        to="/login"
                        className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-muted transition hover:border-accent hover:text-accent-deep"
                    >
                      Войти
                    </NavLink>
                )}
              </div>
            </nav>
          </div>

          {/* Мобильное меню навигации */}
          {isMenuOpen && (
              <nav className="border-t border-line bg-paper px-6 py-4 md:hidden">
                <div className="mx-auto grid max-w-6xl gap-2 text-sm">
                  {navItems.map((item) => (
                      <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                              `rounded-lg px-3 py-2 font-medium transition ${
                                  isActive ? 'bg-mint text-accent-deep' : 'text-muted hover:bg-surface hover:text-ink'
                              }`
                          }
                      >
                        {item.label}
                      </NavLink>
                  ))}

                  <div className="mt-4 flex flex-col gap-3 border-t border-line/70 pt-4">
                    {isAuthenticated ? (
                        <>
                          <NavLink
                              to="/admin"
                              className="w-full rounded-lg border border-line py-2 text-center text-sm font-medium text-muted transition hover:border-accent hover:text-accent-deep"
                          >
                            Админка
                          </NavLink>
                          <button
                              type="button"
                              onClick={handleLogout}
                              className="w-full rounded-lg border border-line py-2 text-center text-sm font-medium text-bad transition hover:bg-bad/5"
                          >
                            Выйти
                          </button>
                        </>
                    ) : (
                        <NavLink
                            to="/login"
                            className="w-full rounded-lg border border-line py-2 text-center font-medium text-muted transition hover:border-accent hover:text-accent-deep"
                        >
                          Войти
                        </NavLink>
                    )}
                  </div>
                </div>
              </nav>
          )}
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>

        <footer className="intro-footer border-t border-line/70 bg-paper/70 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-muted">
            база кейсов цифровой оптимизации
          </div>
        </footer>
      </div>
  )
}

export default Layout