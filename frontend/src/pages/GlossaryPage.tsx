import PageHeading from '../components/PageHeading'

const terms = [
  { term: 'OEE', def: 'Общая эффективность оборудования.' },
  { term: 'MES', def: 'Система оперативного управления производством.' },
  { term: 'WMS', def: 'Система управления складом.' },
  { term: 'ERP', def: 'Система планирования ресурсов предприятия.' },
  { term: 'AGV', def: 'Автоматическая транспортная тележка.' },
  { term: 'AMR', def: 'Автономный мобильный робот.' },
  { term: 'Цифровой двойник', def: 'Виртуальная модель физического объекта.' },
  { term: 'Предиктивная аналитика', def: 'Прогнозирование событий по данным.' },
]

function GlossaryPage() {
  return (
    <div>
      <PageHeading
        eyebrow="ГЛОССАРИЙ"
        title="Глоссарий"
        description="Промышленные и IT-термины простыми словами."
      />
      <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {terms.map((t) => (
          <div
            key={t.term}
            className="grid gap-1 px-6 py-4 sm:grid-cols-[220px_1fr]"
          >
            <dt className="font-mono text-sm font-medium text-ink">{t.term}</dt>
            <dd className="text-sm text-muted">{t.def}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default GlossaryPage
