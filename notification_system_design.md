# Notification System Design

## Stage 1

### Priority Model

Notifications use a deterministic tuple:

```text
(type weight, timestamp, notification ID)
```

| Type | Weight |
| --- | ---: |
| Placement | 3 |
| Result | 2 |
| Event | 1 |

Type has strict precedence. Within one type, newer notifications rank first, and ID provides a
stable final tie-breaker.

### Efficient Top Ten

The backend maintains a bounded min-heap. Each incoming unread notification is compared with
the current minimum. Once the heap is full, only a higher-priority item replaces the root.
Processing `m` notifications with limit `n` takes `O(m log n)` time and `O(n)` memory.

### Reliability

- The protected API token is loaded from ignored environment variables.
- HTTP errors, timeouts, malformed payloads, invalid fields and unsupported types are handled.
- Notifications marked as read are skipped; absent read status is treated as unread.
- Significant lifecycle events use the reusable remote logging middleware.

## Stage 2

### Frontend Architecture

The React and TypeScript application uses feature-based modules:

```text
notification_app_fe/
|-- server/                       # Server-only auth and protected API proxy
|-- src/
|   |-- app/                      # Router and Material UI theme
|   |-- components/               # Reusable presentation components
|   |-- features/notifications/   # API, normalization, ranking and hooks
|   `-- pages/                    # Route-level pages
`-- tests/                        # Pure ranking tests
```

The Vite middleware exposes local `/api` routes on `localhost:3000`. Client credentials and
bearer tokens remain server-side. The shared middleware token manager renews short-lived
tokens automatically and retries an upstream request once after a `401`.

### Pages and Interaction

- **All notifications:** server pagination, type filtering, retry states and responsive cards.
- **Priority inbox:** unread items first, selectable top 10, 15 or 20, and type filtering.
- Clicking a card marks it viewed. IDs persist in `localStorage`; unseen cards display `New`.
- Loading skeletons, empty states and actionable error messages prevent blank or unclear pages.

### Styling and Responsiveness

Material UI supplies the complete component and styling system. Layouts collapse to one column
on mobile and expand to two columns on larger screens. Navigation labels compact to icons on
small displays while retaining accessible labels.

### Frontend Logging

Browser events are posted to local `/api/logs`. The server proxy fixes the stack to `frontend`,
the package to `utils`, validates level and the 48-character message limit, and attaches the
protected token outside the browser bundle.

### Commands

```powershell
npm run frontend:dev
npm run frontend:build
npm test
```
