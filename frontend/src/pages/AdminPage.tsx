import React, { useMemo, useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { caseService } from '../api/caseService'
import { useAuth } from '../api/AuthContext'
import { API_URL } from '../api/apiConfig' // Импортируем динамический API_URL из конфигурации
import SourceBadge from '../components/SourceBadge'
import type { CaseStudy } from '../data/catalog'
import type { CreateCaseStudyDto } from '../api/caseService'

// 1. Обновляем массив статусов точно под бэкенд FastAPI
const statusOptions = ['draft', 'under_review', 'verified', 'published', 'rejected'] as const
const levelOptions = ['A', 'B', 'C', 'D'] as const

type CaseStatus = typeof statusOptions[number]

// Соответствие статусов для понятного отображения на русском языке
const statusLabels: Record<CaseStatus, string> = {
  draft: 'Черновик',
  under_review: 'На проверке',
  verified: 'Проверен',
  published: 'Опубликован',
  rejected: 'Отклонен',
}

// 2. Меняем валидацию статуса в Zod-схеме
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
  status: z.enum(statusOptions), // Ссылка на новый массив
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

interface Country {
  id: number
  name: string
}

function AdminPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { isAuthenticated, username } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  const roleLabel = username === 'admin_user' ? 'Администратор' : 'Редактор'

  // 3. Стейт начального выбранного таба тоже переводим на новый тип
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus>('draft')
  const [savedDraftTitle, setSavedDraftTitle] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const { data: serverCases = [], isLoading: isCasesLoading } = useQuery<CaseStudy[]>({
    queryKey: ['cases'],
    queryFn: () => caseService.getAll(),
  })

  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: () => caseService.getCountries() as Promise<Country[]>,
  })

  const countryMap = useMemo(() => new Map(countries.map((c) => [c.id, c.name])), [countries])

  const visibleCases = useMemo(() => {
    return serverCases.filter((item) => item.status === selectedStatus)
  }, [serverCases, selectedStatus])

  const createMutation = useMutation<CaseStudy, Error, CreateCaseStudyDto>({
    mutationFn: caseService.create,
    onSuccess: (data) => {
      setSavedDraftTitle(data.title)
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      reset(defaultValues)
    },
    onError: (error) => {
      alert('Ошибка при создании кейса')
      console.error(error)
    },
  })

  // 4. Обновляем типизацию входящего статуса для мутации патча
  const updateStatusMutation = useMutation<
      CaseStudy,
      Error,
      { id: number; status: CaseStatus }
  >({
    mutationFn: ({ id, status }) => caseService.update(id, { status: status as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
    },
    onError: (error) => {
      console.error(error)
      alert('Не удалось изменить статус кейса. Возможно, у вас нет прав администратора.')
    },
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

  const onSubmit = (values: CaseForm) => {
    const techArray = values.technology_names
        ? values.technology_names.split(',').map((t) => t.trim()).filter(Boolean)
        : []

    const formattedPayload = {
      ...values,
      country_id: Number(values.country_id),

      // Передаем то, что изначально требовала база данных:
      author_id: 1,              // ID администратора (обычно 1 в тестовых БД)
      technology_ids: [],        // Пустой массив ID, так как привязка идет через technologies

      technologies: techArray.map((name) => ({ name })),
    }

    createMutation.mutate(formattedPayload as any)
  }

  const handleDownloadCsv = async () => {
    setIsExporting(true)
    try {
      const token = localStorage.getItem('token')
      // Используем динамический API_URL вместо захардкоженного localhost
      const response = await fetch(`${API_URL}/api/admin/export/csv`, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) throw new Error('Ошибка при выгрузке CSV')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'cases_export.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Ошибка экспорта:', error)
      alert('Не удалось скачать CSV реестр.')
    } finally {
      setIsExporting(false)
    }
  }

  // 5. Меняем тип аргумента на новый CaseStatus
  const handleStatusChange = (caseId: number, newStatus: CaseStatus) => {
    updateStatusMutation.mutate({ id: caseId, status: newStatus })
  }

  if (!isAuthenticated) return null

  return (
      <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted">
              администрирование
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Админ-панель</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Интерфейс редактора для добавления карточек напрямую в базу данных PostgreSQL через эндпоинты FastAPI.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">
              Текущая роль: <span className="font-mono font-semibold text-accent-deep">{roleLabel}</span>
              {username && <span className="ml-2 opacity-60">({username})</span>}
            </div>
            <button
                onClick={handleDownloadCsv}
                disabled={isExporting}
                type="button"
                className="rounded-lg border border-accent bg-transparent px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-50"
            >
              {isExporting ? 'Формирование...' : 'Скачать CSV реестр'}
            </button>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-ink">Новая карточка кейса</h2>
              <div className="flex items-center gap-2">
                <SourceBadge level={watchedLevel} />
                {watchedVendor && (
                    <span className="rounded-full border border-bad/40 px-2 py-0.5 text-xs font-medium text-bad">
                  vendor case study
                </span>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <TextInput label="Название" error={errors.title?.message} {...register('title')} />
              <TextInput label="Компания" error={errors.company?.message} {...register('company')} />

              <label className="block text-xs font-medium text-muted">
                Страна внедрения
                <select
                    {...register('country_id')}
                    className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option value="">Выберите из справочника...</option>
                  {countries.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                  ))}
                </select>
                {errors.country_id && (
                    <span className="mt-1 block text-xs text-bad">{errors.country_id.message}</span>
                )}
              </label>

              <TextInput label="Отрасль" error={errors.industry?.message} {...register('industry')} />
              <TextInput label="Тип объекта" error={errors.facility_type?.message} {...register('facility_type')} />
              <TextInput label="Бизнес-проблема" error={errors.business_problem?.message} {...register('business_problem')} />
              <TextInput
                  label="Технологии (через запятую)"
                  error={errors.technology_names?.message}
                  placeholder="WMS, RFID, Предиктивная аналитика"
                  {...register('technology_names')}
              />
              <TextInput label="IT-системы" error={errors.it_systems?.message} placeholder="1C:ERP, MES" {...register('it_systems')} />

              <label className="block text-xs font-medium text-muted">
                Уровень достоверности
                <select
                    {...register('trust_level')}
                    className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none"
                >
                  {levelOptions.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-medium text-muted">
                Статус публикации
                <select
                    {...register('status')}
                    className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none"
                >
                  {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                  ))}
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
              <Textarea
                  label="Этапы внедрения (каждый шаг с новой строки)"
                  error={errors.implementation_stages?.message}
                  placeholder="1. Аудит инфраструктуры&#10;2. Развертывание ПО&#10;3. Обучение персонала"
                  {...register('implementation_stages')}
              />
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
              <button
                  type="button"
                  onClick={() => reset(defaultValues)}
                  className="rounded-lg border border-line bg-paper px-5 py-2.5 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent-deep"
              >
                Очистить
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-xl border border-line bg-surface p-5">
              <h2 className="font-display text-lg font-semibold text-ink">Управление статусами</h2>
              {/* 6. Вывод кнопок переключения табов с русскими названиями */}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {statusOptions.map((status) => (
                    <button
                        key={status}
                        type="button"
                        onClick={() => setSelectedStatus(status)}
                        className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                            selectedStatus === status
                                ? 'border-accent bg-mint text-accent-deep'
                                : 'border-line bg-paper text-muted'
                        }`}
                    >
                      {statusLabels[status]}
                    </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5">
              <h2 className="font-display text-lg font-semibold text-ink">
                Кейсы в статусе: <span className="text-accent">{statusLabels[selectedStatus]}</span>
              </h2>
              <div className="mt-3 space-y-3 max-h-[680px] overflow-y-auto pr-1">
                {isCasesLoading ? (
                    <div className="text-sm text-muted text-center py-4">Обновление списка...</div>
                ) : (
                    visibleCases.map((item: CaseStudy) => (
                        <div
                            key={item.id}
                            className={`rounded-lg border border-line bg-paper p-3 transition ${
                                updateStatusMutation.isPending &&
                                updateStatusMutation.variables?.id === item.id
                                    ? 'opacity-50 pointer-events-none'
                                    : ''
                            }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-medium text-ink text-sm line-clamp-2">{item.title}</div>
                              <div className="mt-1 text-xs text-muted">
                                {item.company} · {countryMap.get(item.country_id) || `ID: ${item.country_id}`}
                              </div>
                            </div>
                            <SourceBadge level={item.trust_level as any} />
                          </div>

                          <div className="mt-3 pt-3 border-t border-line">
                            <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1.5">
                              Переместить в:
                            </div>
                            {/* 7. Все 5 кнопок быстрого перевода карточки в нужный статус */}
                            <div className="flex flex-wrap gap-1.5">
                              {statusOptions.map((opt) => (
                                  <button
                                      key={opt}
                                      type="button"
                                      disabled={item.status === opt}
                                      onClick={() => handleStatusChange(item.id, opt)}
                                      className={`rounded px-2 py-1 text-[10px] font-semibold tracking-wide transition ${
                                          item.status === opt
                                              ? 'bg-line text-muted cursor-not-allowed opacity-60'
                                              : 'bg-surface border border-line text-ink hover:border-accent hover:text-accent-deep'
                                      }`}
                                  >
                                    {statusLabels[opt]}
                                  </button>
                              ))}
                            </div>
                          </div>
                        </div>
                    ))
                )}
                {!isCasesLoading && visibleCases.length === 0 && (
                    <div className="text-sm text-muted text-center py-6">Нет кейсов в этом статусе.</div>
                )}
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

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(({ label, error, ...props }, ref) => {
  return (
      <label className="block text-xs font-medium text-muted">
        {label}
        <input
            ref={ref}
            {...props}
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        {error && <span className="mt-1 block text-xs text-bad">{error}</span>}
      </label>
  )
})
TextInput.displayName = 'TextInput'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, ...props }, ref) => {
  return (
      <label className="block text-xs font-medium text-muted md:col-span-2">
        {label}
        <textarea
            ref={ref}
            {...props}
            className="mt-1 min-h-24 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        {error && <span className="mt-1 block text-xs text-bad">{error}</span>}
      </label>
  )
})
Textarea.displayName = 'Textarea'

export default AdminPage