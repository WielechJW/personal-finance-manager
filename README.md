# Finance App

Aplikacja webowa do prywatnego i komercyjnego zarządzania finansami: rejestrowania przychodów i wydatków, tworzenia podsumowań oraz generowania raportów Excel.

## Cel projektu

Użytkownik ma móc w prosty sposób:

- dodawać przychody, wydatki i transfery między własnymi kontami;
- przeglądać saldo, historię oraz wydatki według kategorii;
- otrzymywać podsumowania dzienne, tygodniowe, miesięczne, kwartalne i roczne;
- planować budżety i porównywać je z rzeczywistymi wydatkami;
- importować dane z CSV/Excel i eksportować raporty w formacie `.xlsx`.

> **Zasada architektoniczna:** PostgreSQL jest źródłem prawdy. Excel służy do importu, eksportu i raportowania — nie jest bazą danych aplikacji.

## Docelowy stack

| Obszar | Technologia | Zastosowanie |
| --- | --- | --- |
| Frontend | React + TypeScript + Vite | Responsywny panel użytkownika |
| Style i komponenty | Tailwind CSS + shadcn/ui | Szybkie budowanie spójnego interfejsu |
| Wykresy | Recharts | Trendy, kategorie i porównania okresów |
| Backend | Python + FastAPI | REST API, walidacja danych i dokumentacja API |
| Baza danych | PostgreSQL | Trwałe dane transakcyjne i agregacje raportowe |
| ORM | SQLAlchemy | Modele i zapytania do bazy |
| Migracje bazy | Alembic | Wersjonowanie struktury bazy danych |
| Walidacja API | Pydantic | Bezpieczne dane wejściowe i odpowiedzi API |
| Logowanie | JWT + refresh token | Sesje i ochrona endpointów |
| Excel | XlsxWriter + openpyxl | Raporty `.xlsx` oraz import arkuszy |
| Zadania w tle | Redis + Celery lub RQ | Cykliczne raporty i cięższe eksporty (etap późniejszy) |
| Środowisko | Docker Compose | Jednolity start lokalnie i wdrożenie |

Python jest świadomym wyborem: FastAPI dobrze sprawdzi się jako API, a ekosystem Pythona bardzo dobrze obsługuje analizę danych i pliki Excel.

## Model danych — pierwsza wersja

### Najważniejsze encje

- **User** — konto użytkownika.
- **Account** — np. konto bankowe, karta, gotówka, oszczędności.
- **Category** — np. jedzenie, transport, pensja; może mieć podkategorie.
- **Transaction** — pojedynczy przychód, wydatek lub transfer.
- **Budget** — limit kwotowy kategorii na wybrany okres.

### Pola transakcji

```text
id
user_id
account_id
category_id
type: income | expense | transfer
amount: Decimal
currency: ISO 4217 (np. PLN)
transaction_date
description
tags
created_at
updated_at
```

Kwoty finansowe zawsze zapisujemy jako `Decimal` / typ `NUMERIC` w PostgreSQL, nigdy jako `float`.

Transfer między własnymi kontami nie jest ani przychodem, ani wydatkiem — nie może zniekształcać raportów.

## Zakres MVP

Pierwsza działająca wersja powinna zawierać:

1. Rejestrację, logowanie i wylogowanie użytkownika.
2. Zarządzanie kontami i kategoriami.
3. Dodawanie, edycję, usuwanie oraz filtrowanie transakcji.
4. Dashboard z bieżącym saldem, przychodami, wydatkami i ostatnimi wpisami.
5. Raporty dla okresu: dzień, tydzień, miesiąc, kwartał i rok.
6. Widok wydatków według kategorii oraz podstawowe wykresy.
7. Eksport filtrowanych transakcji do CSV i Excel.

## Excel: zakres integracji

### Eksport

Raport Excel powinien zawierać osobne arkusze:

- `Podsumowanie` — saldo, przychody, wydatki, oszczędności;
- `Transakcje` — dane źródłowe z zastosowanymi filtrami;
- `Kategorie` — suma i udział każdej kategorii;
- `Budżety` — plan kontra wykonanie;
- `Wykresy` — wykresy miesięczne i kategorii.

Do tworzenia nowych raportów używamy `XlsxWriter`. Do importowania istniejących plików `.xlsx` używamy `openpyxl`.

### Import

