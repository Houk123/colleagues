# Ценообразование и биллинг

Документ описывает гибкую систему цен: разные команды стоят по-разному, клиентам можно давать скидки, а проекты могут иметь фазы (разработка с фиксированным бюджетом → поддержка по часам).

## 1. Главная идея — две независимые оси

Стоимость часа складывается из двух вопросов:

| Ось | Кто влияет | Что определяет |
|-----|-----------|----------------|
| **Кто делает работу** | Отдел (Department) | Базовую ставку услуги (гигачады дороже) |
| **Кто платит** | Проект (главное) + Организация (скидка) | Спец-цену проекта и скидку клиента |

**Решения проекта:**
- Проект **всегда** принадлежит организации (`organizationId` обязателен).
- **Цена часа задаётся на уровне проекта** — это основной рычаг (проект `Сады` = 2000 ₽/ч).
- **Скидка организации может быть временной** (ООО Ромашка: −10% на июнь и июль).
- **Все движения денег — транзакции**: каждое списание (`TransactionsProjects`) и каждое
  пополнение кошелька. Ничего не меняется "молча".

Поверх этого — **фазы проекта** (разработка / поддержка), которые меняют режим оплаты.

```
Базовая ставка услуги (Services.pricePerHour)
        │
        ▼  переопределяется, если отдел имеет свою цену
Ставка отдела (DepartmentServices.pricePerHour)   ← "кто делает"
        │
        ▼  применяется скидка/спец-цена клиента
Цена для организации (OrganizationServices)        ← "кто платит"
        │
        ▼  финальное переопределение на уровне проекта
Цена для проекта (ProjectServices)                 ← самый высокий приоритет
        │
        ▼
ИТОГОВАЯ СТАВКА для WorkLog
```

## 2. Алгоритм расчёта ставки

Когда работник логирует время (`WorkLog`), система вычисляет ставку:

```
function resolveRate(worker, service, project):
    # --- Ось 1: кто делает работу (база) ---
    department = worker.department
    base = DepartmentServices[department, service]?.pricePerHour
         ?? Services[service].pricePerHour

    # --- Ось 2: кто платит (скидка/спец-цена) ---
    # приоритет: проект > организация
    ps = ProjectServices[project, service]
    if ps?.customPricePerHour != null:
        return ps.customPricePerHour            # жёсткая цена на проекте
    if ps?.discountPercent != null:
        return base * (1 - ps.discountPercent/100)

    # скидка организации, действующая на дату работы (validFrom..validTo)
    org = project.organization
    discount = OrganizationDiscounts[org]
                 .where(validFrom <= workDate <= validTo)
                 .maxBy(discountPercent)
    if discount != null:
        return base * (1 - discount.discountPercent/100)

    return base
```

**Порядок приоритетов цены:**
1. `ProjectServices.customPricePerHour` — фикс-цена услуги в проекте (например, `Сады` = 2000 ₽/ч).
2. `ProjectServices.discountPercent` — скидка на услугу в проекте.
3. Временная скидка организации (`OrganizationDiscounts`), активная на дату работы.
4. Ставка отдела (`DepartmentServices`) или базовая цена услуги.

**Пример:**
1. Услуга `Backend development` — базовая цена `3000 ₽/ч`.
2. Отдел `Гигачады` имеет `DepartmentServices` для этой услуги — `5000 ₽/ч`.
3. Клиент `ООО Ромашка` получил временную скидку `10%` на июнь–июль (`OrganizationDiscounts`).
4. Работник-гигачад трекает 1 час на проекте Ромашки 15 июня:
   - base = 5000 (ставка отдела)
   - скидка 10% активна → **4500 ₽**
   - тот же лог 1 августа → скидка не действует → **5000 ₽**

## 3. Фазы проекта (бюджет и режим оплаты)

Проект проходит через **фазы**. У каждой свой режим оплаты. Это решает кейс
"2 000 000 на разработку, потом переход на поддержку".

### Режимы оплаты (pricingMode)
- `fixed_budget` — фиксированный бюджет на фазу (например, 2 000 000 ₽). Время работников
  списывает деньги из бюджета фазы. Когда бюджет исчерпан — алёрт.
- `hourly` — почасовая оплата, деньги списываются с кошелька проекта по факту.

### Режимы внесения денег (paymentMode)
- `full` — клиент вносит всю сумму бюджета сразу.
- `installments` — клиент платит частями (например, 200 000 ₽/месяц).

