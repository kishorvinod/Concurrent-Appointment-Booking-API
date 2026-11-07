# API implementation and Swagger

## Endpoint

`POST /api/appointments/book`

Request body:

```json
{
  "slotId": 101,
  "patientId": 5001
}
```

| Status | Meaning |
| --- | --- |
| `201 Created` | The appointment was created. |
| `400 Bad Request` | `slotId` or `patientId` is missing, not an integer, or not positive. |
| `404 Not Found` | The patient or requested slot does not exist. |
| `409 Conflict` | The slot has already been booked. |
| `429 Too Many Requests` | The configured IP rate limit was exceeded. |
| `500 Internal Server Error` | An unexpected failure occurred; implementation details are not exposed. |

## Swagger UI

Start the API and open `${API_BASE_URL}/api-docs`; by default this is `http://localhost:3000/api-docs`. The OpenAPI definition is generated from the `@openapi` annotation directly above the route handler in `src/routes/appointments.js`, keeping API documentation with the implementation.

## Postman request

1. Create a `POST` request to `{{baseUrl}}/api/appointments/book`.
2. Set `Content-Type: application/json`.
3. Choose **Body → raw → JSON** and paste:

   ```json
   {
     "slotId": 101,
     "patientId": 5001
   }
   ```

4. Send the request. A new database setup makes slot `101` available. Repeating the request after a successful booking returns `409`.

Equivalent PowerShell command:

```powershell
Invoke-RestMethod -Method Post -Uri "$env:API_BASE_URL/api/appointments/book" -ContentType "application/json" -Body '{"slotId":101,"patientId":5001}'
```

## Request protection and observability

- Each request has a generated `X-Request-Id` response header.
- Structured logs emit the request ID, method, path, status, and duration. Request bodies and database credentials are never logged.
- CORS allows the origin configured by `CORS_ORIGIN`.
- `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` control the IP-based limiter.
