import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SourceBadge from '../components/SourceBadge'
import { countBy, findCountryCases, uniqueValues } from '../data/catalog'

function CountryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [industry, setIndustry] = useState('')
  const [technology, setTechnology] = useState('')
  const cases = useMemo(() => findCountryCases(slug), [slug])
  const filtered = cases.filter((item) => {
    if (industry && item.industry !== industry) return false
    if (technology && !item.technologies.includes(technology)) return false
    return true
  })
  const country = cases[0]?.country ?? slug
  const industries = uniqueValues(cases.map((item) => item.industry))
  const technologies = uniqueValues(cases.flatMap((item) => item.technologies))
  const quantitativeShare = cases.length ? Math.round((cases.filter((item) => item.effect.hasQuantitative).length / cases.length) * 100) : 0
  const objectTypes = countBy(cases, (item) => item.objectType).slice(0, 4)
  const techStats = countBy(cases, (item) => item.technologies).slice(0, 4)
  const industryStats = countBy(cases, (item) => item.industry).slice(0, 4)

  return (
    <div>
      <Link to="/countries" className="text-sm font-semibold text-accent-deep hover:underline">← ко всем странам</Link>

      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">{country}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Описательная статистика по кейсам внедрения: типы объектов, технологии, отрасли и доля кейсов с подтвержденным эффектом.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="всего кейсов" value={String(cases.length)} />
        <StatCard label="с измеримым эффектом" value={`${quantitativeShare}%`} />
        <StatCard label="источники A/B" value={String(cases.filter((item) => item.sourceLevel === 'A' || item.sourceLevel === 'B').length)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Distribution title="Типы объектов" items={objectTypes} />
        <Distribution title="Технологии" items={techStats} />
        <Distribution title="Отрасли" items={industryStats} />
      </div>

      <div className="mt-8 rounded-xl border border-line bg-surface p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-muted">
            Отрасль
            <select value={industry} onChange={(event) => setIndustry(event.target.value)} className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink">
              <option value="">Все</option>
              {industries.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-muted">
            Технология
            <select value={technology} onChange={(event) => setTechnology(event.target.value)} className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink">
              <option value="">Все</option>
              {technologies.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </div>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">Кейсы страны</h2>
      <div className="mt-4 grid gap-3">
        {filtered.map((item) => (
          <Link key={item.id} to={`/cases/${item.id}`} className="rounded-xl border border-line bg-surface px-5 py-4 transition hover:border-accent hover:shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
              <SourceBadge level={item.sourceLevel} />
            </div>
            <p className="mt-1 text-sm text-muted">{item.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-6 py-5">
      <div className="font-display text-3xl font-semibold text-ink">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  )
}

function Distribution({ title, items }: { title: string; items: { label: string; count: number }[] }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted">{item.label}</span>
            <span className="font-mono font-semibold text-accent-deep">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CountryPage