### Жизненный цикл
```
Фаза "Разработка"                     Фаза "Поддержка"
─────────────────                     ────────────────
pricingMode: fixed_budget             pricingMode: hourly
budgetTotal: 2 000 000                budgetTotal: null
paymentMode: installments             ставка: дефолтная или спец-цена
installment: 200 000 / месяц
        │                                     ▲
        └──── по завершении переключается ────┘
```

### Пример
1. Менеджер создаёт проект и фазу `Разработка`: бюджет `2 000 000 ₽`, оплата частями
   `200 000 ₽/месяц`.
2. Клиент пополняет кошелёк проекта на `200 000 ₽` каждый месяц.
3. Работники трекают время — оно списывает из бюджета `2 000 000`.
4. Когда фаза завершена — создаётся фаза `Поддержка` в режиме `hourly`,
   с дефолтной или сниженной ставкой.

## 4. Новые / изменённые таблицы

### DepartmentServices (НОВАЯ)
Ставка услуги для конкретного отдела (ось "кто делает").
- id (UUID/PK)
- departmentId -> Departments.id
- serviceId -> Services.id
- pricePerHour (decimal)
- createdAt
- updatedAt
- UNIQUE(departmentId, serviceId)

### OrganizationDiscounts (НОВАЯ)
Временная скидка организации-клиента. Действует в окне дат (например, −10% на июнь–июль).
- id (UUID/PK)
- organizationId -> Organizations.id
- serviceId -> Services.id (nullable — null = скидка на все услуги)
- discountPercent (decimal)  — 0..100
- validFrom (DATE)
- validTo (DATE)
- reason (string, nullable — "акция", "лояльность")
- createdAt
- updatedAt

### ProjectServices (ИЗМЕНЕНИЕ — добавить скидку)
- id (UUID/PK)
- projectId -> Projects.id
- serviceId -> Services.id
- enabled (boolean)
- customPricePerHour (decimal, nullable)
- discountPercent (decimal, nullable)   ← ДОБАВИТЬ
- createdAt
- updatedAt
- UNIQUE(projectId, serviceId)

### ProjectPhases (НОВАЯ)
Фазы проекта с режимом оплаты и бюджетом.
- id (UUID/PK)
- projectId -> Projects.id
- name (например, "Разработка", "Поддержка")
- type (development | support | custom)
- pricingMode (fixed_budget | hourly)
- budgetTotal (decimal, nullable)        — для fixed_budget
- spentAmount (decimal, default 0)
- paymentMode (full | installments, nullable)
- installmentAmount (decimal, nullable)
- billingPeriod (monthly | quarterly, nullable)
- currency (default RUB)
- status (draft | active | completed | cancelled)
- isCurrent (boolean)                    — активная фаза проекта
- startDate (nullable)
- endDate (nullable)
- createdAt
- updatedAt

### ProjectPayments (НОВАЯ)
График и факт платежей клиента (для installments).
- id (UUID/PK)
- phaseId -> ProjectPhases.id
- amount (decimal)
- dueDate (DATE)
- paidAt (DATETIME, nullable)
- status (pending | paid | overdue)
- transactionProjectId -> TransactionsProjects.id (nullable)
- createdAt
- updatedAt

### WorkLogs (ИЗМЕНЕНИЕ — фиксируем ставку и фазу)
- ...существующие поля...
- phaseId -> ProjectPhases.id (nullable)  ← ДОБАВИТЬ
- resolvedRate (decimal)                  ← ДОБАВИТЬ (ставка на момент лога)
- amount (decimal)                        ← ДОБАВИТЬ (resolvedRate * time/60)

## 5. Как деньги движутся (всё через транзакции)

**Главный принцип: любое движение денег = запись в `TransactionsProjects`.**
Никаких "тихих" изменений баланса. Баланс кошелька — это сумма транзакций.

```
Пополнение кошелька (клиент платит):
  → TransactionsProjects { type: deposit, amount: +X }
  → WalletsProjects.balance += X

fixed_budget фаза (бюджет фазы):
  WorkLog создан → amount = resolvedRate * minutes/60
                 → TransactionsProjects { type: charge, amount: -amount, workLogId }
                 → phase.spentAmount += amount
                 → если spentAmount > budgetTotal: НЕ блокируем, баланс в минус (красный алёрт)

hourly фаза (по факту):
  WorkLog создан → amount = resolvedRate * minutes/60
                 → TransactionsProjects { type: charge, amount: -amount, workLogId }
                 → WalletsProjects.balance -= amount

installments (оплата частями):
  ProjectPayments по графику → клиент платит
                 → TransactionsProjects { type: deposit, amount: +installment }
```

