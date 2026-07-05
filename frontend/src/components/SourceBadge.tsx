export type SourceLevel = 'A' | 'B' | 'C' | 'D'

const levelMeta: Record<SourceLevel, { dot: string; text: string; label: string }> = {
  A: { dot: 'bg-ok', text: 'text-ok', label: 'высокий' },
  B: { dot: 'bg-warn', text: 'text-warn', label: 'достаточный' },
  C: { dot: 'bg-bad', text: 'text-bad', label: 'vendor' },
  D: { dot: 'bg-off', text: 'text-off', label: 'недопустим' },
}

interface SourceBadgeProps {
  level: SourceLevel
  /** Показать словесную расшифровку уровня рядом с кодом */
  showLabel?: boolean
}

function SourceBadge({ level, showLabel = false }: SourceBadgeProps) {
  const meta = levelMeta[level]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-xs">
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      <span className={meta.text}>[{level}]</span>
      {showLabel && <span className="text-muted">{meta.label}</span>}
    </span>
  )
}

export default SourceBadge
