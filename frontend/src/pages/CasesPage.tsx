import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeading from '../components/PageHeading'
import SourceBadge, { type SourceLevel } from '../components/SourceBadge'
import {
  allBusinessProblems,
  allCountries,
  allIndustries,
  allItSystems,
  allObjectTypes,
  allSourceTypes,
  allTechnologies,
  isInDatePreset,
  matchesQuery,
  publishedCases,
  sortCases,
} from '../data/catalog'

const levelOptions: SourceLevel[] = ['A', 'B', 'C', 'D']

const sortOptions = [
  { value: 'published-desc', label: 'Дата публикации: новые' },
  { value: 'published-asc', label: 'Дата публикации: старые' },
  { value: 'verified-desc', label: 'Дата проверки: новые' },
  { value: 'verified-asc', label: 'Дата проверки: старые' },
  { value: 'level-desc', label: 'Достоверность: выше' },
  { value: 'level-asc', label: 'Достоверность: ниже' },
  { value: 'country-asc', label: 'Страна: А-Я' },
  { value: 'effect-first', label: 'Сначала с эффектом' },
]

const dateOptions = [
  { value: '', label: 'Все даты' },
  { value: 'last-90', label: 'За 90 дней' },
  { value: 'last-365', label: 'За год' },
  { value: 'older', label: 'Старше года' },
]

const initialFilters = {
  country: '',
  industry: '',
  objectType: '',
  businessProblem: '',
  technology: '',
  itSystem: '',
  level: '',
  hasEffect: '',
  sourceType: '',
  publishedAt: '',
  verifiedAt: '',
}

type FilterKey = keyof typeof initialFilters

function CasesPage() {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('published-desc')
  const [filters, setFilters] = useState(initialFilters)

  const updateFilter = (key: FilterKey, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const filteredCases = useMemo(() => {
    const result = publishedCases.filter((item) => {
      if (!matchesQuery(item, query)) return false
      if (filters.country && item.country !== filters.country) return false
      if (filters.industry && item.industry !== filters.industry) return false
      if (filters.objectType && item.objectType !== filters.objectType) return false
      if (filters.businessProblem && item.businessProblem !== filters.businessProblem) return false
      if (filters.technology && !item.technologies.includes(filters.technology)) return false
      if (filters.itSystem && !item.itSystems.includes(filters.itSystem)) return false
      if (filters.level && item.sourceLevel !== filters.level) return false
      if (filters.hasEffect && String(item.effect.hasQuantitative) !== filters.hasEffect) return false
      if (filters.sourceType && item.sourceType !== filters.sourceType) return false
      if (!isInDatePreset(item.publishedAt, filters.publishedAt)) return false
      if (!isInDatePreset(item.verifiedAt, filters.verifiedAt)) return false
      return true
    })
    return sortCases(result, sort)
  }, [filters, query, sort])

  return (
    <div>
      <PageHeading
        eyebrow="КАТАЛОГ"
        title="Каталог кейсов"
        description="Поиск, фильтрация и сортировка подтверждённых кейсов цифровой оптимизации."
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit space-y-4 rounded-xl border border-line bg-surface p-5">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по кейсам..."
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />

          <FilterSelect label="Страна" value={filters.country} options={allCountries} onChange={(value) => updateFilter('country', value)} />
          <FilterSelect label="Отрасль" value={filters.industry} options={allIndustries} onChange={(value) => updateFilter('industry', value)} />
          <FilterSelect label="Тип объекта" value={filters.objectType} options={allObjectTypes} onChange={(value) => updateFilter('objectType', value)} />
          <FilterSelect label="Бизнес-проблема" value={filters.businessProblem} options={allBusinessProblems} onChange={(value) => updateFilter('businessProblem', value)} />
          <FilterSelect label="Технология" value={filters.technology} options={allTechnologies} onChange={(value) => updateFilter('technology', value)} />
          <FilterSelect label="IT-система" value={filters.itSystem} options={allItSystems} onChange={(value) => updateFilter('itSystem', value)} />
          <FilterSelect label="Уровень достоверности" value={filters.level} options={levelOptions} onChange={(value) => updateFilter('level', value)} />
          <FilterSelect label="Количественный эффект" value={filters.hasEffect} options={[{ value: 'true', label: 'Есть' }, { value: 'false', label: 'Нет' }]} onChange={(value) => updateFilter('hasEffect', value)} />
          <FilterSelect label="Тип источника" value={filters.sourceType} options={allSourceTypes} onChange={(value) => updateFilter('sourceType', value)} />
          <FilterSelect label="Дата публикации" value={filters.publishedAt} options={dateOptions} onChange={(value) => updateFilter('publishedAt', value)} />
          <FilterSelect label="Дата проверки" value={filters.verifiedAt} options={dateOptions} onChange={(value) => updateFilter('verifiedAt', value)} />

          <button
            type="button"
            onClick={() => {
              setFilters(initialFilters)
              setQuery('')
            }}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent-deep"
          >
            Сбросить фильтры
          </button>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted">
              Найдено: <span className="font-mono font-semibold text-accent-deep">{filteredCases.length}</span>
            </div>
            <label className="flex flex-col gap-1 text-xs font-medium text-muted sm:min-w-64">
              Сортировка
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          {filteredCases.map((item) => (
            <Link
              key={item.id}
              to={`/cases/${item.id}`}
              className="block rounded-xl border border-line bg-surface px-5 py-4 transition hover:border-accent hover:shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="font-mono">{item.country}</span>
                  <span>{item.industry}</span>
                  {item.technologies.slice(0, 2).map((tech) => (
                    <span key={tech} className="rounded-md bg-mint px-2 py-0.5 font-mono font-medium text-accent-deep">{tech}</span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {item.isVendorCaseStudy && <span className="rounded-full border border-bad/40 px-2 py-0.5 text-xs font-medium text-bad">vendor case study</span>}
                  <SourceBadge level={item.sourceLevel} />
                </div>
              </div>
              <h2 className="mt-2 font-display text-lg font-semibold text-ink">{item.title}</h2>
              <p className="mt-1 text-sm text-muted">{item.summary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-sm">
                <span className="font-semibold tabular-nums text-accent">{item.effect.value}</span>
                <span className="text-muted">проверено {item.verifiedAt}</span>
                <span className="text-muted">{item.verificationStatus}</span>
              </div>
            </Link>
          ))}

          {filteredCases.length === 0 && (
            <div className="rounded-xl border border-line bg-surface px-5 py-8 text-center text-sm text-muted">
              Ничего не найдено. Попробуйте изменить фильтры или поисковый запрос.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface FilterSelectProps {
  label: string
  value: string
  options: string[] | { value: string; label: string }[]
  onChange: (value: string) => void
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="block text-xs font-medium text-muted">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      >
        <option value="">Все</option>
        {options.map((option) => {
          const item = typeof option === 'string' ? { value: option, label: option } : option
          return <option key={item.value} value={item.value}>{item.label}</option>
        })}
      </select>
    </label>
  )
}

export default CasesPage