Типы транзакций (`TransactionsProjects.type`): `deposit` (пополнение),
`charge` (списание за работу), `refund` (возврат), `adjustment` (ручная корректировка).

## 5.1. Сценарии ООО Ромашка (как тест-кейсы)

ООО Ромашка имеет временную скидку **−10% на июнь и июль** (`OrganizationDiscounts`).

### Проект `Сады` — поддержка по часам
- `pricingMode: hourly`, `ProjectServices.customPricePerHour = 2000`.
- Работник трекает 2 часа в июне → `2000 * 2 * 0.9 = 3600 ₽` (скидка действует).
- `charge` транзакция на −3600, баланс кошелька уменьшается.

### Проект `Дачи` — разработка с бюджетом, потом поддержка
- Фаза 1 `Разработка`: `fixed_budget`, `budgetTotal = 600 000`,
  `paymentMode: installments`, `installmentAmount = 200 000`, 3 платежа.
- Каждый месяц: `deposit` +200 000 (3 раза) → 3 транзакции пополнения.
- Работа списывает из бюджета 600k через `charge` транзакции.
- По завершении → Фаза 2 `Поддержка`: `hourly` со скидкой **20%** на проект
  (`ProjectServices.discountPercent = 20`).

### Проект `Калькулятор Цветов` — фикс-цена, оплата сразу, затем закрытие
- Фаза `Разработка`: `fixed_budget`, `budgetTotal = 1 000 000`, `paymentMode: full`.
- Клиент платит сразу → `deposit` +1 000 000 (одна транзакция).
- Работа реализуется → `charge` транзакции списывают бюджет.
- Проект завершён → `Project.status = closed`, фаза `completed`.

## 6. Интересные механики (на будущее)
- **Тарифы отделов через множитель**: вместо явных цен — `Department.rateMultiplier`
  (гигачады = 1.5x от базовой). Проще настраивать, но менее гибко.
- **Скидочные пакеты**: "купи 1000 часов — получи 10% скидку".
- **Лимиты бюджета на услугу**: внутри фазы выделить "200 000 на дизайн".
- **Автопереход фаз**: при исчерпании бюджета разработки — авто-создание фазы поддержки.

## 6.1. Закрытие проекта
У `Projects.status` уже есть `archived`. Добавляем `closed`:
- `active` — проект в работе.
- `paused` — приостановлен.
- `archived` — в архиве, но данные доступны.
- `closed` — завершён, фазы `completed`, новые `WorkLog`/транзакции запрещены.

## 7. Решённые вопросы
- ✅ Проекты **только** внутри организаций (`organizationId` обязателен).
- ✅ Цена часа — на уровне **проекта** (`ProjectServices`), скидка организации — **временная**.
- ✅ Все финансовые действия — **транзакции** (`TransactionsProjects`).
- ✅ Фазы проекта: `fixed_budget` (full/installments) и `hourly`.
- ✅ Закрытие проекта — статус `closed`.
- ✅ Ставками отделов (`DepartmentServices`) управляют **менеджеры и `portal_admin`**
  (`portal_admin` + `portal_manager` / менеджер отдела).
- ✅ Прайс-листы — **два вида** (см. раздел 8).
- ✅ Превышение `fixed_budget` — **мягкий алёрт**: логирование не блокируется,
  но баланс уходит в минус и подсвечивается красным (см. раздел 9).

## 8. Прайс-листы (UI)

Два разных представления цен:

### 8.1. Прайс для организации (клиентский)
Что **платит клиент**. Показывается на странице организации/проекта.
- Услуги, подключённые к проектам организации, с итоговой ставкой.
- Учитывает: цену проекта (`ProjectServices`), временную скидку (`OrganizationDiscounts`).
- Колонки: услуга | базовая цена | скидка | итоговая цена | период действия скидки.

### 8.2. Общий прайс для работников (внутренний)
Что **видят работники/менеджеры**. Внутренние ставки.
- Базовые цены услуг (`Services.pricePerHour`).
- Переопределения по отделам (`DepartmentServices`) — кто сколько стоит.
- Колонки: услуга | базовая цена | отдел | ставка отдела.
- Редактируют: `portal_admin` и менеджеры.

## 9. Превышение бюджета и кошельки

- При `fixed_budget`: если `spentAmount > budgetTotal` — **не блокируем** работу,
  но баланс уходит в минус.
- **Страница "Кошельки всех проектов"**: список проектов с балансами.
  Отрицательный баланс **горит красным** и показывает минус (например, `−45 000 ₽`).
- Это сигнал менеджеру допополнить бюджет или закрыть фазу.
