# TravelBDX Tourism Server

High-performance REST API backend for the TravelBDX Tourism Management System.

[![Release](https://img.shields.io/badge/release-v1.0.0-green.svg)](https://github.com/parvejme24/tourist-guide-server)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Tests](https://img.shields.io/badge/tests-57%20passed-brightgreen.svg)]()

## Technology Stack
- **Runtime**: Node.js (v18 - v26+ compatible)
- **Framework**: Express.js
- **Database**: MongoDB Atlas via native `mongodb` driver
- **Authentication**: JSON Web Tokens (`jsonwebtoken`)
- **Storage Policy**: Direct image link storage (Zero file storage)

## Key Endpoints
- `GET /` - Server status and route directory
- `POST /jwt` - Issues 7-day authentication token
- `POST /seed-demo-data` - Seeds rich demo data into database
- `GET /packages` - Tour packages with search, category and price sorting
- `GET /users` - User management and role switching
- `GET /bookings` - Booking management with status workflow
- `GET /admin-stats` - Platform metrics and counts

## Running Tests
```bash
npm test
```

## Running Server
```bash
npm start
```