Import należy realizować przez przygotowany szablon Excel/CSV. Przed zapisem użytkownik powinien zobaczyć podgląd, błędy walidacji i liczbę rekordów do zaimportowania.

Na początku nie implementujemy bezpośredniej, ciągłej synchronizacji z otwartym Excelem. Taka integracja wymagałaby dodatku Microsoft 365 i rozwiązywania konfliktów danych.

## Plan realizacji

### Etap 1 — fundament

- Utworzenie katalogu `backend` z FastAPI.
- Uruchomienie PostgreSQL i aplikacji przez Docker Compose.
- Konfiguracja SQLAlchemy, Alembic oraz zmiennych środowiskowych.
- Konfiguracja komunikacji React ↔ API oraz obsługi błędów.

### Etap 2 — operacje finansowe (MVP)

- Autoryzacja użytkowników.
- CRUD kont, kategorii i transakcji.
- Dashboard i listy z filtrowaniem.
- Agregacje okresowe po stronie API.
- Testy kluczowej logiki finansowej.

### Etap 3 — raporty i Excel

- Eksport CSV i `.xlsx`.
- Raport z wieloma arkuszami i wykresami.
- Import danych z przygotowanego szablonu.
- Budżety miesięczne i alert przekroczenia limitu.

### Etap 4 — rozwój komercyjny

- Wspólne budżety i role użytkowników.
- Transakcje cykliczne: czynsz, abonamenty, pensja.
- Załączniki do transakcji i rachunków.
- Zadania w tle: raporty e-mail oraz powiadomienia.
- Integracje bankowe i Microsoft 365 / Google Sheets — po analizie wymagań prawnych i bezpieczeństwa.

## Proponowana struktura katalogów

```text
finance-app/
├── frontend/                 # React + TypeScript
│   └── src/
│       ├── features/         # dashboard, transactions, budgets, reports
│       ├── components/
│       ├── api/
│       └── pages/
├── backend/
│   ├── app/
│   │   ├── api/              # endpointy FastAPI
│   │   ├── models/           # modele SQLAlchemy
│   │   ├── schemas/          # modele Pydantic
│   │   ├── services/         # logika biznesowa i Excel
│   │   ├── repositories/     # komunikacja z bazą
│   │   ├── tasks/            # zadania w tle
│   │   └── main.py
│   └── tests/
├── docker-compose.yml
└── README.md
```

## Zasady jakości i bezpieczeństwa

- Każdy użytkownik ma dostęp wyłącznie do własnych danych.
- Dane wejściowe walidujemy po stronie frontendu i backendu.
- Hasła przechowujemy wyłącznie jako bezpieczne hashe.
- Sekrety trzymamy w `.env`, nigdy w repozytorium.
- Tworzymy migracje dla każdej zmiany schematu bazy.
- Testujemy obliczenia finansowe, zwłaszcza transfery, daty i sumowanie kwot.

## Uruchamianie lokalne

Pierwsza pionowa funkcja jest gotowa: **dodanie transakcji → zapis do PostgreSQL → aktualne saldo na dashboardzie**.

```bash
cp .env.example .env
docker compose up --build
```

Przed pierwszym uruchomieniem zmień `POSTGRES_PASSWORD` w `.env` na własne hasło. Po zmianie hasła w już utworzonym środowisku developerskim trzeba odtworzyć pustą bazę poleceniem `docker compose down -v` (usuwa ono lokalne dane).

- Panel: `http://localhost:5173`
- Dokumentacja API: `http://localhost:8000/docs`
- Endpoint zdrowia: `http://localhost:8000/api/v1/health`

Przy pierwszym starcie backend automatycznie uruchamia migrację Alembic. Aby uruchomić test logiki finansowej bez Dockera:

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest
```

## Obecny fundament

- `frontend/` zawiera aplikację React/Vite i komunikuje się z API przez `/api/v1`.
- `backend/` zawiera FastAPI, SQLAlchemy, Pydantic i pierwszą migrację Alembic.
- `transactions` przechowuje kwoty jako `NUMERIC(14,2)`; transfery są pomijane w podsumowaniu.
- Konta i kategorie są osobnymi encjami API. Pierwszy start dodaje konta „Konto główne” i „Gotówka” oraz kategorie „Jedzenie”, „Transport” i „Pensja”.
- Logowanie, konta, kategorie, budżety i raporty Excel pozostają kolejnymi elementami MVP.
