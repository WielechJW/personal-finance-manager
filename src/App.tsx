import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type TransactionType = 'income' | 'expense'

type Transaction = {
  id: number
  type: TransactionType
  amount: number
  description: string
  date: string
}

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

  const summary = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0)
    const expenses = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0)

    return { income, expenses, balance: income - expenses }
  }, [transactions])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsedAmount = Number(amount.replace(',', '.'))

    if (!description.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return
    }

    setTransactions((currentTransactions) => [
      {
        id: Date.now(),
        type,
        amount: parsedAmount,
        description: description.trim(),
        date: new Intl.DateTimeFormat('pl-PL', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).format(new Date()),
      },
      ...currentTransactions,
    ])
    setAmount('')
    setDescription('')
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Finanse — strona główna">
          <span className="brand-mark">F</span>
          <span>Finanse</span>
        </a>
        <span className="period">Sierpień 2026</span>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">Twój budżet</p>
        <h1 id="page-title">Dodaj nową transakcję</h1>
        <p>Na początek wpisz przychód lub wydatek. Dane zostają w aplikacji podczas tej sesji.</p>
      </section>

      <section className="workspace">
        <form className="transaction-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <div>
              <p className="eyebrow">Nowy wpis</p>
              <h2>Transakcja</h2>
            </div>
            <div className="type-switch" role="group" aria-label="Typ transakcji">
              <button
                className={type === 'expense' ? 'active expense' : ''}
                type="button"
                onClick={() => setType('expense')}
              >
                Wydatek
              </button>
              <button
                className={type === 'income' ? 'active income' : ''}
                type="button"
                onClick={() => setType('income')}
              >
                Przychód
              </button>
            </div>
          </div>

          <label htmlFor="amount">
            Kwota
            <span className="input-wrap">
              <input
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
              <span>PLN</span>
            </span>
          </label>

          <label htmlFor="description">
            Opis
            <input
              id="description"
              maxLength={80}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={type === 'expense' ? 'np. Zakupy spożywcze' : 'np. Wynagrodzenie'}
              required
              type="text"
              value={description}
            />
          </label>

          <button className="submit-button" type="submit">
            Dodaj {type === 'expense' ? 'wydatek' : 'przychód'}
          </button>
        </form>

        <aside className="summary-card" aria-label="Podsumowanie bieżącego miesiąca">
          <p className="eyebrow">Podsumowanie</p>
          <p className="summary-label">Aktualne saldo</p>
          <p className="balance">{formatCurrency(summary.balance)}</p>
          <dl>
            <div>
              <dt>Przychody</dt>
              <dd className="income-value">+ {formatCurrency(summary.income)}</dd>
            </div>
            <div>
              <dt>Wydatki</dt>
              <dd className="expense-value">− {formatCurrency(summary.expenses)}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="history" aria-labelledby="history-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Historia</p>
            <h2 id="history-title">Ostatnie transakcje</h2>
          </div>
          <span>{transactions.length} wpisów</span>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <span aria-hidden="true">+</span>
            <p>Dodaj pierwszy przychód lub wydatek, aby zobaczyć historię.</p>
          </div>
        ) : (
          <ul className="transaction-list">
            {transactions.map((transaction) => (
              <li key={transaction.id}>
                <span className={`transaction-icon ${transaction.type}`} aria-hidden="true">
                  {transaction.type === 'income' ? '↓' : '↑'}
                </span>
                <div>
                  <strong>{transaction.description}</strong>
                  <small>{transaction.date}</small>
                </div>
                <span className={transaction.type === 'income' ? 'income-value' : 'expense-value'}>
                  {transaction.type === 'income' ? '+' : '−'} {formatCurrency(transaction.amount)}
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
