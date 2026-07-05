import casesJson from './cases.json'
import type { SourceLevel } from '../components/SourceBadge'

export type CaseStatus = 'draft' | 'published' | 'archived'

export interface CaseStudy {
  id: string
  title: string
  summary: string
  company: string
  country: string
  countrySlug: string
  industry: string
  objectType: string
  businessProblem: string
  technologies: string[]
  itSystems: string[]
  problem: string
  solution: string
  result: string
  implementationStages: string[]
  effect: {
    value: string
    caption: string
    percent: number
    hasQuantitative: boolean
    metrics: string[]
  }
  sourceLevel: SourceLevel
  sourceType: string
  sourceUrl: string
  publishedAt: string
  verifiedAt: string
  verificationStatus: string
  isVendorCaseStudy: boolean
  status: CaseStatus
  limitations: string
  applicability: string
}

export interface TechnologyCard {
  code: string
  name: string
  purpose: string
  solves: string
  advantages: string
  limitations: string
  requirements: string
  integrations: string
}

export const cases = casesJson as CaseStudy[]
export const publishedCases = cases.filter((item) => item.status === 'published')

export const sourceLevelOrder: Record<SourceLevel, number> = { A: 4, B: 3, C: 2, D: 1 }

export const technologies: TechnologyCard[] = [
  {
    code: 'WMS',
    name: 'Warehouse Management System',
    purpose: 'Управление складскими операциями, адресным хранением и отгрузкой.',
    solves: 'Ошибки комплектации, низкую скорость отбора, непрозрачные остатки.',
    advantages: 'Быстро дает измеримый эффект на складах с большим числом SKU.',
    limitations: 'Требует качественных справочников, дисциплины сканирования и интеграции с ERP.',
    requirements: 'Топология склада, терминалы сбора данных, маркировка ячеек.',
    integrations: 'ERP, TMS, RFID, BI.',
  },
  {
    code: 'MES',
    name: 'Manufacturing Execution System',
    purpose: 'Оперативное управление производством и регистрация фактических операций.',
    solves: 'Разрыв между планом и фактом, слабую трассируемость, ручную отчетность.',
    advantages: 'Повышает прозрачность смены и качество управленческих решений.',
    limitations: 'Сложна без нормализованных маршрутов и стабильных регламентов.',
    requirements: 'Маршрутные карты, рабочие центры, учет персонала и оборудования.',
    integrations: 'ERP, SCADA, QMS, APS.',
  },
  {
    code: 'IIoT',
    name: 'Промышленный интернет вещей',
    purpose: 'Сбор телеметрии с оборудования и инфраструктуры.',
    solves: 'Недостаток фактических данных о состоянии активов и процессе.',
    advantages: 'Создает базу для мониторинга, предиктивного обслуживания и энергоаналитики.',
    limitations: 'Нужны надежная связь, кибербезопасность и эксплуатация датчиков.',
    requirements: 'Датчики, шлюзы, сеть, правила хранения временных рядов.',
    integrations: 'SCADA, MES, EMS, BI.',
  },
  {
    code: 'Компьютерное зрение',
    name: 'Computer Vision',
    purpose: 'Автоматический визуальный контроль объектов, маркировки и дефектов.',
    solves: 'Медленный ручной контроль и нестабильное качество инспекции.',
    advantages: 'Масштабирует контроль качества и дает трассировку дефектов.',
    limitations: 'Чувствительно к освещению, качеству разметки и изменению ассортимента.',
    requirements: 'Камеры, свет, датасет дефектов, контур дообучения модели.',
    integrations: 'QMS, MES, PLC, BI.',
  },
  {
    code: 'APS',
    name: 'Advanced Planning & Scheduling',
    purpose: 'Планирование производства с учетом ограничений ресурсов.',
    solves: 'Перегрузку узких мест, лишние переналадки и несогласованные сроки заказов.',
    advantages: 'Позволяет быстро сравнивать сценарии и видеть последствия изменений.',
    limitations: 'Точность зависит от качества нормативов и актуальности ограничений.',
    requirements: 'Нормативы, маршруты, календарь ресурсов, правила приоритизации.',
    integrations: 'ERP, MES, S&OP, BI.',
  },
  {
    code: 'Цифровой двойник',
    name: 'Digital Twin',
    purpose: 'Модель объекта или процесса для анализа состояний и сценариев.',
    solves: 'Слабое понимание причин отклонений и влияния изменений на систему.',
    advantages: 'Помогает проверять гипотезы без риска для реального производства.',
    limitations: 'Дорог в поддержке, если нет надежного потока данных и владельца модели.',
    requirements: 'Данные процесса, модель, правила валидации, регулярная актуализация.',
    integrations: 'SCADA, IoT, EMS, BI, MES.',
  },
]

