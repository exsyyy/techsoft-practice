import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { caseService } from '../api/caseService'
import PageHeading from '../components/PageHeading'
import { technologies } from '../data/catalog' // оставляем импорт статического справочника описаний
import type { CaseStudy } from '../data/catalog'

function TechnologiesPage() {
    // 1. Асинхронный запрос всех кейсов с бэкенда для связи с технологиями
    const { data: serverCases = [], isLoading, isError } = useQuery<CaseStudy[]>({
        queryKey: ['cases'],
        queryFn: () => caseService.getAll(),
    })

    // 2. Оставляем только опубликованные
    const publishedCases = useMemo(() => {
        return serverCases.filter((item) => item.status === 'published')
    }, [serverCases])

    // Состояние загрузки данных бэкенда
    if (isLoading) {
        return (
            <div className="container mx-auto p-6 text-center text-sm text-muted py-24">
                Загрузка каталога технологий...
            </div>
        )
    }

    // Состояние ошибки подключения
    if (isError) {
        return (
            <div className="container mx-auto p-6 text-center text-sm text-bad py-24 rounded-xl border border-bad/20 bg-surface">
                Не удалось загрузить данные. Проверьте подключение к серверу API.
            </div>
        )
    }

    return (
        <div>
            <PageHeading
                eyebrow="ТЕХНОЛОГИИ"
                title="Технологии"
                description="Назначение технологий, решаемые проблемы, преимущества, ограничения, требования, интеграции и связанные кейсы."
            />
            <div className="grid gap-4 lg:grid-cols-2">
                {technologies.map((technology) => {
                    // Ищем связанные кейсы, проверяя массив объектов технологий, пришедший из БД.
                    // Сравниваем по названию (.name) без учета регистра.
                    const related = publishedCases.filter((item) =>
                        item.technologies?.some(
                            (t) => t.name.toLowerCase() === technology.name.toLowerCase()
                        )
                    )

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
