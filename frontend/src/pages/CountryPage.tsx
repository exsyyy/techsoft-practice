import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { caseService } from '../api/caseService'
import SourceBadge from '../components/SourceBadge'
import { countBy, uniqueValues } from '../data/catalog'
import type { CaseStudy } from '../data/catalog'

function CountryPage() {
    const { slug } = useParams<{ slug: string }>()
    const [industry, setIndustry] = useState('')
    const [technology, setTechnology] = useState('')

    // 1. Запрос всех кейсов с бэкенда
    const { data: serverCases = [], isLoading: isCasesLoading, isError: isCasesError } = useQuery<CaseStudy[]>({
        queryKey: ['cases'],
        queryFn: () => caseService.getAll(),
    })

    // 2. Запрос справочника стран для сопоставления текущего слагу из URL
    const { data: serverCountries = [], isLoading: isCountriesLoading, isError: isCountriesError } = useQuery({
        queryKey: ['countries'],
        queryFn: () => caseService.getCountries(),
    })

    const isLoading = isCasesLoading || isCountriesLoading
    const isError = isCasesError || isCountriesError

    // Находим текущую просматриваемую страну по её слагу
    const currentCountry = useMemo(() => {
        return serverCountries.find((c) => c.slug === slug)
    }, [serverCountries, slug])

    // Фильтруем опубликованные кейсы строго для текущей страны по country_id
    const countryCases = useMemo(() => {
        if (!currentCountry) return []
        return serverCases.filter((item) => item.country_id === currentCountry.id && item.status === 'published')
    }, [serverCases, currentCountry])

    // Динамические фильтры на основе имеющихся данных по стране
    const industries = useMemo(() => {
        return uniqueValues(countryCases.map((item) => item.industry).filter(Boolean))
    }, [countryCases])

    const technologies = useMemo(() => {
        const names = countryCases.flatMap((item) => item.technologies?.map((t) => t.name) ?? [])
        return uniqueValues(names)
    }, [countryCases])

    // Применяем выбранные селекты «Отрасль» и «Технология» к списку
    const filteredCases = useMemo(() => {
        return countryCases.filter((item) => {
            if (industry && item.industry !== industry) return false
            if (technology && !item.technologies?.some((t) => t.name === technology)) return false
            return true
        })
    }, [countryCases, industry, technology])

    // Расчет аналитических виджетов (доля измеримого эффекта по плоским полям final_value / measurable_result)
    const quantitativeShare = useMemo(() => {
        if (!countryCases.length) return 0
        const quantCount = countryCases.filter((item) => !!item.final_value || !!item.measurable_result).length
        return Math.round((quantCount / countryCases.length) * 100)
    }, [countryCases])

    const sourcesABCount = useMemo(() => {
        return countryCases.filter((item) => item.trust_level === 'A' || item.trust_level === 'B').length
    }, [countryCases])

    // Сбор статистики распределения для облаков/списков
    const objectTypes = useMemo(() => {
        return countBy(countryCases, (item) => item.facility_type ? [item.facility_type] : []).slice(0, 4)
    }, [countryCases])

    const techStats = useMemo(() => {
        return countBy(countryCases, (item) => item.technologies ? item.technologies.map((t) => t.name) : []).slice(0, 4)
    }, [countryCases])

    const industryStats = useMemo(() => {
        return countBy(countryCases, (item) => item.industry ? [item.industry] : []).slice(0, 4)
    }, [countryCases])

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 text-center text-sm text-muted py-24">
                Загрузка аналитики по стране...
            </div>
        )
    }

    if (isError || !currentCountry) {
        return (
            <div className="rounded-xl border border-line bg-surface p-8 text-center max-w-xl mx-auto my-12">
                <h1 className="font-display text-2xl font-semibold text-ink">Страна не найдена</h1>
                <Link to="/countries" className="mt-4 inline-block text-sm font-semibold text-accent-deep hover:underline">
                    Вернуться к списку стран
                </Link>
            </div>
        )
    }

    return (
        <div>
            <Link to="/countries" className="text-sm font-semibold text-accent-deep hover:underline">← ко всем странам</Link>

            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">{currentCountry.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
                Описательная статистика по кейсам внедрения: типы объектов, технологии, отрасли и доля кейсов с подтвержденным эффектом.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <StatCard label="всего кейсов" value={String(countryCases.length)} />
                <StatCard label="с измеримым эффектом" value={`${quantitativeShare}%`} />
                <StatCard label="источники A/B" value={String(sourcesABCount)} />
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
                {filteredCases.length === 0 ? (
                    <div className="rounded-xl border border-line bg-surface px-5 py-6 text-center text-sm text-muted">
                        Нет опубликованных кейсов, соответствующих выбранным фильтрам.
                    </div>
                ) : (
                    filteredCases.map((item) => (
                        <Link key={item.id} to={`/cases/${item.id}`} className="rounded-xl border border-line bg-surface px-5 py-4 transition hover:border-accent hover:shadow-sm block">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h3 className="font-display text-lg font-semibold text-ink group-hover:text-accent transition-colors">{item.title}</h3>
                                <SourceBadge level={item.trust_level} />
                            </div>
                            <p className="mt-1 text-sm text-muted line-clamp-2">{item.problem_description}</p>
                        </Link>
                    ))
                )}
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
                {items.length === 0 ? (
                    <div className="text-xs text-muted py-2">Данные отсутствуют</div>
                ) : (
                    items.map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-muted truncate max-w-[200px]" title={item.label}>{item.label}</span>
                            <span className="font-mono font-semibold text-accent-deep">{item.count}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default CountryPage