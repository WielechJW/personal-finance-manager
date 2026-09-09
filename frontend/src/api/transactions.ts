import { getAuthToken } from './auth'

export type TransactionType = 'income' | 'expense' | 'transfer'

export type Transaction = {
  id: number
  account_id: number | null
  category_id: number | null
  type: TransactionType
  amount: string
  currency: string
  description: string
  transaction_date: string
  created_at: string
}

export type Account = {
  id: number
  name: string
  kind: 'bank' | 'cash' | 'savings' | 'card'
  currency: string
}

export type Category = {
  id: number
  name: string
  type: 'income' | 'expense'
}

export type FinancialSummary = {
  income: string
  expenses: string
  balance: string
}

type NewTransaction = {
  account_id: number
  category_id: number
  type: TransactionType
  amount: string
  description: string
  transaction_date: string
  currency: string
}

const apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.detail ?? 'Nie udało się połączyć z serwerem.')
  }

  return response.json() as Promise<T>
}

export const getTransactions = () => request<Transaction[]>('/transactions')
export const getSummary = () => request<FinancialSummary>('/dashboard/summary')
export const getAccounts = () => request<Account[]>('/accounts')
export const getCategories = () => request<Category[]>('/categories')
export const createTransaction = (transaction: NewTransaction) =>
  request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(transaction) })
