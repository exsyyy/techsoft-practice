import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import SourceBadge, { type SourceLevel } from '../components/SourceBadge'
import { cases, type CaseStatus } from '../data/catalog'

const statusOptions: CaseStatus[] = ['draft', 'published', 'archived']
const levelOptions: SourceLevel[] = ['A', 'B', 'C', 'D']

const caseSchema = z.object({
  title: z.string().min(5, 'Укажите название кейса'),
  company: z.string().min(2, 'Укажите компанию'),
  country: z.string().min(2, 'Укажите страну'),
  industry: z.string().min(2, 'Укажите отрасль'),
  objectType: z.string().min(2, 'Укажите тип объекта'),
  businessProblem: z.string().min(2, 'Укажите бизнес-проблему'),
  technologies: z.string().min(2, 'Укажите технологии через запятую'),
  itSystems: z.string().min(2, 'Укажите IT-системы через запятую'),
  sourceLevel: z.enum(['A', 'B', 'C', 'D']),
  sourceType: z.string().min(2, 'Укажите тип источника'),
  sourceUrl: z.string().url('Укажите корректную ссылку'),
  publishedAt: z.string().min(1, 'Укажите дату публикации'),
  verifiedAt: z.string().min(1, 'Укажите дату проверки'),
  status: z.enum(['draft', 'published', 'archived']),
  isVendorCaseStudy: z.boolean(),
  effectValue: z.string().min(1, 'Укажите эффект или прочерк'),
  hasQuantitativeEffect: z.boolean(),
  problem: z.string().min(10, 'Опишите проблему'),
  solution: z.string().min(10, 'Опишите решение'),
  result: z.string().min(10, 'Опишите результат'),
})

type CaseForm = z.infer<typeof caseSchema>

const defaultValues: CaseForm = {
  title: '',
  company: '',
  country: '',
  industry: '',
  objectType: '',
  businessProblem: '',
  technologies: '',
  itSystems: '',
  sourceLevel: 'B',
  sourceType: '',
  sourceUrl: '',
  publishedAt: new Date().toISOString().slice(0, 10),
  verifiedAt: new Date().toISOString().slice(0, 10),
  status: 'draft',
  isVendorCaseStudy: false,
  effectValue: '',
  hasQuantitativeEffect: true,
  problem: '',
  solution: '',
  result: '',
}

function AdminPage() {
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus>('draft')
  const [savedDraftTitle, setSavedDraftTitle] = useState('')
  const visibleCases = useMemo(() => cases.filter((item) => item.status === selectedStatus), [selectedStatus])
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CaseForm>({ resolver: zodResolver(caseSchema), defaultValues })
  const watchedLevel = watch('sourceLevel')
  const watchedVendor = watch('isVendorCaseStudy')

  const onSubmit = (values: CaseForm) => {
    setSavedDraftTitle(values.title)
    reset(defaultValues)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted">администрирование</div>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Админ-панель</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Интерфейс редактора для добавления и проверки карточек. Сохранение сейчас клиентское; подключение API и ролей выполняется на следующем backend-этапе.
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
            <TextInput label="Страна" error={errors.country?.message} {...register('country')} />
            <TextInput label="Отрасль" error={errors.industry?.message} {...register('industry')} />
            <TextInput label="Тип объекта" error={errors.objectType?.message} {...register('objectType')} />
            <TextInput label="Бизнес-проблема" error={errors.businessProblem?.message} {...register('businessProblem')} />
            <TextInput label="Технологии" error={errors.technologies?.message} placeholder="WMS, RFID" {...register('technologies')} />
            <TextInput label="IT-системы" error={errors.itSystems?.message} placeholder="ERP, MES" {...register('itSystems')} />

            <label className="block text-xs font-medium text-muted">
              Уровень достоверности
              <select {...register('sourceLevel')} className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink">
                {levelOptions.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>
            <label className="block text-xs font-medium text-muted">
              Статус
              <select {...register('status')} className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink">
                {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>

            <TextInput label="Тип источника" error={errors.sourceType?.message} {...register('sourceType')} />
            <TextInput label="Ссылка на источник" error={errors.sourceUrl?.message} {...register('sourceUrl')} />
            <TextInput label="Дата публикации" type="date" error={errors.publishedAt?.message} {...register('publishedAt')} />
            <TextInput label="Дата проверки" type="date" error={errors.verifiedAt?.message} {...register('verifiedAt')} />
            <TextInput label="Эффект" error={errors.effectValue?.message} placeholder="+24%" {...register('effectValue')} />

            <div className="grid gap-3 rounded-lg border border-line bg-paper p-3 text-sm text-muted">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('hasQuantitativeEffect')} />
                Есть количественный эффект
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('isVendorCaseStudy')} />
                Vendor case study
              </label>
            </div>

            <Textarea label="Проблема" error={errors.problem?.message} {...register('problem')} />
            <Textarea label="Решение" error={errors.solution?.message} {...register('solution')} />
            <Textarea label="Результат" error={errors.result?.message} {...register('result')} />
          </div>

          {savedDraftTitle && (
            <div className="mt-4 rounded-lg border border-ok/40 bg-mint px-3 py-2 text-sm text-accent-deep">
              Черновик «{savedDraftTitle}» прошел проверку формы и готов к отправке в API.
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-deep">
              Сохранить карточку
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
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${selectedStatus === status ? 'border-accent bg-mint text-accent-deep' : 'border-line bg-paper text-muted'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="font-display text-lg font-semibold text-ink">Кейсы: {selectedStatus}</h2>
            <div className="mt-3 space-y-3">
              {visibleCases.map((item) => (
                <div key={item.id} className="rounded-lg border border-line bg-paper px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-ink">{item.title}</div>
                      <div className="mt-1 text-xs text-muted">{item.company} · {item.country}</div>
                    </div>
                    <SourceBadge level={item.sourceLevel} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                    <span className="rounded-full border border-line px-2 py-0.5">{item.verificationStatus}</span>
                    {item.isVendorCaseStudy && <span className="rounded-full border border-bad/40 px-2 py-0.5 text-bad">vendor</span>}
                  </div>
                </div>
              ))}
              {visibleCases.length === 0 && <div className="text-sm text-muted">Нет кейсов в этом статусе.</div>}
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

function TextInput({ label, error, ...props }: TextInputProps) {
  return (
    <label className="block text-xs font-medium text-muted">
      {label}
      <input {...props} className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink" />
      {error && <span className="mt-1 block text-xs text-bad">{error}</span>}
    </label>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

function Textarea({ label, error, ...props }: TextareaProps) {
  return (
    <label className="block text-xs font-medium text-muted md:col-span-2">
      {label}
      <textarea {...props} className="mt-1 min-h-24 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink" />
      {error && <span className="mt-1 block text-xs text-bad">{error}</span>}
    </label>
  )
}

export default AdminPage
