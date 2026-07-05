import { type ReactNode, useEffect, useState } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'section'
}

function ScrollReveal({ children, className = '', delay = 0, as: Tag = 'div' }: ScrollRevealProps) {
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true)
      return
    }

    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [element])

  const props = {
    className: `scroll-reveal ${isVisible ? 'is-visible' : ''} ${className}`,
    style: { transitionDelay: `${delay}ms` },
  }

  if (Tag === 'section') {
    return (
      <section ref={setElement} {...props}>
        {children}
      </section>
    )
  }

  return (
    <div ref={setElement} {...props}>
      {children}
    </div>
  )
}

export default ScrollReveal
