import { Link } from 'react-router-dom'
import PageHeading from '../components/PageHeading'
import { countBy, publishedCases } from '../data/catalog'

function CountriesPage() {
  const countries = countBy(publishedCases, (item) => item.country).map((country) => {
    const first = publishedCases.find((item) => item.country === country.label)
    return { ...country, slug: first?.countrySlug ?? country.label.toLowerCase() }
  })

  return (
    <div>
      <PageHeading eyebrow="СТРАНЫ" title="Страны" description="Кейсы и описательная статистика по странам внедрения." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((country) => (
          <Link key={country.slug} to={`/countries/${country.slug}`} className="group rounded-xl border border-line bg-surface px-6 py-5 transition hover:border-accent hover:shadow-sm">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">{country.label}</h2>
              <span className="font-mono text-xs text-muted">{country.slug.toUpperCase()}</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              <span className="font-mono font-semibold text-accent-deep">{country.count}</span> кейс(а)
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default CountriesPage
