import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { caseService } from '../api/caseService'
import SourceBadge from '../components/SourceBadge'
import type { CaseStudy } from '../data/catalog'

const statusOptions = ['draft', 'published', 'archived'] as const
const levelOptions = ['A', 'B', 'C', 'D'] as const

// Zod-схема, полностью синхронизированная с Pydantic-моделью FastAPI
const caseSchema = z.object({
  title: z.string().min(5, 'Укажите название кейса'),
  company: z.string().min(2, 'Укажите компанию'),
  country_id: z.string().min(1, 'Выберите страну из списка'),
  industry: z.string().min(2, 'Укажите отрасль'),
  facility_type: z.string().min(2, 'Укажите тип объекта'),
  business_problem: z.string().min(2, 'Укажите бизнес-проблему'),
  technology_names: z.string().min(2, 'Укажите технологии через запятую'),
  it_systems: z.string().min(2, 'Укажите IT-системы'),
  trust_level: z.enum(['A', 'B', 'C', 'D']),
  source_type: z.string().min(2, 'Укажите тип источника'),
  source_url: z.string().url('Укажите корректную ссылку'),
  created_at: z.string().min(1, 'Укажите дату публикации'),
  verification_date: z.string().min(1, 'Укажите дату проверки'),
  status: z.enum(['draft', 'published', 'archived']),
  is_vendor_case: z.boolean(),
  final_value: z.string().min(1, 'Укажите измеримый эффект или прочерк'),
  result_unit: z.string().min(2, 'Укажите единицу измерения / подпись эффекта'),
  problem_description: z.string().min(10, 'Опишите проблему'),
  solution_description: z.string().min(10, 'Опишите решение'),
  measurable_result: z.string().min(10, 'Опишите качественный результат'),
  implementation_stages: z.string().optional(),
  limitations: z.string().optional(),
  applicability: z.string().optional(),
})

type CaseForm = z.infer<typeof caseSchema>

const defaultValues: CaseForm = {
  title: '',
  company: '',
  country_id: '',
  industry: '',
  facility_type: '',
  business_problem: '',
  technology_names: '',
  it_systems: '',
  trust_level: 'B',
  source_type: '',
  source_url: '',
  created_at: new Date().toISOString().slice(0, 10),
  verification_date: new Date().toISOString().slice(0, 10),
  status: 'draft',
  is_vendor_case: false,
  final_value: '',
  result_unit: 'экономический эффект',
  problem_description: '',
  solution_description: '',
  measurable_result: '',
  implementation_stages: '',
  limitations: '',
  applicability: '',
}

