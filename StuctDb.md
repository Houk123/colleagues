Пару слов о продукте:
Хочу сделать Таск менеджер (HelpDesk), где акцент будет на общение между разработчиками и клиентами. Хочу акцентировать свою площадку на 4 манифестах agile.

Сущности:
1. Portals
2. Organizations
3. UserOrganizations
4. Projects
5. Users
6. Roles
7. UserRoles
8. UserProjects
9. Departments
10. UserDepartments
11. ClientProfiles
12. WorkerProfiles
13. Tasks
14. UserTasks
15. Comments
16. Notifications
17. Rooms
18. UserRooms
19. ChatMessages
20. Categories
21. Critical
22. Wallets
23. Transactions
24. WalletsProjects
25. TransactionsProjects
26. Services
27. ProjectServices
28. WorkLogs
29. MonthlyStatistics
30. TaskStatistics
31. Attachments
32. Invites
33. AuditLog
34. Tags
35. TaskTags
36. Subscriptions

---

## Portals
Рабочее пространство (tenant). Все проекты и пользователи живут внутри портала.
- id (UUID/PK)
- name
- slug (unique)
- description
- ownerId -> Users.id
- settings (JSON)
- createdAt
- updatedAt

## Organizations
Клиентские компании/организации. У одной организации может быть много проектов.
- id (UUID/PK)
- portalId -> Portals.id
- name
- slug (unique within portal)
- description
- billingEmail
- billingAddress
- createdAt
- updatedAt

## UserOrganizations
Связь пользователей с клиентскими организациями и их роль внутри организации.
- id (UUID/PK)
- userId -> Users.id
- organizationId -> Organizations.id
- role (owner, admin, member)
- createdAt
- updatedAt

## Projects
Проект внутри портала, выполняемый для клиентской организации.
- id (UUID/PK)
- portalId -> Portals.id
- organizationId -> Organizations.id (nullable — для внутренних проектов)
- name
- description
- status (active, archived, paused)
- createdAt
- updatedAt

## Users
Базовая таблица пользователей. Роли и профили лежат отдельно. Роль пользователя определяется отношением к порталу/проекту/организации через `UserRoles`, а не фиксированным типом аккаунта.
- id (UUID/PK)
- email (unique)
- passwordHash
- name
- avatar
- status (active, inactive)
- createdAt
- updatedAt

## Roles
Роли в системе. Разделены по scope: worker, client, portal.

Роли работников (scope = worker):
- `worker_admin` — управляет отделами и работниками
- `worker_manager` — назначает задачи, общается с клиентом
- `worker_executor` — выполняет задачи, трекает время

Роли клиентов (scope = client):
- `client_project_owner` — ответственный за проект со стороны клиента
- `client_project_member` — создаёт задачи и комментарии
- `client_viewer` — только просмотр

Роли портала (scope = portal):
- `portal_admin` — управляет порталом и пользователями
- `portal_manager` — видит статистику, управляет проектами

Поля:
- id (UUID/PK)
- name (unique)
- scope (portal | worker | client)
- permissions (JSON-массив)
- createdAt

## UserRoles
Связь пользователя с ролью в конкретном контексте.
- id (UUID/PK)
- userId -> Users.id
- roleId -> Roles.id
- scope (portal | project | organization | department)
- contextId (UUID of portal/project/org/department)
- createdAt

## UserProjects
Участники проекта.
- id (UUID/PK)
- userId -> Users.id
- projectId -> Projects.id
- roleId -> Roles.id
- joinedAt
- leftAt (nullable)

## Departments
Отделы работников внутри портала.
- id (UUID/PK)
- portalId -> Portals.id
- name
- description
- managerId -> Users.id (nullable)
- createdAt
- updatedAt

## UserDepartments
Связь работников с отделами.
- id (UUID/PK)
- userId -> Users.id
- departmentId -> Departments.id
- role (manager, member)
- joinedAt
- leftAt (nullable)

## ClientProfiles
Дополнительная информация о клиенте.
- id (UUID/PK)
- userId -> Users.id (unique)
- organizationId -> Organizations.id (nullable)
- jobTitle
- phone
- createdAt
- updatedAt

## WorkerProfiles
Дополнительная информация о работнике.
- id (UUID/PK)
- userId -> Users.id (unique)
- departmentId -> Departments.id (nullable)
- managerId -> Users.id (nullable)
- position
- hourlyRate (decimal, nullable)
- hireDate
- createdAt
- updatedAt

