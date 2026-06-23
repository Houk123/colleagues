# Colleagues — Резюме проделанной работы

## Описание проекта

Платформа для управления порталами, организациями, проектами и командами. Система позволяет создавать порталы, приглашать пользователей через запросы на вступление, управлять ролями, организациями и проектами с гибкой системой доступа.

## Архитектура

- **Backend:** Node.js + Express + Prisma ORM (PostgreSQL)
- **Frontend:** React + Chakra UI + React Query + React Router
- **Порт:** 4000 (backend), 5173 (frontend dev server)

## Реализованные функции

### 1. Регистрация и аутентификация
- Единая регистрация пользователей без фиксированного типа
- JWT-аутентификация
- Роли назначаются контекстно через порталы

### 2. Порталы
- Создание порталов с уникальными slug
- Поиск порталов по slug/названию
- Владелец портала = `portal_admin`
- Slug-based URL для SEO и читаемости

### 3. Запросы на вступление (Join Requests)
- Пользователь отправляет запрос на вступление в портал
- Статусы: `pending`, `accepted`, `rejected`, `cancelled`
- Возможность отменить pending-запрос
- Возможность повторно отправить запрос после reject/accept
- Администратор портала видит все запросы и может:
  - Принять с назначением роли
  - Отклонить
  - Автоматически создать организацию для клиента
  - Указать название организации при авто-создании
  - Назначить отдел (для рабочих ролей)

### 4. Роли
- Роли с понятными названиями в UI:
  - `portal_admin` → "Администратор портала"
  - `owner` → "Владелец клиентской организации"
  - `client_manager` → "Менеджер клиента" (только свои проекты)
  - `project_manager` → "Менеджер проектов" (исполнитель)
  - `executor` → "Исполнитель"
- API для получения ролей и доступных ролей для назначения

### 5. Управление пользователями
- **Создание пользователей админами/менеджерами:** могут создавать работников, менеджеров и клиентов с любыми правами
- **Создание пользователей клиентами:** могут создавать только клиентов
- При создании пользователя можно сразу:
  - Назначить роль в портале
  - Привязать к организации (или создать новую)
  - Назначить отдел (для работников)
  - Закрепить за проектами с ролями

### 6. Организации
- Создание организаций внутри порталов
- Slug-based URL
- Участники организации с ролями (owner/admin/member)
- Авто-создание организации при принятии клиентского запроса
- Отображение участников на странице организации

### 7. Проекты
- Проекты создаются внутри организаций
- Slug-based URL
- Фазы проекта (ProjectPhases): `fixed_budget` или `hourly`
- Услуги проекта (ProjectServices) с кастомными ценами
- Транзакции проекта (депозиты, списания, возвраты)
- Кошелёк проекта с балансом
- **Участники проекта** с ролями
- **Добавление участников** через UI

### 8. Система доступа (Access Control)
- **Список проектов:** пользователь видит только проекты, в которых он участник (или все, если владелец портала)
- **Страница проекта:** проверка доступа — только участники и владелец портала
- **Создание пользователей:** проверка прав — кто кого может создавать
- **Список порталов:** пользователь видит порталы, где он:
  - Владелец
  - Имеет роль (UserRole)
  - Участник организации (UserOrganization)
  - Участник проекта (UserProject)

### 9. Отделы
- Создание отделов внутри порталов
- Назначение отделов работникам
- Скрытие выбора отдела для клиентских ролей в UI

### 10. Задачи (Tasks)
- Kanban-доска в ProjectPage (статусы: todo, in_progress, review, done, cancelled)
- Создание задач с заголовком, описанием, приоритетом, назначенным исполнителем
- Изменение статуса задачи через NativeSelect
- Комментарии к задачам с отображением автора и даты
- Теги задач
- Socket.IO: real-time обновления задач и комментариев по всем участникам проекта

### 11. Трекинг времени и биллинг (WorkLogs)
- WorkLogForm на React Hook Form + Zod
- Два input: **Часы** и **Минуты** с автоматическим пересчётом друг в друга
- Frontend вводит часы → backend хранит минуты → отображается в часах
- Расчёт стоимости: `resolvedRate * hours` через связанную услугу проекта
- Автоматическое списание с кошелька проекта
- Статистика по задачам и проектам

### 12. Уведомления (Notifications)
- Backend: CRUD уведомлений, отправка при событиях задач
- Frontend: NotificationBell — badge с количеством непрочитанных + dropdown-список
- Socket.IO: real-time доставка новых уведомлений
- Метки прочитано/непрочитано + "Отметить всё как прочитанное"

### 13. Приглашения (Invites)
- Создание приглашения по email (с ролью и проектом)
- Генерация токена и срок действия
- Страница AcceptInvitePage для принятия приглашения
- Привязка пользователя к порталу/проекту при принятии

### 14. Файлы (Attachments)
- Прикрепление файлов к задачам и комментариям
- Список файлов в диалоге задачи

### 15. Аудит (Audit Logs)
- Автоматическая запись изменений задач и комментариев
- Тип действия: create, update, delete
- Хранение старых и новых значений

### 16. Статистика (Statistics)
- Project stats: totalSpent, totalMinutes, totalTransactions
- Task stats: totalAmount, totalMinutes
- User stats: суммарные показатели по пользователю

