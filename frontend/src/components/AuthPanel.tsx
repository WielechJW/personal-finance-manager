import { useState } from 'react'
import type { FormEvent } from 'react'
import { login, register, type AuthResponse } from '../api/auth'

type AuthMode = 'login' | 'register'

type Props = {
  onAuthenticated: (response: AuthResponse) => void
}

export function AuthPanel({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = mode === 'login'
        ? await login({ email: email.trim(), password })
        : await register({ email: email.trim(), full_name: fullName.trim(), password })
      onAuthenticated(response)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Wystąpił nieoczekiwany błąd.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.28),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.22),transparent_40%)]" />
        <a className="relative flex items-center gap-3 text-xl font-bold" href="/" aria-label="Finanse — strona główna">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-slate-950">F</span>
          Finanse
        </a>
        <div className="relative max-w-xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">Finanse pod kontrolą</p>
          <h1 className="text-5xl font-bold leading-tight tracking-tight">Spokojna głowa zaczyna się od jasnego budżetu.</h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-300">Wszystkie przychody i wydatki w jednym miejscu, dostępne tylko po zalogowaniu.</p>
        </div>
        <p className="relative text-sm text-slate-500">Prywatny panel finansowy</p>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <a className="mb-10 flex items-center gap-3 text-lg font-bold text-slate-900 lg:hidden" href="/">
            <span className="grid size-9 place-items-center rounded-lg bg-slate-900 text-white">F</span>
            Finanse
          </a>
          <p className="text-sm font-semibold text-emerald-700">{mode === 'login' ? 'Witaj ponownie' : 'Zacznij już dziś'}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {mode === 'login' ? 'Zaloguj się do konta' : 'Utwórz swoje konto'}
          </h1>
          <p className="mt-3 text-slate-600">
            {mode === 'login' ? 'Wprowadź dane, aby przejść do swojego budżetu.' : 'Założenie konta zajmie mniej niż minutę.'}
          </p>

          <div className="mt-8 grid grid-cols-2 rounded-xl bg-slate-200/70 p-1" role="tablist" aria-label="Dostęp do konta">
            <button className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'}`} type="button" onClick={() => changeMode('login')}>Logowanie</button>
            <button className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${mode === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'}`} type="button" onClick={() => changeMode('register')}>Rejestracja</button>
          </div>

          <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="full-name">
                Imię i nazwisko
                <input className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" id="full-name" minLength={2} maxLength={80} onChange={(event) => setFullName(event.target.value)} placeholder="Jan Kowalski" required value={fullName} autoComplete="name" />
              </label>
            )}
            <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="email">
              Adres e-mail
              <input className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" id="email" onChange={(event) => setEmail(event.target.value)} placeholder="jan@example.com" required type="email" value={email} autoComplete="email" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="password">
              Hasło
              <span className="relative">
                <input className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" id="password" minLength={mode === 'register' ? 8 : 1} onChange={(event) => setPassword(event.target.value)} placeholder={mode === 'register' ? 'Minimum 8 znaków' : 'Twoje hasło'} required type={isPasswordVisible ? 'text' : 'password'} value={password} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                <button
                  aria-label={isPasswordVisible ? 'Ukryj hasło' : 'Pokaż hasło'}
                  aria-pressed={isPasswordVisible}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
                  type="button"
                >
                  {isPasswordVisible ? 'Ukryj' : 'Pokaż'}
                </button>
              </span>
            </label>

            {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}

            <button className="mt-1 rounded-xl bg-slate-950 px-4 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Proszę czekać…' : mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-600">
            {mode === 'login' ? 'Nie masz jeszcze konta?' : 'Masz już konto?'}{' '}
            <button className="font-semibold text-emerald-700 hover:text-emerald-800" type="button" onClick={() => changeMode(mode === 'login' ? 'register' : 'login')}>
              {mode === 'login' ? 'Zarejestruj się' : 'Zaloguj się'}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}
