# Пошаговый план реализации task manager

> Актуальный контекст: backend переписан на TypeScript + Express + Socket.IO, Prisma подключена, схема БД согласована, базовые роли засеяны, Redis временно отключён.

## Что уже готово
- [x] Backend: TypeScript, модульная структура (`src/app.ts`, `src/server.ts`, `src/config`, `src/controllers`, `src/models`, `src/routes`, `src/sockets`).
- [x] Socket.IO: типизированные events, middleware JWT auth с fallback anonymous.
- [x] Prisma: `prisma/schema.prisma` с 36+ моделями, `DATABASE_URL`, singleton `PrismaClient`.
- [x] Миграция `init` применена, базовые роли засеяны.
- [x] `src/models/user.ts` переписан на Prisma, `src/config/db.ts` заменён на Prisma.
- [x] Frontend: Vite + React + TypeScript + Chakra UI, `useSocket`, `ChatBox`.
- [x] `.env` настроен (DB, JWT, CORS).
- [x] Redis удалён из зависимостей.

## Этапы реализации

### Этап 1. MVP: регистрация, вход и портал
Цель: любой пользователь может зарегистрироваться, войти и создать/присоединиться к порталу.

Backend:
- [x] `POST /api/auth/register` — создать `User` + `Wallet`.
- [x] `POST /api/auth/login` — выдать JWT.
- [ ] `POST /api/auth/refresh` — refresh access token.
- [x] `GET /api/auth/me` — текущий пользователь.
- [x] `POST /api/portals` — создать портал (owner = текущий пользователь).
- [x] `GET /api/portals` — список порталов пользователя.
- [x] Middleware `requireAuth` для HTTP routes.
- [x] Создать `src/services/authService.ts`.
- [x] Создать `src/services/portalService.ts`.
- [x] Засеять роли после миграции (`prisma/seed.ts`).

Frontend:
- [x] Страницы `/login` и `/register`.
- [x] Сохранение JWT в `localStorage`.
- [x] Zustand auth store (`useAuthStore`).
- [x] Страница `/portals` — создание и выбор портала.
- [x] Страница `/portals/:id` — просмотр портала.
- [x] Защищённые роуты (React Router).

Критерий приёмки: пользователь регистрируется, входит, создаёт портал, видит его в списке.

---

### Этап 2. Проекты, организации и участники
Цель: внутри портала создаются проекты, организации (клиенты), отделы (работники), назначаются роли.

Backend:
- [x] CRUD `POST /api/organizations` — создание клиентской организации.
- [x] CRUD `POST /api/projects` — создание проекта с привязкой к организации.
- [x] `POST /api/projects/:id/members` — добавить участника в проект (`UserProject`).
- [x] `POST /api/organizations/:id/members` — добавить участника в организацию.
- [x] `POST /api/departments` — создание отдела работников.
- [x] `POST /api/departments/:id/members` — добавить работника в отдел.
- [x] Сервисы: `organizationService`, `projectService`.
- [x] Сервисы: `departmentService`, `memberService`.
- [x] Проверка прав через `UserRole` / `UserProject` / `UserOrganization`.

Frontend:
- [x] Страница портала: список проектов и организаций.
- [x] Модальное окно создания проекта/организации.
- [x] Страница проекта: участники, настройки, приглашение.
- [x] Страница организации: участники и контакты.

Критерий приёмки: клиент создаёт организацию, работник создаёт отдел, менеджер создаёт проект и связывает его с организацией.

---

### Этап 3. Задачи, комментарии и теги
Цель: внутри проекта создаются задачи, назначаются исполнители, добавляются комментарии и теги.

Backend:
- [x] CRUD `POST /api/projects/:id/tasks`.
- [x] `PATCH /api/tasks/:id/status` — изменение статуса.
- [x] `PATCH /api/tasks/:id/assignee` — назначение исполнителя.
- [x] `POST /api/tasks/:id/comments` — комментарии.
- [x] `POST /api/tasks/:id/tags` — прикрепить тег.
- [x] `POST /api/portals/tags` — создание тега в портале.
- [x] Сервисы: `taskService`, `commentService`, `tagService`.
- [x] При изменении задачи писать в `AuditLog`.
- [x] События Socket.IO: `task:created`, `task:updated`, `comment:created`.

Frontend:
- [x] Board/Kanban доска задач проекта (Chakra UI).
- [x] Карточка задачи: заголовок, описание, статус, приоритет, исполнитель, теги.
- [x] Модальное окно задачи с комментариями.
- [ ] Drag-and-drop статусов (опционально, можно select).

Критерий приёмки: пользователь создаёт задачу, назначает исполнителя, добавляет комментарий и тег.

---

### Этап 4. Чат и уведомления
Цель: real-time коммуникация внутри проекта и уведомления о событиях.

Backend:
- [x] `Room` для проекта создаётся автоматически при создании проекта.
- [x] `POST /api/rooms/:id/messages` — отправить сообщение.
- [x] `GET /api/rooms/:id/messages` — история сообщений.
- [x] Socket.IO handlers: `chat:join`, `chat:send`, `chat:leave`.
- [x] `Notification` при событиях: назначение задачи, комментарий, упоминание, смена статуса.
- [x] `GET /api/notifications` — список уведомлений пользователя.
- [x] `PATCH /api/notifications/:id/read` — отметить прочитанным.