## Tasks
- id (UUID/PK)
- projectId -> Projects.id
- authorId -> Users.id
- assigneeId -> Users.id (nullable)
- title
- description
- status (todo, in_progress, review, done, cancelled)
- priority (low, medium, high, critical)
- criticalId -> Critical.id (nullable)
- categoryId -> Categories.id (nullable)
- dueDate (nullable)
- createdAt
- updatedAt

## UserTasks
Дополнительные назначения/наблюдатели задачи (если нужно больше одного assignee).
- id (UUID/PK)
- userId -> Users.id
- taskId -> Tasks.id
- type (assignee, watcher)
- createdAt

## Comments
Комментарии к задачам.
- id (UUID/PK)
- taskId -> Tasks.id
- userId -> Users.id
- text
- createdAt
- updatedAt

## Notifications
- id (UUID/PK)
- userId -> Users.id
- type (task_assigned, comment, mention, status_change)
- title
- body
- entityType (task, comment, project)
- entityId
- read (boolean)
- createdAt

## Rooms
Комнаты чата.
- id (UUID/PK)
- projectId -> Projects.id (nullable)
- type (direct, group)
- name
- createdAt
- updatedAt

## UserRooms
Участники комнаты.
- id (UUID/PK)
- userId -> Users.id
- roomId -> Rooms.id
- joinedAt
- leftAt (nullable)

## ChatMessages
- id (UUID/PK)
- roomId -> Rooms.id
- userId -> Users.id
- text
- createdAt
- updatedAt

## Categories
Категории задач внутри портала.
- id (UUID/PK)
- portalId -> Portals.id
- name
- color
- createdAt

## Critical
Уровни критичности/срочности.
- id (UUID/PK)
- name
- color
- order (sort order)
- createdAt

## Wallets
Кошелек пользователя.
- id (UUID/PK)
- userId -> Users.id (unique)
- balance
- currency
- createdAt
- updatedAt

## Transactions
- id (UUID/PK)
- walletId -> Wallets.id
- amount
- time (int, minutes) — отработанное время, видимое клиенту
- type (deposit, withdrawal, payment)
- status (pending, completed, failed)
- description
- createdAt

## WalletsProjects
Кошелек проекта (бюджет).
- id (UUID/PK)
- projectId -> Projects.id (unique)
- balance
- currency
- totalTime (int, minutes) — суммарное отработанное время по проекту
- createdAt
- updatedAt

## TransactionsProjects
Все финансовые движения проекта. Баланс кошелька = сумма транзакций.
- id (UUID/PK)
- walletProjectId -> WalletsProjects.id
- workLogId -> WorkLogs.id (nullable)
- taskId -> Tasks.id (nullable)
- phaseId -> ProjectPhases.id (nullable) — к какой фазе относится
- amount (decimal)
- time (int, minutes, nullable)
- type (deposit | charge | refund | adjustment)
- description
- createdAt

## Services
Услуги, которые портал предоставляет клиенту, и их стоимость.
- id (UUID/PK)
- portalId -> Portals.id
- name (например, "DevOps work")
- description
- pricePerHour (decimal)
- currency
- createdAt
- updatedAt

## ProjectServices
Услуги, подключённые к проекту. Переопределяют цену или задают скидку.
- id (UUID/PK)
- projectId -> Projects.id
- serviceId -> Services.id
- enabled (boolean)
- customPricePerHour (decimal, nullable) — фиксированная цена часа для проекта
- discountPercent (decimal 0..100, nullable) — скидка на услугу для проекта
- createdAt
- updatedAt

## DepartmentServices
Ставка услуги для конкретного отдела ("гигачады дороже").
- id (UUID/PK)
- departmentId -> Departments.id
- serviceId -> Services.id
- pricePerHour (decimal)
- createdAt
- updatedAt
- UNIQUE(departmentId, serviceId)

## OrganizationDiscounts
Временная скидка для организации-клиента (например, −10% на июнь–июль).
- id (UUID/PK)
- organizationId -> Organizations.id
- serviceId -> Services.id (nullable — null = на все услуги)
- discountPercent (decimal 0..100)
- validFrom (DATE)
- validTo (DATE)
- reason (string, nullable)
- createdAt
- updatedAt

## WorkLogs
Трекинг времени работы. При создании вычисляется ставка и сумма, создаётся транзакция.
- id (UUID/PK)
- userId -> Users.id
- taskId -> Tasks.id (nullable)
- projectId -> Projects.id
- serviceId -> Services.id
- phaseId -> ProjectPhases.id (nullable) — к какой фазе проекта
- description
- time (int, minutes)
- date (DATE)
- resolvedRate (decimal, nullable) — итоговая ставка в момент лога
- amount (decimal, nullable) — resolvedRate * time/60
- createdAt
- updatedAt

