import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  /** Конечное значение с префиксом/суффиксом, напр. "50+", "+24%", "×2" */
  value: string
  /** Длительность анимации, мс */
  duration?: number
  className?: string
}

// Вытаскиваем число из строки, сохраняя префикс (+, ×, −) и суффикс (%, +)
function parse(value: string) {
  // 1. Защита: принудительно делаем строку из всего, что пришло (даже если это null или число)
  const safeValue = value !== null && value !== undefined ? String(value) : '';

  const m = safeValue.match(/\d+(?:[.,]\d+)?/)

  // 2. Вместо null возвращаем дефолтную структуру, чтобы CountUp не упал дальше по коду
  if (!m) {
    return {
      prefix: safeValue,
      suffix: '',
      num: 0,
      decimals: 0,
    }
  }

  const raw = m[0]
  const idx = m.index ?? 0
  const decimals = /[.,]/.test(raw) ? raw.split(/[.,]/)[1].length : 0

  return {
    prefix: safeValue.slice(0, idx),
    suffix: safeValue.slice(idx + raw.length),
    num: parseFloat(raw.replace(',', '.')),
    decimals,
  }
}

function CountUp({ value, duration = 1200, className }: CountUpProps) {
  const parsed = parse(value)
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(
    parsed ? `${parsed.prefix}0${parsed.suffix}` : value,
  )

  useEffect(() => {
    if (!parsed) {
      setDisplay(value)
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }
    const el = ref.current
    if (!el) return

    let raf = 0
    const run = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
        const cur = parsed.num * eased
        setDisplay(`${parsed.prefix}${cur.toFixed(parsed.decimals)}${parsed.suffix}`)
        if (t < 1) raf = requestAnimationFrame(tick)
        else setDisplay(value)
      }
      raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            run()
            io.disconnect()
          }
        })
      },
      { threshold: 0.4 },
    )
    io.observe(el)

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}

export default CountUp
