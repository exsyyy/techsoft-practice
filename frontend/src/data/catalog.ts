
export type TrustLevel = 'A' | 'B' | 'C' | 'D'

export type CaseStatus = 'draft' | 'under_review' | 'verified' | 'published' | 'rejected'

export interface CountryResponse {
  id: number
  name: string
  slug: string
  description?: string | null
}

export interface TechnologyResponse {
  id: number
  name: string
  slug: string
  description?: string | null
  icon?: string | null
}

export interface CaseStudy {
  id: number // ID в БД теперь числовой
  title: string
  country_id: number // Бэкенд возвращает только связующий ID
  company: string
  industry: string
  facility_type: string // Заменили objectType -> facility_type
  business_problem: string // Заменили businessProblem -> business_problem
  problem_description: string
  technology_ids: number[]
  it_systems: string | null // На бэке это строка (или null), а не массив строк
  solution_description: string
  implementation_stages: string | null
  measurable_result: string | null
  result_unit: string | null
  result_period: string | null
  initial_value: string | null
  final_value: string | null
  limitations: string | null
  applicability: string | null
  source_url: string
  source_type: string // Заменили sourceType -> source_type
  trust_level: TrustLevel // Заменили sourceLevel -> trust_level
  source_date: string | null // ISO Date-time string
  is_vendor_case: boolean // Заменили isVendorCaseStudy -> is_vendor_case
  status: CaseStatus
  author_id: number
  verifier_id: number | null
  verification_date: string | null // ISO Date-time string
  created_at: string // ISO Date-time string
  updated_at: string // ISO Date-time string
  technologies?: TechnologyResponse[] | null // Вложенные объекты технологий
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

// ==========================================
// 2. СТАТИЧЕСКИЕ ДАННЫЕ (МАРКЕТИНГОВЫЕ КАРТОЧКИ)
// ==========================================

export const sourceLevelOrder: Record<TrustLevel, number> = { A: 4, B: 3, C: 2, D: 1 }

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

// ==========================================
// 3. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (ХЕЛПЕРЫ)
// ==========================================

export const uniqueValues = (items: any[]) => {
  if (!items || !Array.isArray(items)) return []
  const cleanStrings = items
      .filter((item) => item !== null && item !== undefined)
      .map((item) => String(item).trim())
  return Array.from(new Set(cleanStrings)).sort((a, b) => a.localeCompare(b, 'ru'))
}

// Приведение к String(id) спасает от багов, если из роутера прилетает строка "12", а в базе лежит число 12
export const findCase = (items: CaseStudy[], id?: string | number) =>
    items.find((item) => String(item.id) === String(id))

// Так как на бэке в самом кейсе нет countrySlug, фильтруем по country_id
export const findCountryCases = (items: CaseStudy[], countryId?: number) =>
    items.filter((item) => item.status === 'published' && item.country_id === countryId)

// Полнотекстовый поиск пересобран под новые свойства и вложенные массивы объектов технологий
export const caseSearchText = (item: CaseStudy) => {
  const techNames = item.technologies?.map(t => t.name) ?? []
  return [
    item.title || '',
    item.company || '',
    item.industry || '',
    item.facility_type || '',
    item.business_problem || '',
    item.problem_description || '',
    item.solution_description || '',
    item.measurable_result || '',
    item.it_systems || '',
    item.limitations || '',
    item.applicability || '',
    ...techNames
  ].join(' ').toLowerCase()
}

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

// Сортировка полностью переписана под актуальные даты и свойства FastAPI
export const sortCases = (items: CaseStudy[], sort: string) => {
  const sorted = [...items]
  sorted.sort((a, b) => {
    if (sort === 'published-asc') return a.created_at.localeCompare(b.created_at)
    if (sort === 'verified-desc') return (b.verification_date || '').localeCompare(a.verification_date || '')
    if (sort === 'verified-asc') return (a.verification_date || '').localeCompare(b.verification_date || '')
    if (sort === 'level-desc') return sourceLevelOrder[b.trust_level] - sourceLevelOrder[a.trust_level]
    if (sort === 'level-asc') return sourceLevelOrder[a.trust_level] - sourceLevelOrder[b.trust_level]
    if (sort === 'country-asc') return a.country_id - b.country_id
    if (sort === 'effect-first') return Number(!!b.measurable_result) - Number(!!a.measurable_result)
    return b.created_at.localeCompare(a.created_at) // Дефолт: сначала новые по дате создания
  })
  return sorted
}

export const countBy = (items: CaseStudy[], pick: (item: CaseStudy) => string | string[]) => {
  const result = new Map<string, number>()

  items.forEach((item) => {
    const values = pick(item)
    const list = Array.isArray(values) ? values : [values]

    list.forEach((value) => {
      if (value === null || value === undefined) return
      const stringValue = String(value).trim()
      if (!stringValue) return
      result.set(stringValue, (result.get(stringValue) ?? 0) + 1)
    })
  })

  return Array.from(result.entries())
      .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), 'ru'))
      .map(([label, count]) => ({ label, count }))
}