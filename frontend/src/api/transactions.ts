export type TransactionType = 'income' | 'expense' | 'transfer'

export type Transaction = {
  id: number
  type: TransactionType
  amount: string
  currency: string
  description: string
  transaction_date: string
  created_at: string
}

export type FinancialSummary = {
  income: string
  expenses: string
  balance: string
}

type NewTransaction = {
  type: TransactionType
  amount: string
  description: string
  transaction_date: string
  currency: string
}

const apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.detail ?? 'Nie udało się połączyć z serwerem.')
  }

  return response.json() as Promise<T>
}

export const getTransactions = () => request<Transaction[]>('/transactions')
export const getSummary = () => request<FinancialSummary>('/dashboard/summary')
export const createTransaction = (transaction: NewTransaction) =>
  request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(transaction) })
