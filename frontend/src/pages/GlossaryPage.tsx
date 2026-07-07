import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeading from '../components/PageHeading';
import { glossaryService } from '../api/glossaryService';


function GlossaryPage() {
    const [searchQuery, setSearchQuery] = useState('');

    // Запрашиваем данные с бэкенда с учетом строки поиска
    const { data: terms = [], isLoading, isError } = useQuery({
        queryKey: ['glossary', searchQuery],
        queryFn: () => glossaryService.getTerms(searchQuery),
    });

    return (
        <div className="space-y-6">
            <PageHeading
                eyebrow="ГЛОССАРИЙ"
                title="Глоссарий"
                description="Промышленные и IT-термины простыми словами."
            />

            {/* Поисковая строка */}
            <div className="max-w-md">
                <input
                    type="text"
                    placeholder="Поиск по терминам..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-line bg-surface px-4 py-2 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
                />
            </div>

            {/* Состояние загрузки */}
            {isLoading && (
                <div className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-muted">
                    Загрузка терминов...
                </div>
            )}

            {/* Состояние ошибки */}
            {isError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
                    Не удалось загрузить глоссарий. Проверьте соединение с сервером.
                </div>
            )}

            {/* Список терминов */}
            {!isLoading && !isError && (
                <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
                    {terms.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted">
                            {searchQuery ? 'По вашему запросу ничего не найдено.' : 'Глоссарий пока пуст.'}
                        </div>
                    ) : (
                        terms.map((t) => (
                            <div
                                key={t.id}
                                className="grid gap-1 px-6 py-4 sm:grid-cols-[220px_1fr] transition-colors hover:bg-black/[0.01]"
                            >
                                <dt className="font-mono text-sm font-medium text-ink">{t.term}</dt>
                                <dd className="text-sm text-muted">{t.definition}</dd>
                            </div>
                        ))
                    )}
                </dl>
            )}
        </div>
    );
}

export default GlossaryPage;