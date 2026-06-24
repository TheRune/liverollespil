# Backend API

This folder contains a standalone .NET backend API for the Liverollespil application.

## Purpose

The backend provides:
- user authentication and JWT authorization
- database access for characters, races, abilities, and sessions
- an API surface designed for frontend integration

## Requirements

- .NET 10 SDK
- PostgreSQL-compatible database

## Configuration

The backend expects the following environment variables:

- `DATABASE_URL`: PostgreSQL connection URL
- `JWT_SECRET`: secret key for signing JWTs
- `JWT_ISSUER`: issuer claim for JWT validation
- `JWT_AUDIENCE`: audience claim for JWT validation

## Run

Use the standard .NET tooling to build and run the API.

## Local testing

1. Copy the example env file:

   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your real local values:

   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_ISSUER`
   - `JWT_AUDIENCE`

3. Start the backend in development:

   ```bash
   dotnet run --project backend.csproj
   ```

4. Test the auth flow securely on localhost:

   - Use the provided `backend/test-api.http` file if you have the VS Code REST Client extension.
   - Or use `curl`:

     ```bash
     curl -X POST http://localhost:5032/api/auth/register \
       -H "Content-Type: application/json" \
       -d '{"email":"tester@example.com","password":"StrongPassword123!"}'

     curl -X POST http://localhost:5032/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"tester@example.com","password":"StrongPassword123!"}'

     # copy the returned token, then:
     curl http://localhost:5032/api/auth/me \
       -H "Authorization: Bearer <token>"
     ```

5. Keep secrets local only: do not commit `.env.local` and never store `JWT_SECRET` in Git.