export const uniqueValues = (items: string[]) => Array.from(new Set(items)).sort((a, b) => a.localeCompare(b, 'ru'))

export const allCountries = uniqueValues(cases.map((item) => item.country))
export const allIndustries = uniqueValues(cases.map((item) => item.industry))
export const allObjectTypes = uniqueValues(cases.map((item) => item.objectType))
export const allBusinessProblems = uniqueValues(cases.map((item) => item.businessProblem))
export const allTechnologies = uniqueValues(cases.flatMap((item) => item.technologies))
export const allItSystems = uniqueValues(cases.flatMap((item) => item.itSystems))
export const allSourceTypes = uniqueValues(cases.map((item) => item.sourceType))

export const findCase = (id?: string) => cases.find((item) => item.id === id)
export const findCountryCases = (slug?: string) => publishedCases.filter((item) => item.countrySlug === slug)

export const caseSearchText = (item: CaseStudy) => [
  item.title,
  item.summary,
  item.company,
  item.country,
  item.industry,
  item.objectType,
  item.businessProblem,
  ...item.technologies,
  ...item.itSystems,
  item.problem,
  item.solution,
  item.result,
].join(' ').toLowerCase()

export const matchesQuery = (item: CaseStudy, query: string) => {
  const normalized = query.trim().toLowerCase()
  return normalized.length === 0 || caseSearchText(item).includes(normalized)
}

export const isInDatePreset = (date: string, preset: string) => {
  if (!preset) return true
  const value = new Date(date).getTime()
  const now = Date.now()
  const days = Math.floor((now - value) / 86_400_000)
  if (preset === 'last-90') return days <= 90
  if (preset === 'last-365') return days <= 365
  if (preset === 'older') return days > 365
  return true
}

export const sortCases = (items: CaseStudy[], sort: string) => {
  const sorted = [...items]
  sorted.sort((a, b) => {
    if (sort === 'published-asc') return a.publishedAt.localeCompare(b.publishedAt)
    if (sort === 'verified-desc') return b.verifiedAt.localeCompare(a.verifiedAt)
    if (sort === 'verified-asc') return a.verifiedAt.localeCompare(b.verifiedAt)
    if (sort === 'level-desc') return sourceLevelOrder[b.sourceLevel] - sourceLevelOrder[a.sourceLevel]
    if (sort === 'level-asc') return sourceLevelOrder[a.sourceLevel] - sourceLevelOrder[b.sourceLevel]
    if (sort === 'country-asc') return a.country.localeCompare(b.country, 'ru')
    if (sort === 'effect-first') return Number(b.effect.hasQuantitative) - Number(a.effect.hasQuantitative)
    return b.publishedAt.localeCompare(a.publishedAt)
  })
  return sorted
}

export const countBy = (items: CaseStudy[], pick: (item: CaseStudy) => string | string[]) => {
  const result = new Map<string, number>()
  items.forEach((item) => {
    const values = pick(item)
    const list = Array.isArray(values) ? values : [values]
    list.forEach((value) => result.set(value, (result.get(value) ?? 0) + 1))
  })
  return Array.from(result.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru'))
    .map(([label, count]) => ({ label, count }))
}
