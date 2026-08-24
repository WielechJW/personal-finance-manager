import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  createTransaction,
  getSummary,
  getTransactions,
  type FinancialSummary,
  type Transaction,
  type TransactionType,
} from './api/transactions'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
  }).format(amount)

function App() {
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<FinancialSummary>({ income: '0', expenses: '0', balance: '0' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const periodLabel = useMemo(
    () => new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(new Date()),
    [],
  )

  const loadDashboard = async () => {
    setIsLoading(true)
    try {
      const [loadedTransactions, loadedSummary] = await Promise.all([getTransactions(), getSummary()])
      setTransactions(loadedTransactions)
      setSummary(loadedSummary)
      setError(null)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Wystąpił nieoczekiwany błąd.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboard()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsedAmount = Number(amount.replace(',', '.'))

    if (!description.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return

    setIsSaving(true)
    try {
      await createTransaction({
        type,
        amount: parsedAmount.toFixed(2),
        description: description.trim(),
        transaction_date: new Date().toISOString().slice(0, 10),
        currency: 'PLN',
      })
      setAmount('')
      setDescription('')
      await loadDashboard()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Nie udało się zapisać transakcji.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <header className="mb-12 flex items-center justify-between">
        <a className="flex items-center gap-2 text-lg font-bold tracking-tight" href="/" aria-label="Finanse — strona główna">
          <span className="grid size-8 place-items-center rounded-lg bg-slate-900 text-sm text-white">F</span>
          <span>Finanse</span>
        </a>
        <span className="text-sm font-medium capitalize text-slate-500">{periodLabel}</span>
      </header>

      <section className="mb-8 max-w-xl" aria-labelledby="page-title">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Twój budżet</p>
        <h1 id="page-title" className="text-3xl font-bold tracking-tight sm:text-4xl">Dodaj nową transakcję</h1>
        <p className="mt-3 text-slate-600">Dodawaj przychody i wydatki. Wpisy są bezpiecznie zapisywane w bazie danych.</p>
      </section>

      <section className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
        <form className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Nowy wpis</p>
              <h2 className="text-xl font-bold">Transakcja</h2>
            </div>
            <div className="flex w-fit rounded-lg bg-slate-100 p-1" role="group" aria-label="Typ transakcji">
              <button
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${type === 'expense' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500'}`}
                type="button"
                onClick={() => setType('expense')}
              >
                Wydatek
              </button>
              <button
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${type === 'income' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
                type="button"
                onClick={() => setType('income')}
              >
                Przychód
              </button>
            </div>
          </div>

          <label className="mb-5 grid gap-2 text-sm font-medium text-slate-700" htmlFor="amount">
            Kwota
            <span className="relative">
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-3 pr-14 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                id="amount"
                inputMode="decimal"
                min="0.01"
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0,00"
                required
                step="0.01"
                type="number"
                value={amount}
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-slate-500">PLN</span>
            </span>
          </label>

          <label className="mb-6 grid gap-2 text-sm font-medium text-slate-700" htmlFor="description">
            Opis
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              id="description"
              maxLength={80}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={type === 'expense' ? 'np. Zakupy spożywcze' : 'np. Wynagrodzenie'}
              required
              type="text"
              value={description}
            />
          </label>

          <button className="w-full rounded-lg bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSaving} type="submit">
            {isSaving ? 'Zapisywanie…' : `Dodaj ${type === 'expense' ? 'wydatek' : 'przychód'}`}
          </button>
          {error && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
        </form>

        <aside className="rounded-xl bg-slate-900 p-6 text-white shadow-sm" aria-label="Podsumowanie bieżącego miesiąca">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Podsumowanie</p>
          <p className="mt-7 text-sm text-slate-300">Aktualne saldo</p>
          <p className="mb-8 text-3xl font-bold tracking-tight">{formatCurrency(Number(summary.balance))}</p>
          <dl className="grid gap-4">
            <div className="flex justify-between gap-4 border-t border-white/15 pt-4">
              <dt>Przychody</dt>
              <dd className="font-semibold text-emerald-400">+ {formatCurrency(Number(summary.income))}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-white/15 pt-4">
              <dt>Wydatki</dt>
              <dd className="font-semibold text-rose-400">− {formatCurrency(Number(summary.expenses))}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" aria-labelledby="history-title">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Historia</p>
            <h2 id="history-title" className="text-xl font-bold">Ostatnie transakcje</h2>
          </div>
          <span className="text-sm font-medium text-slate-500">{transactions.length} wpisów</span>
        </div>

        {isLoading ? (
          <div className="grid min-h-36 place-items-center p-5 text-sm text-slate-500">Wczytywanie transakcji…</div>
        ) : transactions.length === 0 ? (
          <div className="grid min-h-36 place-items-center p-5 text-center">
            <span className="grid size-9 place-items-center rounded-full bg-slate-100 text-xl text-slate-600" aria-hidden="true">+</span>
            <p className="text-sm text-slate-500">Dodaj pierwszy przychód lub wydatek, aby zobaczyć historię.</p>
          </div>
        ) : (
          <ul>
            {transactions.map((transaction) => (
              <li className="flex items-center gap-3 border-b border-slate-100 px-6 py-4 last:border-0" key={transaction.id}>
                <span className={`grid size-9 place-items-center rounded-full font-bold ${transaction.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`} aria-hidden="true">
                  {transaction.type === 'income' ? '↓' : '↑'}
                </span>
                <div className="grid gap-0.5">
                  <strong className="text-sm text-slate-800">{transaction.description}</strong>
                  <small className="text-xs text-slate-500">{new Intl.DateTimeFormat('pl-PL', { dateStyle: 'long' }).format(new Date(`${transaction.transaction_date}T00:00:00`))}</small>
                </div>
                <span className={`ml-auto text-sm font-semibold whitespace-nowrap ${transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {transaction.type === 'income' ? '+' : '−'} {formatCurrency(Number(transaction.amount))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