Frontend:
- [x] Компонент чата проекта (переделать `ChatBox` под конкретный `roomId`).
- [x] Панель уведомлений (badge + dropdown).
- [x] Socket.IO для real-time уведомлений и сообщений.

Критерий приёмки: сообщения приходят в реальном времени, уведомления отображаются при изменении задачи.

---

### Этап 5. Услуги, WorkLogs и биллинг
Цель: работники трекают время по услугам, списываются средства с проектного кошелька, ведётся статистика.

Backend:
- [x] CRUD `POST /api/portals/services` — услуги портала.
- [x] `POST /api/projects/:id/services` — подключить услугу к проекту с кастомной ценой.
- [x] `POST /api/worklogs` — создать запись о работе (userId, projectId, taskId, serviceId, time, date).
- [x] При создании `WorkLog` автоматически:
  - создать `TransactionProject` (expense) с расчётом суммы;
  - уменьшить баланс `WalletProject`;
  - обновить `MonthlyStatistics` и `TaskStatistics`.
- [x] `GET /api/projects/:id/wallet` — баланс проекта.
- [x] `GET /api/projects/:id/statistics` — статистика проекта.
- [x] `GET /api/tasks/:id/statistics` — статистика задачи.
- [x] Сервисы: `serviceService`, `workLogService`, `billingService`, `statisticsService`.

Frontend:
- [x] Модальное окно трекинга времени в задаче.
- [x] Отображение суммы списания в задаче.
- [x] Страница биллинга проекта: баланс, история транзакций, статистика по месяцам.
- [ ] Страница статистики работника (свои часы/сумма).

Критерий приёмки: трек 30 минут по услуге 4000 ₽/час → списание 2000 ₽, баланс и статистика обновляются.

---

### Этап 6. Приглашения, AuditLog и админка
Цель: контроль доступа и аудит изменений.

Backend:
- [x] `POST /api/invites` — создать приглашение по email.
- [x] `POST /api/invites/:token/accept` — принять приглашение.
- [x] `GET /api/audit-log` — история изменений (с фильтрами по entityType, entityId, userId).
- [x] `GET /api/roles` — список ролей.
- [x] `POST /api/users/:id/roles` — назначить роль в контексте.
- [x] Сервисы: `inviteService`, `auditLogService`, `roleService`.

Frontend:
- [x] Страница настроек портала/проекта/организации.
- [x] Управление ролями участников.
- [x] Таблица AuditLog для администраторов.
- [x] Приглашение по email из интерфейса.

Критерий приёмки: админ приглашает пользователя, назначает роль, видит историю изменений.

---

### Этап 7. Файлы, подписки и полировка
Цель: прикрепление файлов, управление уведомлениями, финальные улучшения.

Backend:
- [x] Загрузка файлов: `POST /api/attachments/upload` (multer).
- [x] `GET /api/attachments?taskId=` и `GET /api/attachments?commentId=`.
- [x] `POST /api/subscriptions` — подписаться на задачу/проект/комнату.
- [x] `DELETE /api/subscriptions` — отписаться.
- [ ] Email-уведомления через SMTP (позже).
- [x] Сервисы: `attachmentService`, `subscriptionService`.

Frontend:
- [x] Загрузка файлов в задаче (кнопка загрузки).
- [x] Отображение списка файлов с ссылкой на скачивание.
- [x] Настройки уведомлений: подписка/отписка.

Критерий приёмки: файл прикреплён к задаче, пользователь подписан на уведомления по проекту.

---

### Этап 8. Инфраструктура и масштабирование
- [x] Подключить Redis для pub/sub Socket.IO в multi-instance режиме.
- [x] Добавить Redis-сервис в `docker-compose.yml`.
- [x] Настроить `zod` для валидации всех endpoints.
- [x] Добавить rate limiting (`express-rate-limit`).
- [x] Настроить тесты: unit для validators (vitest).
- [x] Добавить CI/CD (GitHub Actions).
- [x] Докеризация backend/frontend.

---

## Текущие следующие шаги (приоритет)
1. Реализовать `authService` и endpoints `/api/auth/*`.
2. Добавить `requireAuth` middleware.
3. Создать frontend страницы login/register и `AuthProvider`.
4. Реализовать `portalService` и `/api/portals/*`.

## Архитектурные заметки

### Backend
- Все запросы к БД идут через `PrismaClient` из `src/config/db.ts`.
- Бизнес-логика живёт в `src/services/*`, не в controllers.
- Controllers отвечают только за req/res и валидацию.
- Socket handlers используют те же сервисы, что и HTTP controllers.
- Права доступа проверяются через `UserRole` + `UserProject` + `UserOrganization` + `UserDepartment`.
- Роли контекстуальные: у пользователя нет фиксированного типа `client`/`worker`. При создании портала owner получает `portal_admin` в `UserRoles`.
- Статистика обновляется при создании/изменении `WorkLog`, а не пересчитывается на хиту.

### Frontend (FSD)
- `src/app` — инициализация, провайдеры, роутинг, `main.tsx`.
- `src/pages` — страницы приложения.
- `src/widgets` — крупные самостоятельные блоки (Kanban, Chat виджет).
- `src/features` — пользовательские сценарии (auth, create-task, invite).
- `src/entities` — бизнес-сущности (user, project, task).
- `src/shared` — API, UI-kit, хуки, типы, конфиг.
- Path aliases: `@/app`, `@/pages`, `@/widgets`, `@/features`, `@/entities`, `@/shared`.
- State: Zustand. Server state: TanStack Query. Forms: React Hook Form + Zod.