import { Link } from 'react-router-dom'
import PageHeading from '../components/PageHeading'
import { publishedCases, technologies } from '../data/catalog'

function TechnologiesPage() {
  return (
    <div>
      <PageHeading
        eyebrow="ТЕХНОЛОГИИ"
        title="Технологии"
        description="Назначение технологий, решаемые проблемы, преимущества, ограничения, требования, интеграции и связанные кейсы."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {technologies.map((technology) => {
          const related = publishedCases.filter((item) => item.technologies.includes(technology.code))
          return (
            <article key={technology.code} className="rounded-xl border border-line bg-surface px-5 py-4 transition hover:border-accent hover:shadow-sm">
              <div className="inline-block rounded-md bg-mint px-2 py-0.5 font-mono text-sm font-semibold text-accent-deep">{technology.code}</div>
              <h2 className="mt-2 font-display text-lg font-semibold text-ink">{technology.name}</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <Field label="Назначение" value={technology.purpose} />
                <Field label="Что решает" value={technology.solves} />
                <Field label="Преимущества" value={technology.advantages} />
                <Field label="Ограничения" value={technology.limitations} />
                <Field label="Требования" value={technology.requirements} />
                <Field label="Интеграции" value={technology.integrations} />
              </dl>
              <div className="mt-4 border-t border-line pt-3">
                <div className="text-xs font-medium text-muted">Связанные кейсы</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {related.length > 0 ? related.map((item) => (
                    <Link key={item.id} to={`/cases/${item.id}`} className="rounded-full border border-line bg-paper px-3 py-1 text-xs text-muted transition hover:border-accent hover:text-accent-deep">
                      {item.title}
                    </Link>
                  )) : <span className="text-sm text-muted">Пока нет опубликованных кейсов</span>}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-0.5 text-ink">{value}</dd>
    </div>
  )
}

export default TechnologiesPage
