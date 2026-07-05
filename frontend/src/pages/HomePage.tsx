import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SourceBadge from '../components/SourceBadge'
import MetricChip from '../components/MetricChip'
import CountUp from '../components/CountUp'
import ScrollReveal from '../components/ScrollReveal'
import {
  allBusinessProblems,
  allCountries,
  allTechnologies,
  countBy,
  matchesQuery,
  publishedCases,
  sortCases,
} from '../data/catalog'

const levelExplainers = [
  { level: 'A' as const, text: 'первичный источник или отчет с проверяемой методикой' },
  { level: 'B' as const, text: 'надежный вторичный источник или отраслевое исследование' },
  { level: 'C' as const, text: 'vendor case study, нужен независимый контроль' },
  { level: 'D' as const, text: 'недостаточно данных для подтвержденного вывода' },
]

function HomePage() {
  const [query, setQuery] = useState('')
  const latestCases = sortCases(publishedCases, 'published-desc').slice(0, 4)
  const searchResults = useMemo(
    () => (query.trim() ? publishedCases.filter((item) => matchesQuery(item, query)).slice(0, 5) : []),
    [query],
  )
  const popularDirections = countBy(publishedCases, (item) => item.technologies).slice(0, 6)
  const quantitativeCount = publishedCases.filter((item) => item.effect.hasQuantitative).length
  const stats = [
    { value: `${publishedCases.length}`, label: 'опубликованных кейсов' },
    { value: `${allCountries.length}`, label: 'стран' },
    { value: `${allTechnologies.length}`, label: 'технологий' },
  ]

  return (
    <div className="space-y-12">
      <ScrollReveal as="section" className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent signal-live" />
            проверяемые практики внедрения
          </div>
          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            База кейсов цифровой оптимизации заводов и складов
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted">
            Структурированные примеры внедрения IT-решений на производстве и в логистике с измеримым эффектом, статусом проверки и уровнем достоверности источника.
          </p>

          <div className="mt-6 max-w-xl rounded-xl border border-line bg-surface p-4">
            <label className="text-xs font-medium text-muted">
              Полнотекстовый поиск
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Например: WMS, простои, качество, Германия"
                className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </label>
            {searchResults.length > 0 && (
              <div className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line bg-paper">
                {searchResults.map((item) => (
                  <Link key={item.id} to={`/cases/${item.id}`} className="block px-3 py-2 text-sm transition hover:bg-mint/50">
                    <span className="font-medium text-ink">{item.title}</span>
                    <span className="ml-2 font-mono text-xs text-muted">{item.country}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/cases" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-deep">
              Открыть каталог
            </Link>
            <Link to="/countries" className="rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent-deep">
              Кейсы по странам
            </Link>
          </div>
        </div>

        {latestCases[0] && (
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-muted">
              <span className="font-mono">КЕЙС · {latestCases[0].country.toUpperCase()}</span>
              <SourceBadge level={latestCases[0].sourceLevel} showLabel />
            </div>
            <h2 className="mt-3 font-display text-xl font-semibold text-ink">{latestCases[0].title}</h2>
            <p className="mt-1.5 text-sm text-muted">{latestCases[0].summary}</p>
            <div className="mt-4">
              <MetricChip
                value={latestCases[0].effect.value}
                caption={latestCases[0].effect.caption}
                percent={latestCases[0].effect.percent}
                level={latestCases[0].sourceLevel}
              />
            </div>
            <Link to={`/cases/${latestCases[0].id}`} className="mt-4 inline-block text-sm font-semibold text-accent-deep hover:underline">
              Подробнее о кейсе
            </Link>
          </div>
        )}
      </ScrollReveal>

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((item, index) => (
          <ScrollReveal key={item.label} className="rounded-xl border border-line bg-surface px-6 py-5" delay={index * 120}>
            <CountUp value={item.value} className="font-display text-4xl font-semibold tracking-tight text-ink" />
            <div className="mt-1 text-sm text-muted">{item.label}</div>
            <div className="mt-3 h-0.5 w-8 rounded-full bg-accent" />
          </ScrollReveal>
        ))}
      </section>

      <ScrollReveal as="section" className="grid gap-4 lg:grid-cols-3">
        <CatalogBlock title="Каталог стран" items={allCountries} to={(item) => `/countries/${publishedCases.find((caseItem) => caseItem.country === item)?.countrySlug ?? ''}`} />
        <CatalogBlock title="Каталог технологий" items={allTechnologies} to={() => '/technologies'} />
        <CatalogBlock title="Каталог бизнес-проблем" items={allBusinessProblems} to={() => '/cases'} />
      </ScrollReveal>

      <ScrollReveal as="section" className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-display text-xl font-semibold text-ink">Популярные направления</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {popularDirections.map((item) => (
              <Link key={item.label} to="/cases" className="rounded-lg border border-line bg-paper px-3 py-2 transition hover:border-accent">
                <div className="font-mono text-sm font-semibold text-accent-deep">{item.label}</div>
                <div className="text-xs text-muted">{item.count} кейс(а)</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-display text-xl font-semibold text-ink">Уровни достоверности</h2>
          <div className="mt-4 space-y-3">
            {levelExplainers.map((item) => (
              <div key={item.level} className="flex gap-3 rounded-lg border border-line bg-paper px-3 py-2">
                <SourceBadge level={item.level} />
                <p className="text-sm text-muted">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">
            Кейсов с подтвержденным количественным эффектом: <span className="font-mono font-semibold text-accent-deep">{quantitativeCount}</span>
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal as="section">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Последние внедрения</h2>
          <Link to="/cases" className="text-sm font-semibold text-accent-deep hover:underline">все кейсы</Link>
        </div>
        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {latestCases.map((item) => (
            <Link key={item.id} to={`/cases/${item.id}`} className="flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-mint/50">
              <span className="font-mono text-xs text-muted">{item.country}</span>
              <span className="rounded-md bg-mint px-2 py-0.5 font-mono text-xs font-medium text-accent-deep">{item.technologies[0]}</span>
              <span className="min-w-0 flex-1 text-sm font-medium text-ink">{item.title}</span>
              <span className="font-mono text-sm font-semibold tabular-nums text-accent">{item.effect.value}</span>
              <SourceBadge level={item.sourceLevel} />
            </Link>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal as="section" className="rounded-xl border border-line bg-surface p-5">
        <h2 className="font-display text-xl font-semibold text-ink">Предложить новый кейс</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2">
          <input className="rounded-lg border border-line bg-paper px-3 py-2 text-sm" placeholder="Компания или объект" />
          <input className="rounded-lg border border-line bg-paper px-3 py-2 text-sm" placeholder="Ссылка на источник" />
          <textarea className="min-h-24 rounded-lg border border-line bg-paper px-3 py-2 text-sm md:col-span-2" placeholder="Что внедрили и какой эффект опубликован" />
          <button type="submit" className="w-fit rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-deep">
            Отправить предложение
          </button>
        </form>
      </ScrollReveal>
    </div>
  )
}

interface CatalogBlockProps {
  title: string
  items: string[]
  to: (item: string) => string
}

function CatalogBlock({ title, items, to }: CatalogBlockProps) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.slice(0, 8).map((item) => (
          <Link key={item} to={to(item)} className="rounded-full border border-line bg-paper px-3 py-1 text-sm text-muted transition hover:border-accent hover:text-accent-deep">
            {item}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default HomePage
