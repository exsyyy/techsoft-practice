import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import PageHeading from '../components/PageHeading'
import { glossaryService, type GlossaryTerm } from '../api/glossaryService'

function GlossaryPage() {
    const [searchQuery, setSearchQuery] = useState('')

    // 1. Асинхронный запрос всех терминов глоссария с бэкенда
    const { data: glossaryItems = [], isLoading, isError } = useQuery<GlossaryTerm[]>({
        queryKey: ['glossary'],
        queryFn: () => glossaryService.getTerms(undefined, 0, 500),
    })

    // 2. Фильтрация дубликатов на клиенте (с приоритетом для заполненных описаний)
    const uniqueGlossaryItems = useMemo(() => {
        const seen = new Set<string>()
        const result: GlossaryTerm[] = []

        for (const item of glossaryItems) {
            const normalizedTerm = item.term.trim().toLowerCase()

            if (!seen.has(normalizedTerm)) {
                seen.add(normalizedTerm)
                result.push(item)
            } else {
                // Если термин уже был добавлен, но у текущего элемента описание заполнено,
                // а у ранее сохраненного пустое — заменяем его на более качественную карточку
                const existingIndex = result.findIndex(
                    (r) => r.term.trim().toLowerCase() === normalizedTerm
                )
                if (
                    existingIndex !== -1 &&
                    (!result[existingIndex].definition || result[existingIndex].definition.trim() === '') &&
                    item.definition &&
                    item.definition.trim() !== ''
                ) {
                    result[existingIndex] = item
                }
            }
        }

        // Сортируем уникальные термины по алфавиту для красоты отображения
        return result.sort((a, b) => a.term.localeCompare(b.term))
    }, [glossaryItems])

    // 3. Мгновенная фильтрация терминов на стороне клиента по поисковому запросу
    const filteredItems = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return uniqueGlossaryItems

        return uniqueGlossaryItems.filter((item) => {
            const termMatch = item.term.toLowerCase().includes(query)
            const definitionMatch = (item.definition || '').toLowerCase().includes(query)
            return termMatch || definitionMatch
        })
    }, [uniqueGlossaryItems, searchQuery])

    return (
        <div className="space-y-8">
            <PageHeading
                eyebrow="ИНФОРМАЦИОННЫЙ СПРАВОЧНИК"
                title="Глоссарий терминов"
                description="Словарь ключевых понятий цифровизации, производственных систем, складской логистики и индустриального софта."
            />

            {/* Панель поиска */}
            <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-lg">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск по терминам..."
                        className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 pl-10 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                    <div className="absolute left-3.5 top-3 text-muted">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Статистика терминов */}
                <div className="text-xs font-mono text-muted">
                    Всего терминов: <span className="font-semibold text-accent-deep">{uniqueGlossaryItems.length}</span>
                    {searchQuery && (
                        <> | Найдено: <span className="font-semibold text-accent-deep">{filteredItems.length}</span></>
                    )}
                </div>
            </div>

            {/* Сетка терминов */}
            {isLoading ? (
                <div className="text-center text-sm text-muted py-12">
                    Загрузка терминов и определений...
                </div>
            ) : isError ? (
                <div className="rounded-xl border border-bad/20 bg-surface px-6 py-12 text-center text-sm text-bad">
                    Не удалось загрузить глоссарий. Проверьте подключение к бэкенду.
                </div>
            ) : filteredItems.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col justify-between rounded-xl border border-line bg-surface p-5 transition hover:border-accent/40"
                        >
                            <div className="space-y-2">
                                <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                                    {item.term}
                                </h3>

                                {/* Выводим описание или плейсхолдер, если оно отсутствует в бд */}
                                <p className="text-sm leading-relaxed text-muted">
                                    {item.definition && item.definition.trim() !== ''
                                        ? item.definition.charAt(0).toUpperCase() + item.definition.slice(1)
                                        : 'Определение для этого термина еще не добавлено в базу данных.'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-line bg-surface px-6 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-line text-muted">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-ink">Термины не найдены</h3>
                    <p className="mt-1 text-xs text-muted">Попробуйте изменить поисковый запрос.</p>
                </div>
            )}
        </div>
    )
}

export default GlossaryPage