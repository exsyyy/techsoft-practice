import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { caseService } from '../api/caseService'
import PageHeading from '../components/PageHeading'
import type { CaseStudy } from '../data/catalog'

function CountriesPage() {
    // 1. Асинхронный запрос всех кейсов с бэкенда FastAPI
    const { data: serverCases = [], isLoading: isCasesLoading, isError: isCasesError } = useQuery<CaseStudy[]>({
        queryKey: ['cases'],
        queryFn: () => caseService.getAll(),
    })

    // 2. Параллельный запрос полноценного справочника стран (id, name, slug)
    const { data: serverCountries = [], isLoading: isCountriesLoading, isError: isCountriesError } = useQuery({
        queryKey: ['countries'],
        queryFn: () => caseService.getCountries(),
    })

    const isLoading = isCasesLoading || isCountriesLoading
    const isError = isCasesError || isCountriesError

    // Оставляем только опубликованные кейсы
    const publishedCases = useMemo(() => {
        return serverCases.filter((item) => item.status === 'published')
    }, [serverCases])

    // 3. Группируем кейсы по country_id и маппим на реальные данные из справочника
    const countriesData = useMemo(() => {
        // Собираем хэш-мапу { [country_id]: количество_кейсов }
        const counts: Record<number, number> = {}
        publishedCases.forEach((item) => {
            if (item.country_id) {
                counts[item.country_id] = (counts[item.country_id] || 0) + 1
            }
        })

        // Маппим массив стран, у которых есть хотя бы один опубликованный кейс
        return serverCountries
            .map((country) => ({
                id: country.id,
                name: country.name,
                slug: country.slug,
                count: counts[country.id] || 0,
            }))
            .filter((country) => country.count > 0) // Сохраняем исходное поведение: прячем пустые страны
    }, [publishedCases, serverCountries])

    // Состояние загрузки данных
    if (isLoading) {
        return (
            <div className="container mx-auto p-6 text-center text-sm text-muted py-24">
                Загрузка списка стран...
            </div>
        )
    }

    // Состояние ошибки бэкенда
    if (isError) {
        return (
            <div className="container mx-auto p-6 text-center text-sm text-bad py-24 rounded-xl border border-bad/20 bg-surface">
                Не удалось загрузить данные стран. Проверьте статус API.
            </div>
        )
    }

    return (
        <div>
            <PageHeading eyebrow="СТРАНЫ" title="Страны" description="Кейсы и описательная статистика по странам внедрения." />

            {countriesData.length === 0 ? (
                <div className="rounded-xl border border-line bg-surface px-5 py-8 text-center text-sm text-muted">
                    В базе данных пока нет опубликованных кейсов со странами.
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {countriesData.map((country) => (
                        <Link
                            key={country.id}
                            to={`/countries/${country.slug}`}
                            className="group rounded-xl border border-line bg-surface px-6 py-5 transition hover:border-accent hover:shadow-sm"
                        >
                            <div className="flex items-baseline justify-between">
                                <h2 className="font-display text-lg font-semibold text-ink group-hover:text-accent-deep transition-colors">
                                    {country.name}
                                </h2>
                                <span className="font-mono text-xs text-muted">
                                    {country.slug.toUpperCase()}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-muted">
                                <span className="font-mono font-semibold text-accent-deep">{country.count}</span> кейс(а)
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

export default CountriesPage