### 17. Rate Limiting
- In-memory middleware: 100 запросов/минуту
- Ответ `429` при превышении лимита

## Структура проекта

```
d:\tasks\
├── prisma/
│   └── schema.prisma          # Схема БД
├── src/
│   ├── app.ts                 # Express app
│   ├── server.ts              # Точка входа
│   ├── config/db.ts           # Подключение к БД
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── portalController.ts
│   │   ├── projectController.ts
│   │   ├── userController.ts
│   │   ├── roleController.ts
│   │   ├── departmentController.ts
│   │   ├── organizationController.ts
│   │   ├── taskController.ts
│   │   ├── notificationController.ts
│   │   ├── inviteController.ts
│   │   ├── attachmentController.ts
│   │   ├── statisticsController.ts
│   │   ├── auditLogController.ts
│   │   └── workLogController.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── portalService.ts
│   │   ├── projectService.ts
│   │   ├── userManagementService.ts
│   │   ├── roleService.ts
│   │   ├── departmentService.ts
│   │   ├── organizationService.ts
│   │   ├── taskService.ts
│   │   ├── commentService.ts
│   │   ├── tagService.ts
│   │   ├── notificationService.ts
│   │   ├── inviteService.ts
│   │   ├── attachmentService.ts
│   │   ├── statisticsService.ts
│   │   ├── auditLogService.ts
│   │   └── workLogService.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── portalRoutes.ts
│   │   ├── projectRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── roleRoutes.ts
│   │   ├── departmentRoutes.ts
│   │   ├── organizationRoutes.ts
│   │   ├── taskRoutes.ts
│   │   ├── notificationRoutes.ts
│   │   ├── inviteRoutes.ts
│   │   ├── attachmentRoutes.ts
│   │   ├── statisticsRoutes.ts
│   │   ├── auditLogRoutes.ts
│   │   └── workLogRoutes.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── rateLimit.ts
│   ├── middleware/auth.ts
│   ├── lib/jwt.ts, password.ts
│   └── models/user.ts
├── tasks-frontend/
│   └── src/
│       ├── app/App.tsx        # Роутинг
│       ├── pages/
│       │   ├── PortalsPage.tsx
│       │   ├── PortalPage.tsx
│       │   ├── PortalRequestsPage.tsx
│       │   ├── JoinPortalPage.tsx
│       │   ├── OrganizationPage.tsx
│       │   ├── ProjectPage.tsx
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   └── AcceptInvitePage.tsx
│       └── features/
│           ├── portal/
│           ├── project/
│           ├── organization/
│           ├── user/
│           ├── role/
│           ├── department/
│           ├── task/
│           ├── workLog/
│           ├── notification/
│           ├── invite/
│           ├── attachment/
│           └── statistics/
└── pricing-design.md          # Дизайн ценообразования
```

## Ключевые API endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход |
| GET | `/api/portals` | Список порталов пользователя |
| POST | `/api/portals` | Создать портал |
| GET | `/api/portals/search` | Поиск порталов |
| POST | `/api/portals/:id/join` | Отправить запрос на вступление |
| GET | `/api/portals/:id/join` | Статус запроса |
| DELETE | `/api/portals/:id/join` | Отменить запрос |
| GET | `/api/portals/requests` | Все запросы (для админа) |
| POST | `/api/portals/requests/:id/accept` | Принять запрос |
| POST | `/api/portals/requests/:id/reject` | Отклонить запрос |
| GET | `/api/roles` | Список ролей |
| GET | `/api/departments` | Список отделов |
| GET | `/api/organizations` | Список организаций |
| GET | `/api/projects` | Список проектов (с фильтром доступа) |
| POST | `/api/projects` | Создать проект |
| POST | `/api/projects/:id/members` | Добавить участника |
| GET | `/api/users/portal` | Пользователи портала |
| POST | `/api/users/portal` | Создать пользователя в портале |
| GET | `/api/users/creatable-roles` | Доступные роли для назначения |
| GET/POST | `/api/tasks` | Список/создание задач |
| PATCH | `/api/tasks/:id/status` | Изменить статус задачи |
| GET/POST | `/api/tasks/:id/comments` | Комментарии к задаче |
| GET/POST | `/api/notifications` | Уведомления пользователя |
| POST | `/api/notifications/:id/read` | Отметить прочитанным |
| GET/POST | `/api/invites` | Приглашения |
| POST | `/api/invites/:token/accept` | Принять приглашение |
| GET/POST | `/api/attachments` | Файлы задач |
| GET/POST | `/api/worklogs` | Трекинг времени |
| GET | `/api/statistics/projects/:id` | Статистика проекта |
| GET | `/api/statistics/tasks/:id` | Статистика задачи |
| GET | `/api/audit-logs` | Аудит изменений |

## Дальнейшие шаги

- Role-based views в UI (скрытие/показ элементов по ролям)
- Drag-and-drop Kanban для изменения статуса задач
- Прайс-листы (клиентский и внутренний)
- График платежей по фазам (installments)
- Email-уведомления (SendGrid/Resend)
- Redis pub/sub для масштабирования Socket.IO
- Zod-валидация на всех входах API
- Unit/интеграционные тесты
- CI/CD pipeline
