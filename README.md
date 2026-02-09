# Alamany Dental Clinic — API Documentation

Backend API for Alamany Dental Clinic. Base URL: **`/api/v1`**

---

## Table of Contents

- [Authentication](#authentication)
- [Response Format](#response-format)
- [Auth](#auth)
- [Doctors](#doctors)
- [Services](#services)
- [Blogs](#blogs)
- [Reviews](#reviews)
- [Users](#users)
- [Appointments](#appointments)
- [Messages](#messages)
- [Errors](#errors)

---

## Authentication

**Protected routes** require a valid JWT in the header:

```http
Authorization: Bearer <accessToken>
```

- **Login** and **Refresh** set a `refreshToken` in an **httpOnly cookie**. Send requests with `credentials: 'include'` (or equivalent) so the cookie is sent.
- Get a new access token: `POST /api/v1/auth/refresh` (cookie must be sent).

---

## Response Format

### Success

```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { ... }
}
```

### Error

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "location": "optional",
    "data": null
  }
}
```

---

## Auth

**Base path:** `/api/v1/auth`

| Method | Endpoint    | Auth | Description                     |
| ------ | ----------- | ---- | ------------------------------- |
| POST   | `/register` | No   | Register admin                  |
| POST   | `/login`    | No   | Login                           |
| POST   | `/refresh`  | No\* | Refresh access token (\*cookie) |
| POST   | `/logout`   | Yes  | Logout                          |
| GET    | `/me`       | Yes  | Current user                    |

---

### POST `/auth/register`

**Request (JSON):**

```json
{
  "email": "admin@clinic.com",
  "password": "securePass123",
  "firstName": "Ahmed",
  "lastName": "Ali",
  "phone": "+201234567890",
  "role": "admin"
}
```

**Response `201`:**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6789012345",
      "email": "admin@clinic.com",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "phone": "+201234567890",
      "role": "admin",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

---

### POST `/auth/login`

**Request (JSON):**

```json
{
  "email": "admin@clinic.com",
  "password": "securePass123"
}
```

**Response `200`:**  
Sets `refreshToken` in httpOnly cookie.

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6789012345",
      "email": "admin@clinic.com",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "role": "admin",
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST `/auth/refresh`

**Request:** No body. Send cookie (e.g. from browser with `credentials: 'include'`).

**Response `200`:** New cookie + body:

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST `/auth/logout`

**Headers:** `Authorization: Bearer <accessToken>`

**Response `200`:**

```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

### GET `/auth/me`

**Headers:** `Authorization: Bearer <accessToken>`

**Response `200`:**

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6789012345",
      "email": "admin@clinic.com",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "phone": "+201234567890",
      "role": "admin",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

---

## Doctors

**Base path:** `/api/v1/doctors`

| Method | Endpoint                           | Auth  | Description           |
| ------ | ---------------------------------- | ----- | --------------------- |
| GET    | `/`                                | No    | List doctors          |
| GET    | `/:id`                             | No    | Doctor by ID          |
| GET    | `/:id/statistics`                  | No    | Doctor statistics     |
| POST   | `/`                                | Admin | Create doctor         |
| PUT    | `/:id`                             | Admin | Update doctor         |
| DELETE | `/:id`                             | Admin | Delete doctor         |
| POST   | `/:id/certificates`                | Admin | Add certificate       |
| DELETE | `/:id/certificates/:certificateId` | Admin | Remove certificate    |
| POST   | `/:id/materials`                   | Admin | Add material          |
| DELETE | `/:id/materials/:materialId`       | Admin | Remove material       |
| POST   | `/:id/cases`                       | Admin | Add before/after case |
| DELETE | `/:id/cases/:caseId`               | Admin | Remove case           |
| POST   | `/:id/office-hours`                | Admin | Add office hours      |
| DELETE | `/:id/office-hours/:officeHoursId` | Admin | Remove office hours   |

**Create/Update doctor:** `Content-Type: multipart/form-data`

- **picture** (file, optional): profile image (JPG, PNG, WEBP, max 5MB)
- Plus text fields: `email`, `firstName`, `lastName`, `phone`, `specialization` (array), `licenseNumber`, `yearsOfExperience`, etc.

**Response example (GET `/:id`):**

```json
{
  "success": true,
  "message": "Doctor profile retrieved successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "email": "dr.ahmed@clinic.com",
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "picture": "https://res.cloudinary.com/.../image.jpg",
    "specialization": ["General Dentistry", "Cosmetic Dentistry"],
    "licenseNumber": "LIC123",
    "yearsOfExperience": 10,
    "certificates": [],
    "officeHours": [],
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## Services

**Base path:** `/api/v1/services`

| Method | Endpoint | Auth  | Description    |
| ------ | -------- | ----- | -------------- |
| GET    | `/`      | No    | List services  |
| POST   | `/`      | Admin | Create service |
| DELETE | `/:id`   | Admin | Delete service |

**GET `/` query params (optional):**  
`category`, `minPrice`, `maxPrice`, `page`, `limit`

**Response (GET `/`):**

```json
{
  "success": true,
  "message": "Services retrieved successfully",
  "data": {
    "services": [
      {
        "_id": "64a1b2c3d4e5f6789012345",
        "name": "Teeth Whitening",
        "description": "Professional whitening treatment.",
        "coverImage": "https://res.cloudinary.com/.../image.jpg",
        "category": "Cosmetic Dentistry",
        "price": { "min": 100, "max": 200, "currency": "USD" },
        "duration": "1 hour",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalServices": 25,
      "limit": 10
    }
  }
}
```

**POST `/` (Admin):** `Content-Type: multipart/form-data`

- **coverImage** (file, optional)
- **name**, **description**, **category**, **duration**
- **price.min**, **price.max**, **price.currency**

**Response `201`:** Same shape as one service object inside `data`.

---

## Blogs

**Base path:** `/api/v1/blogs`

| Method | Endpoint | Auth  | Description |
| ------ | -------- | ----- | ----------- |
| GET    | `/`      | No    | List blogs  |
| GET    | `/:id`   | No    | Blog by ID  |
| POST   | `/`      | Admin | Create blog |
| PUT    | `/:id`   | Admin | Update blog |
| DELETE | `/:id`   | Admin | Delete blog |

**GET `/` query params (optional):** `category`, `page`, `limit`, `search`

**Response (GET `/`):**

```json
{
  "success": true,
  "message": "Blogs retrieved successfully",
  "data": {
    "blogs": [
      {
        "_id": "64a1b2c3d4e5f6789012345",
        "title": "Tips for Healthy Gums",
        "content": "Full HTML or markdown content...",
        "summary": "Short summary.",
        "tags": ["dental", "health"],
        "coverImage": "https://res.cloudinary.com/.../cover.jpg",
        "images": ["https://res.cloudinary.com/.../img1.jpg"],
        "videos": [],
        "category": "Dental Care",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalBlogs": 15,
      "limit": 10
    }
  }
}
```

**POST `/` & PUT `/:id` (Admin):** `Content-Type: multipart/form-data`

- **coverImage** (file, optional)
- **images** (files, optional, max 10)
- **videos** (files, optional, max 5)
- **title**, **content**, **summary**, **tags** (array as JSON or repeated field), **category**

**Category enum:** `Dental Care`, `Treatments`, `Cosmetic`, `Pediatric`, `News`, `Other`

---

## Reviews

**Base path:** `/api/v1/reviews`

| Method | Endpoint      | Auth  | Description       |
| ------ | ------------- | ----- | ----------------- |
| GET    | `/doctor/:id` | No    | Reviews by doctor |
| POST   | `/`           | No    | Create review     |
| DELETE | `/:reviewId`  | Admin | Delete review     |

**GET `/doctor/:id` query params (optional):** `page`, `limit`

**POST `/` (JSON):**

```json
{
  "doctorProfile": "64a1b2c3d4e5f6789012345",
  "rating": 5,
  "comment": "Excellent care and very professional."
}
```

**Response (GET `/doctor/:id`):**

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "64a1b2c3d4e5f6789012345",
        "doctorProfile": "64a1b2c3d4e5f6789012345",
        "rating": 5,
        "comment": "Excellent care.",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 20,
      "page": 1,
      "pages": 2,
      "limit": 10
    }
  }
}
```

---

## Users

**Base path:** `/api/v1/users`

| Method | Endpoint   | Auth       | Description |
| ------ | ---------- | ---------- | ----------- |
| GET    | `/`        | No         | List users  |
| PUT    | `/:userId` | Yes        | Update user |
| DELETE | `/:userId` | Admin only | Soft delete |

**PUT `/:userId` (JSON):**  
Allowed fields: `firstName`, `lastName`, `phone`, `email`, `isActive`

**Response (GET `/`):**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "email": "admin@clinic.com",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "phone": "+201234567890",
      "role": "admin",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

## Appointments

**Base path:** `/api/v1/appointments`

| Method | Endpoint                          | Auth  | Description                |
| ------ | --------------------------------- | ----- | -------------------------- |
| GET    | `/doctors/list`                   | No    | List doctors (for booking) |
| GET    | `/doctors/:doctorId/office-hours` | No    | Doctor office hours        |
| POST   | `/`                               | No    | Create appointment         |
| GET    | `/`                               | Admin | List appointments          |
| GET    | `/:id`                            | Admin | Appointment by ID          |
| PUT    | `/:id/status`                     | Admin | Update status              |
| DELETE | `/:id`                            | Admin | Delete appointment         |

**POST `/` (create appointment, JSON):**

```json
{
  "firstName": "Sara",
  "lastName": "Mohamed",
  "dateOfBirth": "1990-05-15",
  "phoneNumber": "+201234567890",
  "gender": "Female",
  "email": "sara@example.com",
  "appointmentDate": "2024-02-20T10:00:00.000Z",
  "notes": "First visit, slight tooth pain",
  "doctorProfileId": "64a1b2c3d4e5f6789012345"
}
```

**Status enum:** `pending`, `confirmed`, `completed`, `cancelled`

**Response (POST `/`):**

```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "firstName": "Sara",
    "lastName": "Mohamed",
    "email": "sara@example.com",
    "appointmentDate": "2024-02-20T10:00:00.000Z",
    "status": "pending",
    "doctorProfileId": "64a1b2c3d4e5f6789012345",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**PUT `/:id/status` (Admin, JSON):**

```json
{
  "status": "confirmed"
}
```

**GET `/` (Admin) query params (optional):** `page`, `limit`, `status`, `doctorId`, `dateFrom`, `dateTo`

---

## Messages

**Base path:** `/api/v1/messages`

| Method | Endpoint | Auth  | Description    |
| ------ | -------- | ----- | -------------- |
| POST   | `/`      | No    | Send message   |
| GET    | `/`      | Admin | List messages  |
| DELETE | `/:id`   | Admin | Delete message |

**POST `/` (JSON):**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+201234567890",
  "message": "I would like to ask about pricing for implants."
}
```

**Response `201`:**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+201234567890",
    "message": "I would like to ask about pricing for implants.",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**GET `/` (Admin) query params (optional):** `page`, `limit`, `search`

**Response (GET `/`):**

```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "64a1b2c3d4e5f6789012345",
        "name": "John Doe",
        "email": "john@example.com",
        "message": "...",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "currentPage": 1,
      "totalPages": 5,
      "limit": 10
    }
  }
}
```

---

## Errors

| Status | Meaning                                       |
| ------ | --------------------------------------------- |
| 400    | Bad request (validation, duplicate, etc.)     |
| 401    | Unauthorized (missing or invalid token)       |
| 403    | Forbidden (wrong role or deactivated account) |
| 404    | Not found (resource or route)                 |
| 500    | Server error                                  |

**Example error body:**

```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": {
    "location": "loginUser",
    "data": null
  }
}
```

---

## Quick reference

| Resource     | List (public)                    | Get one (public)   | Create        | Update             | Delete         |
| ------------ | -------------------------------- | ------------------ | ------------- | ------------------ | -------------- |
| Auth         | —                                | GET `/me`          | POST register | —                  | —              |
| Doctors      | GET `/doctors`                   | GET `/doctors/:id` | POST (Admin)  | PUT (Admin)        | DELETE (Admin) |
| Services     | GET `/services`                  | —                  | POST (Admin)  | —                  | DELETE (Admin) |
| Blogs        | GET `/blogs`                     | GET `/blogs/:id`   | POST (Admin)  | PUT (Admin)        | DELETE (Admin) |
| Reviews      | GET `/reviews/doctor/:id`        | —                  | POST          | —                  | DELETE (Admin) |
| Users        | GET `/users`                     | —                  | —             | PUT                | DELETE (Admin) |
| Appointments | GET `/appointments/doctors/list` | —                  | POST          | PUT status (Admin) | DELETE (Admin) |
| Messages     | GET (Admin)                      | —                  | POST          | —                  | DELETE (Admin) |

**Base URL:** `http://localhost:3000/api/v1` (or your deployed host)

Use **Bearer token** in `Authorization` for protected routes and send **cookies** for `/auth/refresh`.
