# DevPulse 🛠️

> A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

---

## View Live Site : https://dev-pulse-pi-six.vercel.app/


## Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** (LTS 24.x+) | Runtime environment |
| **TypeScript** | Type-safe development |
| **Express.js** | HTTP server with modular router architecture |
| **PostgreSQL** | Relational database (native `pg` driver) |
| **Raw SQL** | Direct `pool.query()` calls — no ORMs or query builders |
| **bcrypt** | Password hashing (salt rounds: 8–12) |
| **jsonwebtoken** | JWT generation & verification |
| **http-status-codes** | Consistent HTTP status code references |

---

## Project Structure

```
devpulse/
├── src/
│   ├── config/
│   │   └── db.ts              # PostgreSQL connection pool
│   ├── middleware/
│   │   └── auth.ts            # JWT verification & role guards
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.router.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.ts
│   │   └── issues/
│   │       ├── issues.router.ts
│   │       ├── issues.controller.ts
│   │       └── issues.service.ts
│   └── index.ts               # App entry point
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js LTS (v24.x or higher)
- PostgreSQL (v14 or higher)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/AshiqurRahmanAshik/DevPulse
cd devpulse
```

## API Reference

### Base URL

```
http://localhost:3000/api
```

### Authentication

Authenticated endpoints require a JWT token in the `Authorization` header:

```
Authorization: <JWT_TOKEN>
```

---

### Authentication

#### Register a New User

```http
POST /api/auth/signup
```

**Access:** Public

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

**Response `201 Created`:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@devpulse.com",
    "role": "contributor",
    "created_at": "2026-01-20T09:00:00Z",
    "updated_at": "2026-01-20T09:00:00Z"
  }
}
```

---

#### Login

```http
POST /api/auth/login
```

**Access:** Public

**Request Body:**

```json
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@devpulse.com",
      "role": "contributor",
      "created_at": "2026-01-20T09:00:00Z",
      "updated_at": "2026-01-20T09:00:00Z"
    }
  }
}
```

---

### Issues

#### Create an Issue

```http
POST /api/issues
```

**Access:** Authenticated (`contributor`, `maintainer`)

**Headers:**

```
Authorization: <JWT_TOKEN>
```

**Request Body:**

```json
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

**Response `201 Created`:**

```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T10:30:00Z"
  }
}
```

---

#### Get All Issues

```http
GET /api/issues
```

**Access:** Public

**Query Parameters:**

| Parameter | Values | Default |
|---|---|---|
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | — |
| `status` | `open`, `in_progress`, `resolved` | — |

**Example:**

```
GET /api/issues?sort=newest&type=bug&status=open
```

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Issues retrived successfully",
  "data": [
    {
      "id": 45,
      "title": "Database connection timeout under load",
      "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
      "type": "bug",
      "status": "open",
      "reporter": {
        "id": 1,
        "name": "John Doe",
        "role": "contributor"
      },
      "created_at": "2026-01-20T10:30:00Z",
      "updated_at": "2026-01-20T14:45:00Z"
    }
  ]
}
```

---

#### Get a Single Issue

```http
GET /api/issues/:id
```

**Access:** Public

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Issue retrived successfully",
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter": {
      "id": 1,
      "name": "John Doe",
      "role": "contributor"
    },
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T14:45:00Z"
  }
}
```

---

#### Update an Issue

```http
PATCH /api/issues/:id
```

**Access:**
- `maintainer` — can update any issue
- `contributor` — can update own issues only when status is `open`

**Headers:**

```
Authorization: <JWT_TOKEN>
```

**Request Body** *(all fields optional)*:

```json
{
  "title": "Updated: Database pool exhaustion fix needed",
  "description": "Updated description with reproduction steps...",
  "type": "bug"
}
```

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": 45,
    "title": "Updated: Database pool exhaustion fix needed",
    "description": "Updated description with reproduction steps...",
    "type": "bug",
    "status": "in_progress",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T14:45:00Z"
  }
}
```

---

#### Delete an Issue

```http
DELETE /api/issues/:id
```

**Access:** `maintainer` only

**Headers:**

```
Authorization: <JWT_TOKEN>
```

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

---

## User Roles & Permissions

| Action | `contributor` | `maintainer` |
|---|:---:|:---:|
| Register & login | ✅ | ✅ |
| View all issues | ✅ | ✅ |
| Create an issue | ✅ | ✅ |
| Update own issue (status: `open` only) | ✅ | ✅ |
| Update any issue | ❌ | ✅ |
| Change issue status independently | ❌ | ✅ |
| Delete any issue | ❌ | ✅ |

---

## Response Format

All responses follow a consistent structure.

**Success:**

```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error description",
  "errors": "Error details"
}
```

---

## HTTP Status Codes

| Code | Reason | Usage |
|---|---|---|
| `200` | OK | Successful GET, PATCH, DELETE |
| `201` | Created | Successful POST (resource created) |
| `204` | No Content | Successful DELETE with no response body |
| `400` | Bad Request | Validation errors, invalid input, duplicate resource |
| `401` | Unauthorized | Missing, expired, or invalid JWT token |
| `403` | Forbidden | Valid token but insufficient role/permissions |
| `404` | Not Found | Requested resource does not exist |
| `409` | Conflict | Business logic conflict (e.g. editing a resolved issue) |
| `500` | Internal Server Error | Unexpected server or database error |

---

## License

This project is for internal use. All rights reserved.