function AdminPage() {
  const queryClient = useQueryClient()
  const [selectedStatus, setSelectedStatus] = useState<'draft' | 'published' | 'archived'>('draft')
  const [savedDraftTitle, setSavedDraftTitle] = useState('')

  // 1. Получаем кейсы с сервера
  const { data: serverCases = [], isLoading: isCasesLoading } = useQuery<CaseStudy[]>({
    queryKey: ['cases'],
    queryFn: () => caseService.getAll(),
  })

  // 2. Получаем справочник стран для селектора и маппинга в сайдбаре
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: () => caseService.getCountries(),
  })

  const countryMap = useMemo(() => new Map(countries.map((c) => [c.id, c.name])), [countries])

  // Фильтрация кейсов для сайдбара
  const visibleCases = useMemo(() => {
    return serverCases.filter((item) => item.status === selectedStatus)
  }, [serverCases, selectedStatus])

  // 3. Мутация добавления карточки в БД через API
  const createMutation = useMutation({
    mutationFn: (payload: any) => caseService.create(payload),
    onSuccess: (data) => {
      setSavedDraftTitle(data.title)
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      reset(defaultValues)
    },
    onError: (error) => {
      alert('Ошибка при сохранении кейса на сервере бэкенда.')
      console.error(error)
    }
  })

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CaseForm>({ resolver: zodResolver(caseSchema), defaultValues })

  const watchedLevel = watch('trust_level')
  const watchedVendor = watch('is_vendor_case')

  // 4. Сборка и отправка структуры данных
  const onSubmit = (values: CaseForm) => {
    // Форматируем технологии в массив названий, как ожидает эндпоинт FastAPI
    const techArray = values.technology_names
        ? values.technology_names.split(',').map((t) => t.trim()).filter(Boolean)
        : []

    const formattedPayload = {
      ...values,
      country_id: Number(values.country_id), // строго кастим к числу для внешнего ключа БД
      technologies: techArray.map(name => ({ name })), // Обертка в объекты, если бэк принимает связи
      // Если бэк принимает плоский массив строк для парсинга связей, оставь просто techArray
    }

    createMutation.mutate(formattedPayload)
  }

  return (
      <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted">администрирование</div>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Админ-панель</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Интерфейс редактора для добавления карточек напрямую в базу данных PostgreSQL через эндпоинты FastAPI.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">
            Текущая роль: <span className="font-mono font-semibold text-accent-deep">администратор</span>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-ink">Новая карточка кейса</h2>
              <div className="flex items-center gap-2">
                <SourceBadge level={watchedLevel} />
                {watchedVendor && <span className="rounded-full border border-bad/40 px-2 py-0.5 text-xs font-medium text-bad">vendor case study</span>}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <TextInput label="Название" error={errors.title?.message} {...register('title')} />
              <TextInput label="Компания" error={errors.company?.message} {...register('company')} />

              <label className="block text-xs font-medium text-muted">
                Страна внедрения
                <select {...register('country_id')} className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/20">
                  <option value="">Выберите из справочника...</option>
                  {countries.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                </select>
                {errors.country_id && <span className="mt-1 block text-xs text-bad">{errors.country_id.message}</span>}
              </label>

              <TextInput label="Отрасль" error={errors.industry?.message} {...register('industry')} />
              <TextInput label="Тип объекта" error={errors.facility_type?.message} {...register('facility_type')} />
              <TextInput label="Бизнес-проблема" error={errors.business_problem?.message} {...register('business_problem')} />
              <TextInput label="Технологии (через запятую)" error={errors.technology_names?.message} placeholder="WMS, RFID, Предиктивная аналитика" {...register('technology_names')} />
              <TextInput label="IT-системы" error={errors.it_systems?.message} placeholder="1C:ERP, MES" {...register('it_systems')} />

              <label className="block text-xs font-medium text-muted">
                Уровень достоверности
                <select {...register('trust_level')} className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none">
                  {levelOptions.map((level) => <option key={level} value={level}>{level}</option>)}
                </select>
              </label>
              <label className="block text-xs font-medium text-muted">
                Статус публикации
                <select {...register('status')} className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none">
                  {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>

              <TextInput label="Тип источника" error={errors.source_type?.message} placeholder="Пресс-релиз / Доклад" {...register('source_type')} />
              <TextInput label="Ссылка на источник" error={errors.source_url?.message} placeholder="https://..." {...register('source_url')} />
              <TextInput label="Дата публикации" type="date" error={errors.created_at?.message} {...register('created_at')} />
              <TextInput label="Дата проверки" type="date" error={errors.verification_date?.message} {...register('verification_date')} />
              <TextInput label="Значение эффекта" error={errors.final_value?.message} placeholder="+24% или -150 млн руб" {...register('final_value')} />
              <TextInput label="Подпись к эффекту" error={errors.result_unit?.message} placeholder="сокращение издержек" {...register('result_unit')} />

              <TextInput label="Ограничения и риски" error={errors.limitations?.message} placeholder="Не указаны" {...register('limitations')} />
              <TextInput label="Применимость решения" error={errors.applicability?.message} placeholder="Масштабируемо на холдинг" {...register('applicability')} />

              <div className="grid grid-cols-2 gap-3 rounded-lg border border-line bg-paper p-3 text-sm text-muted md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" {...register('is_vendor_case')} className="rounded text-accent focus:ring-accent" />
                  Vendor case study
                </label>
              </div>

              <Textarea label="Проблема" error={errors.problem_description?.message} placeholder="Подробное описание..." {...register('problem_description')} />
              <Textarea label="Решение" error={errors.solution_description?.message} placeholder="Что именно было сделано..." {...register('solution_description')} />
              <Textarea label="Результат" error={errors.measurable_result?.message} placeholder="Количественные или качественные итоги..." {...register('measurable_result')} />
              <Textarea label="Этапы внедрения (каждый шаг с новой строки)" error={errors.implementation_stages?.message} placeholder="1. Аудит инфраструктуры&#10;2. Развертывание ПО&#10;3. Обучение персонала" {...register('implementation_stages')} />
            </div>

            {savedDraftTitle && (
                <div className="mt-4 rounded-lg border border-ok/40 bg-mint px-3 py-2 text-sm text-accent-deep animate-fade-in">
                  Кейс «{savedDraftTitle}» успешно сохранен в базе бэкенда!
                </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-deep disabled:opacity-50"
              >
                {createMutation.isPending ? 'Сохранение...' : 'Сохранить карточку'}
              </button>
              <button type="button" onClick={() => reset(defaultValues)} className="rounded-lg border border-line bg-paper px-5 py-2.5 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent-deep">
                Очистить
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-xl border border-line bg-surface p-5">
              <h2 className="font-display text-lg font-semibold text-ink">Управление статусами</h2>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {statusOptions.map((status) => (
                    <button
                        key={status}
                        type="button"
                        onClick={() => setSelectedStatus(status)}
                        className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${selectedStatus === status ? 'border-accent bg-mint text-accent-deep' : 'border-line bg-paper text-muted'}`}
                    >
                      {status}
                    </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5">
              <h2 className="font-display text-lg font-semibold text-ink">Кейсы в статусе: {selectedStatus}</h2>
              <div className="mt-3 space-y-3 max-h-[680px] overflow-y-auto pr-1">
                {isCasesLoading ? (
                    <div className="text-sm text-muted text-center py-4">Обновление списка...</div>
                ) : visibleCases.map((item) => (
                    <div key={item.id} className="rounded-lg border border-line bg-paper p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-ink text-sm line-clamp-2">{item.title}</div>
                          <div className="mt-1 text-xs text-muted">
                            {item.company} · {countryMap.get(item.country_id) || `ID: ${item.country_id}`}
                          </div>
                        </div>
                        <SourceBadge level={item.trust_level} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                        <span className="rounded-full border border-line px-2 py-0.5">{item.status}</span>
                        {item.is_vendor_case && <span className="rounded-full border border-bad/40 px-2 py-0.5 text-bad">vendor</span>}
                      </div>
                    </div>
                ))}
                {!isCasesLoading && visibleCases.length === 0 && <div className="text-sm text-muted">Нет кейсов в этом статусе.</div>}
              </div>
            </div>
          </aside>
        </section>
      </div>
  )
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const TextInput = ({ label, error, ...props }: TextInputProps) => {
  return (
      <label className="block text-xs font-medium text-muted">
        {label}
        <input {...props} className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
        {error && <span className="mt-1 block text-xs text-bad">{error}</span>}
      </label>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

const Textarea = ({ label, error, ...props }: TextareaProps) => {
  return (
      <label className="block text-xs font-medium text-muted md:col-span-2">
        {label}
        <textarea {...props} className="mt-1 min-h-24 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
        {error && <span className="mt-1 block text-xs text-bad">{error}</span>}
      </label>
  )
}

export default AdminPage