## ProjectPhases
Фазы проекта: разработка с бюджетом → поддержка по часам.
- id (UUID/PK)
- projectId -> Projects.id
- name (например, "Разработка", "Поддержка")
- type (development | support | custom)
- pricingMode (fixed_budget | hourly)
- budgetTotal (decimal, nullable) — для fixed_budget
- spentAmount (decimal, default 0)
- paymentMode (full | installments, nullable)
- installmentAmount (decimal, nullable)
- billingPeriod (string, nullable — "monthly", "quarterly")
- currency (default RUB)
- status (draft | active | completed | cancelled)
- isCurrent (boolean)
- startDate (DATE, nullable)
- endDate (DATE, nullable)
- createdAt
- updatedAt

## ProjectPayments
График и факт платежей клиента (для installments).
- id (UUID/PK)
- phaseId -> ProjectPhases.id
- amount (decimal)
- dueDate (DATE)
- paidAt (DATETIME, nullable)
- status (pending | paid | overdue)
- transactionProjectId (UUID, nullable) — ссылка на транзакцию при оплате
- createdAt
- updatedAt

## MonthlyStatistics
Агрегированная статистика за месяц по проекту/услуге/пользователю.
- id (UUID/PK)
- projectId -> Projects.id
- userId -> Users.id (nullable)
- serviceId -> Services.id (nullable)
- year
- month
- totalMinutes
- totalAmount
- currency
- createdAt
- updatedAt

## TaskStatistics
Агрегированная статистика по конкретной задаче: сколько транзакций, времени и денег ушло.
- id (UUID/PK)
- taskId -> Tasks.id (unique)
- projectId -> Projects.id
- totalTransactions (int)
- totalMinutes (int)
- totalAmount (decimal)
- currency
- lastUpdatedAt

## Attachments
Файлы, прикреплённые к задачам или комментариям.
- id (UUID/PK)
- taskId -> Tasks.id (nullable)
- commentId -> Comments.id (nullable)
- fileName
- fileUrl
- fileSize (bytes)
- mimeType
- uploadedById -> Users.id
- createdAt

## Invites
Приглашения в портал, проект или организацию по email.
- id (UUID/PK)
- email
- portalId -> Portals.id
- projectId -> Projects.id (nullable)
- organizationId -> Organizations.id (nullable)
- roleId -> Roles.id
- status (pending | accepted | expired | revoked)
- token (unique)
- invitedById -> Users.id
- expiresAt
- createdAt
- updatedAt

## AuditLog
История изменений сущностей (кто, что, когда поменял).
- id (UUID/PK)
- entityType (task | comment | project | user | organization)
- entityId
- action (create | update | delete)
- userId -> Users.id
- oldValue (JSON)
- newValue (JSON)
- createdAt

## Tags
Теги задач внутри портала.
- id (UUID/PK)
- portalId -> Portals.id
- name
- color
- createdAt

## TaskTags
Связь задач с тегами.
- id (UUID/PK)
- taskId -> Tasks.id
- tagId -> Tags.id

## Subscriptions
Подписки пользователей на уведомления по задачам/проектам/комнатам.
- id (UUID/PK)
- userId -> Users.id
- entityType (task | project | room)
- entityId
- type (email | push | socket)
- createdAt

---

