import { useEffect, useRef, useState } from 'react'
import SourceBadge, { type SourceLevel } from './SourceBadge'
import CountUp from './CountUp'

// Сигнатурный элемент базы: измеримый эффект кейса с мини-полоской и достоверностью.
interface MetricChipProps {
  /** Значение эффекта, напр. "+24%" или "−18%" */
  value: string
  /** Подпись под значением */
  caption?: string
  /** Заполнение полоски, 0–100 */
  percent: number
  level: SourceLevel
}

function MetricChip({ value, caption, percent, level }: MetricChipProps) {
  const target = Math.min(100, Math.max(0, percent))
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  // Полоска заполняется, когда метрика попадает в зону видимости
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setWidth(target)
      return
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setWidth(target)
            io.disconnect()
          }
        })
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target])

  return (<div ref={ref} className="rounded-xl border border-line bg-surface p-4">
        <div className="flex items-baseline justify-between gap-3">
          {/* Обернули число и знак % в отдельный flex, чтобы они склеились на левой стороне */}
          <div className="flex items-baseline">
            <CountUp
                value={value}
                className="font-mono text-3xl font-semibold tabular-nums text-accent"
            />
            {/* Если в подписи пришел процент, приклеиваем его к числу */}
            {caption === '%' && (
                <span className="font-mono text-3xl font-semibold text-accent">%</span>
            )}
          </div>

          <SourceBadge level={level} />
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div
              className="h-full rounded-full bg-accent transition-[width] duration-[1100ms] ease-out"
              style={{ width: `${width}%` }}
          />
        </div>

        {/* Выводим текст снизу только в том случае, если это реальная подпись, а не знак % */}
        {caption && caption !== '%' && <p className="mt-2 text-xs text-muted">{caption}</p>}
      </div>
  )
}

export default MetricChip
