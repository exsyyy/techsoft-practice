import { Link, useParams } from 'react-router-dom'
import SourceBadge from '../components/SourceBadge'
import MetricChip from '../components/MetricChip'
import { findCase } from '../data/catalog'

function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const item = findCase(id)

  if (!item) {
    return (
      <div className="rounded-xl border border-line bg-surface p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Кейс не найден</h1>
        <Link to="/cases" className="mt-4 inline-block text-sm font-semibold text-accent-deep hover:underline">
          Вернуться в каталог
        </Link>
      </div>
    )
  }

  const blocks = [
    { title: 'Проблема', accent: 'before:bg-bad', text: item.problem },
    { title: 'Решение', accent: 'before:bg-accent', text: item.solution },
    { title: 'Результат', accent: 'before:bg-ok', text: item.result },
  ]

  const meta = [
    ['Компания', item.company],
    ['Тип объекта', item.objectType],
    ['Отрасль', item.industry],
    ['Бизнес-проблема', item.businessProblem],
    ['IT-системы', item.itSystems.join(', ')],
    ['Технологии', item.technologies.join(', ')],
    ['Дата публикации', item.publishedAt],
    ['Дата проверки', item.verifiedAt],
    ['Статус верификации', item.verificationStatus],
    ['Ограничения и риски', item.limitations],
    ['Применимость', item.applicability],
    ['Тип источника', item.sourceType],
  ]

  return (
    <div>
      <Link to="/cases" className="text-sm font-semibold text-accent-deep hover:underline">
        ← к каталогу
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SourceBadge level={item.sourceLevel} showLabel />
        <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-medium text-muted">
          статус: {item.status === 'published' ? 'опубликован' : item.status}
        </span>
        {item.isVendorCaseStudy && (
          <span className="rounded-full border border-bad/40 bg-surface px-2.5 py-0.5 text-xs font-medium text-bad">
            vendor case study
          </span>
        )}
      </div>

      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">{item.title}</h1>
      <p className="mt-1.5 font-mono text-sm text-muted">{item.country} · {item.industry} · {item.technologies.join(', ')}</p>
      <p className="mt-3 max-w-3xl text-sm text-muted">{item.summary}</p>

      <div className="mt-6 max-w-md">
        <MetricChip value={item.effect.value} caption={item.effect.caption} percent={item.effect.percent} level={item.sourceLevel} />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {blocks.map((block) => (
          <div key={block.title} className={`relative overflow-hidden rounded-xl border border-line bg-surface p-5 pl-6 before:absolute before:inset-y-0 before:left-0 before:w-1 ${block.accent}`}>
            <h2 className="font-display text-base font-semibold text-ink">{block.title}</h2>
            <p className="mt-2 text-sm text-muted">{block.text}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-xl border border-line bg-surface px-5 py-4">
        <h2 className="font-display text-lg font-semibold text-ink">Этапы внедрения</h2>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {item.implementationStages.map((stage, index) => (
            <li key={stage} className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-muted">
              <span className="mr-2 font-mono font-semibold text-accent-deep">{index + 1}</span>{stage}
            </li>
          ))}
        </ol>
      </section>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        {meta.map(([key, value]) => (
          <div key={key} className="rounded-xl border border-line bg-surface px-5 py-3">
            <dt className="text-xs font-medium text-muted">{key}</dt>
            <dd className="mt-0.5 text-sm text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 rounded-xl border border-line bg-surface px-5 py-3 text-sm">
        <span className="text-muted">Источник: </span>
        <a href={item.sourceUrl} className="font-medium text-accent-deep hover:underline" target="_blank" rel="noreferrer">
          открыть первоисточник
        </a>
      </div>
    </div>
  )
}

export default CaseDetailPage
