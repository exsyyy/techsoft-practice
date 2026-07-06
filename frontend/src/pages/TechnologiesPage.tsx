import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { caseService } from '../api/caseService'
import PageHeading from '../components/PageHeading'
import { technologiesData } from '../data/technologiesData' // Импортируем новый расширенный справочник
import type { CaseStudy } from '../data/catalog'

function TechnologiesPage() {
    // 1. Асинхронный запрос всех кейсов с бэкенда для динамической связи с технологиями
    const { data: serverCases = [], isLoading, isError } = useQuery<CaseStudy[]>({
        queryKey: ['cases'],
        queryFn: () => caseService.getAll(),
    })

    // 2. Оставляем только опубликованные кейсы для вывода пользователям
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
        <div className="space-y-8">
            <PageHeading
                eyebrow="ТЕХНОЛОГИИ"
                title="Технологии"
                description="Назначение технологий, решаемые проблемы, преимущества, ограничения, требования, интеграции и связанные кейсы."
            />

            <div className="grid gap-4 lg:grid-cols-2">
                {technologiesData.map((technology) => {
                    // Ищем связанные кейсы, проверяя массив объектов технологий, пришедший из БД.
                    // Сравниваем по названию (.name) или коду без учета регистра.
                    const related = publishedCases.filter((item) =>
                        item.technologies?.some(
                            (t) =>
                                t.name.toLowerCase() === technology.name.toLowerCase() ||
                                t.name.toLowerCase().includes(technology.code.toLowerCase())
                        )
                    )

                    return (
                        <article
                            key={technology.code}
                            className="flex flex-col justify-between rounded-xl border border-line bg-surface px-5 py-4 transition hover:border-accent hover:shadow-sm"
                        >
                            <div>
                                <div className="inline-block rounded-md bg-mint px-2 py-0.5 font-mono text-sm font-semibold text-accent-deep">
                                    {technology.code}
                                </div>
                                <h2 className="mt-2 font-display text-lg font-semibold text-ink">
                                    {technology.name}
                                </h2>
                                <dl className="mt-4 grid gap-3 text-sm">
                                    <Field label="Назначение" value={technology.purpose} />
                                    <Field label="Что решает" value={technology.solves} />
                                    <Field label="Преимущества" value={technology.advantages} />
                                    <Field label="Ограничения" value={technology.limitations} />
                                    <Field label="Требования" value={technology.requirements} />
                                    <Field label="Интеграции" value={technology.integrations} />
                                </dl>
                            </div>
                            <div className="mt-6 border-t border-line pt-3">
                                <div className="text-xs font-medium text-muted">Связанные кейсы</div>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    {related.length > 0 ? (
                                        <>
                                            {/* Берем только первый кейс из массива */}
                                            {related.slice(0, 1).map((item) => (
                                                <Link
                                                    key={item.id}
                                                    to={`/cases/${item.id}`}
                                                    className="truncate max-w-[250px] rounded-full border border-line bg-paper px-3 py-1 text-xs text-muted transition hover:border-accent hover:text-accent-deep"
                                                    title={item.title} // Подсказка при наведении с полным названием
                                                >
                                                    {item.title}
                                                </Link>
                                            ))}

                                            {/* Если кейсов больше одного, показываем счетчик остальных */}
                                            {related.length > 1 && (
                                                <span className="text-xs font-mono text-muted bg-paper/50 px-2 py-1 rounded-md border border-line/50">
                                            +{related.length - 1} еще
                                                </span>
                                            )}
                                        </>
                                        ) : (
                                        <span className="text-sm text-muted">Пока нет опубликованных кейсов</span>
                                    )}
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
            <dd className="mt-0.5 text-ink leading-relaxed">{value}</dd>
        </div>
    )
}

export default TechnologiesPage