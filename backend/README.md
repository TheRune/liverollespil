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