## Связи (ERD кратко)
- Portals 1:N Projects
- Portals 1:N Organizations
- Portals 1:N Departments
- Portals 1:N Categories
- Portals 1:N Critical
- Portals 1:N Services
- Organizations 1:N Projects
- Organizations 1:N UserOrganizations
- Organizations 1:N ClientProfiles
- Users 1:N UserOrganizations
- Users 1:N ClientProfiles
- Users 1:N WorkerProfiles
- Users 1:N UserDepartments
- Users 1:N UserProjects
- Users 1:N UserRooms
- Users 1:N UserRoles
- Users 1:N Tasks (author)
- Users 1:N Tasks (assignee)
- Users 1:N Comments
- Users 1:N ChatMessages
- Users 1:N Notifications
- Users 1:1 Wallets
- Users 1:1 ClientProfiles
- Users 1:1 WorkerProfiles
- Departments 1:N UserDepartments
- Departments 1:N WorkerProfiles
- Users 1:N WorkerProfiles (manager)
- Projects 1:N Tasks
- Projects 1:N Rooms
- Projects 1:N UserProjects
- Projects 1:1 WalletsProjects
- Projects 1:N ProjectServices
- Projects 1:N WorkLogs
- Projects 1:N MonthlyStatistics
- Projects 1:N TaskStatistics
- Rooms 1:N UserRooms
- Rooms 1:N ChatMessages
- Tasks 1:N Comments
- Tasks 1:N UserTasks
- Tasks 1:N WorkLogs
- Tasks 1:1 TaskStatistics
- Wallets 1:N Transactions
- WalletsProjects 1:N TransactionsProjects
- WalletsProjects 1:N WorkLogs
- Services 1:N ProjectServices
- Services 1:N WorkLogs
- Users 1:N WorkLogs
- Services 1:N MonthlyStatistics
- Users 1:N MonthlyStatistics
- Users 1:N Attachments (uploadedBy)
- Tasks 1:0..N Attachments
- Comments 1:0..N Attachments
- Users 1:N Invites (invitedBy)
- Portals 1:N Invites
- Projects 1:N Invites
- Organizations 1:N Invites
- Users 1:N AuditLog
- Portals 1:N Tags
- Tasks 1:N TaskTags
- Tags 1:N TaskTags
- Users 1:N Subscriptions

## Пример расчёта
- Услуга "DevOps work" стоит `4000 ₽/час`.
- Разработчик трекает 30 минут (`time = 30`) в задаче `taskId = X`.
- Сумма списания: `4000 * 30 / 60 = 2000 ₽`.
- Создаётся `WorkLog` (userId, projectId, taskId, serviceId, time = 30, date).
- Создаётся `TransactionsProjects` (walletProjectId, workLogId, taskId, amount = -2000, time = 30, type = expense).
- Баланс `WalletsProjects` уменьшается на 2000 ₽.
- В `MonthlyStatistics` и `TaskStatistics` увеличиваются totalMinutes, totalAmount, totalTransactions.

## Пример статистики по задаче
- Задача `Task #123`.
- 7 транзакций по `5000 ₽`.
- `TaskStatistics.totalAmount = 35000 ₽`.
- `TaskStatistics.totalTransactions = 7`.
- Пользователь видит: задача стоит 35 000 ₽, разбивка по 7 транзакциям.

## Индексы (рекомендации)
- Users.email (unique)
- Portals.slug (unique)
- Projects.portalId
- Tasks.projectId, Tasks.assigneeId, Tasks.status
- Comments.taskId
- Notifications.userId + read
- ChatMessages.roomId + createdAt
- UserRooms.userId, UserRooms.roomId
- UserProjects.userId, UserProjects.projectId
- Organizations.portalId
- UserOrganizations.userId, UserOrganizations.organizationId
- Departments.portalId
- UserDepartments.userId, UserDepartments.departmentId
- ClientProfiles.userId (unique)
- WorkerProfiles.userId (unique)
- WorkerProfiles.managerId
- Services.portalId
- ProjectServices.projectId
- WorkLogs.userId + date
- WorkLogs.projectId + date
- WorkLogs.taskId
- TransactionsProjects.taskId
- TransactionsProjects.workLogId
- MonthlyStatistics.projectId + year + month
- MonthlyStatistics.userId + year + month
- TaskStatistics.taskId (unique)
- Attachments.taskId
- Attachments.commentId
- Invites.token (unique)
- Invites.email
- AuditLog.entityType + entityId
- AuditLog.userId + createdAt
- Tags.portalId + name (unique)
- TaskTags.taskId + tagId (unique)
- Subscriptions.userId + entityType + entityId (unique)

## Что стоит сделать дальше (рекомендации)
1. Миграции настроены через Prisma. Команды:
   - `npm run db:migrate` — создать новую миграцию.
   - `npm run db:studio` — просмотр/редактирование данных.
   - `npm run db:generate` — перегенерация клиента после изменения схемы.
2. Переписать оставшиеся controllers и socket handlers на Prisma Client.
3. Добавить seed (`prisma/seed.ts`) для ролей, тестового пользователя и портала.
4. Добавить валидацию входящих данных через `zod` во всех controllers и socket handlers.
5. Реализовать auth middleware для HTTP routes (JWT) и доработать socket auth.
6. Добавить rate limiting на чат и API endpoints.
7. Подключить Redis для pub/sub Socket.IO в multi-instance режиме.
8. Настроить docker-compose: добавить Redis-сервис рядом с Postgres.
9. Добавить тесты: unit для services, integration для routes/sockets.
10. Реализовать сервис для агрегирования статистики (MonthlyStatistics, TaskStatistics) при создании/изменении WorkLog.