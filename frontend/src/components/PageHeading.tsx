interface PageHeadingProps {
  /** Короткий код-надстрочник, напр. "КАТАЛОГ" */
  eyebrow?: string
  title: string
  description?: string
}

function PageHeading({ eyebrow, title, description }: PageHeadingProps) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <div className="mb-2 font-mono text-xs font-medium tracking-[0.18em] text-accent-deep">
          {eyebrow}
        </div>
      )}
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>
      )}
    </div>
  )
}

export default PageHeading
