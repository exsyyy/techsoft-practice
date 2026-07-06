import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { caseService } from '../api/caseService'
import SourceBadge from '../components/SourceBadge'
import MetricChip from '../components/MetricChip'

function CaseDetailPage() {
    const { id } = useParams<{ id: string }>()

    // 1. Асинхронный запрос данных конкретного кейса по ID из FastAPI
    const { data: item, isLoading: isCaseLoading, isError: isCaseError } = useQuery({
        queryKey: ['case', id],
        queryFn: () => caseService.getById(id!),
        enabled: !!id,
    })

    // 2. Параллельный запрос стран для маппинга текстового названия страны по её ID
    const { data: countries = [] } = useQuery({
        queryKey: ['countries'],
        queryFn: () => caseService.getCountries(),
    })

    const countryMap = useMemo(() => new Map(countries.map((c) => [c.id, c.name])), [countries])

    // Состояние загрузки данных
    if (isCaseLoading) {
        return (
            <div className="container mx-auto p-6 text-center text-sm text-muted py-24">
                Загрузка детальной информации о кейсе...
            </div>
        )
    }

    // Если кейс не найден или бэкенд вернул ошибку
    if (isCaseError || !item) {
        return (
            <div className="rounded-xl border border-line bg-surface p-8 text-center max-w-xl mx-auto my-12">
                <h1 className="font-display text-2xl font-semibold text-ink">Кейс не найден</h1>
                <Link to="/cases" className="mt-4 inline-block text-sm font-semibold text-accent-deep hover:underline">
                    Вернуться в каталог
                </Link>
            </div>
        )
    }

    // Безопасно собираем имена вложенных технологий в одну строку
    const techNamesString = item.technologies?.map((t) => t.name).join(', ') ?? 'Не указаны'

    // Так как на бэкенде этапы внедрения — это строка, разбиваем её по переносу строки \n,
    // чтобы сохранить твою красивую структуру нумерованного списка <ol>
    const stagesArray = item.implementation_stages
        ? item.implementation_stages.split('\n').map((stage) => stage.trim()).filter(Boolean)
        : []

    const blocks = [
        { title: 'Проблема', accent: 'before:bg-bad', text: item.problem_description },
        { title: 'Решение', accent: 'before:bg-accent', text: item.solution_description },
        { title: 'Результат', accent: 'before:bg-ok', text: item.measurable_result || 'Количественный эффект не зафиксирован' },
    ]

    const meta = [
        ['Компания', item.company],
        ['Тип объекта', item.facility_type],
        ['Отрасль', item.industry],
        ['Бизнес-проблема', item.business_problem],
        ['IT-системы', item.it_systems || '—'], // Теперь это строка напрямую из БД
        ['Технологии', techNamesString],
        ['Дата публикации', item.created_at ? item.created_at.slice(0, 10) : '—'],
        ['Дата проверки', item.verification_date ? item.verification_date.slice(0, 10) : '—'],
        ['Статус верификации', item.status],
        ['Ограничения и риски', item.limitations || 'Не указаны'],
        ['Применимость', item.applicability || 'Не указана'],
        ['Тип источника', item.source_type],
    ]

    return (
        <div>
            <Link to="/cases" className="text-sm font-semibold text-accent-deep hover:underline">
                ← к каталогу
            </Link>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <SourceBadge level={item.trust_level} showLabel />
                <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-medium text-muted">
          статус: {item.status === 'published' ? 'опубликован' : item.status}
        </span>
                {item.is_vendor_case && (
                    <span className="rounded-full border border-bad/40 bg-surface px-2.5 py-0.5 text-xs font-medium text-bad">
            vendor case study
          </span>
                )}
            </div>

            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">{item.title}</h1>
            <p className="mt-1.5 font-mono text-sm text-muted">
                {countryMap.get(item.country_id) ?? `ID: ${item.country_id}`} · {item.industry} · {techNamesString}
            </p>
            <p className="mt-3 max-w-3xl text-sm text-muted">{item.problem_description}</p>

            <div className="mt-6 max-w-md">
                <MetricChip
                    value={item.final_value || item.measurable_result || '—'}
                    caption={item.result_unit || 'Измеримый эффект'}
                    // Оживляем полосу для детальной страницы
                    percent={
                        item.result_unit === '%'
                            ? parseInt(item.final_value ?? '0', 10)
                            : 0 // Если тут текст (например, "млн руб"), оставляем полосу пустой
                    }
                    level={item.trust_level}
                />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
                {blocks.map((block) => (
                    <div key={block.title} className={`relative overflow-hidden rounded-xl border border-line bg-surface p-5 pl-6 before:absolute before:inset-y-0 before:left-0 before:w-1 ${block.accent}`}>
                        <h2 className="font-display text-base font-semibold text-ink">{block.title}</h2>
                        <p className="mt-2 text-sm text-muted whitespace-pre-line">{block.text}</p>
                    </div>
                ))}
            </div>

            {stagesArray.length > 0 && (
                <section className="mt-6 rounded-xl border border-line bg-surface px-5 py-4">
                    <h2 className="font-display text-lg font-semibold text-ink">Этапы внедрения</h2>
                    <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                        {stagesArray.map((stage, index) => (
                            <li key={index} className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-muted">
                                <span className="mr-2 font-mono font-semibold text-accent-deep">{index + 1}</span>{stage}
                            </li>
                        ))}
                    </ol>
                </section>
            )}

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
                <a href={item.source_url} className="font-medium text-accent-deep hover:underline" target="_blank" rel="noreferrer">
                    открыть первоисточник
                </a>
            </div>
        </div>
    )
}

export default CaseDetailPage