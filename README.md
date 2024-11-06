# KumoAuth

[English](./README.md) | [中文](./README_CN.md)

> Kumo - means cloud (雲☁️) in Japanese - is a lightweight and efficient authentication system built with Cloudflare Workers, D1 Database, and the Hono framework.

[![Test by Github Action][github-test-badge]][github-test-link]
[![GitHub License][license-badge]][license-link]
[![Node js][node-badge]][node-link]
[![pnpm Version][pnpm-badge]][pnpm-link] |
[![Hono][hono-badge]][hono-link]
[![Cloudflare][cloudflare-badge]][cloudflare-link]
[![Eslint][eslint-badge]][eslint-link]
[![Prettier][prettier-badge]][prettier-link]

This project leverages Cloudflare's serverless architecture to build a simple, lightweight authentication system. It uses JWTs for stateless authentication and access protection, with plans for additional features like two-factor authentication and refresh tokens.

## ✨ Project Overview

Designed for small applications and personal projects, this system provides a secure and efficient login solution. D1 is used as the database, and the app is deployed globally on Cloudflare Workers for optimal access speed and low latency.

## 🎯 MVP Feature List

- [x] User registration with password encryption 📝
- [x] User login/logout (returns JWT via Cookie) 🔑
- [x] Auto-generated OpenAPI Schema and Interactive Reference 📚
- [x] User login status verification with auto-refresh (via Cookie and authMiddleware) 🔄
- [x] 404 and global error handling (JSON) 🚫
- [x] Structured logging for request and response details (excluding 404) 📈
- [ ] Basic authorization (JWT-protected routes) 🔐
- [ ] Password reset feature 🔄 (in future)
- [ ] Two-factor authentication (2FA) 🔒 (in future)
- [ ] Refresh Token mechanism ♻️ (in future)
- [ ] User profile updates 👤 (in future)

## 📜 Current Features

- **User Registration**: Users can register a new account via `/auth/register`, with passwords encrypted and stored in the database.
- **User Login**: Users can log in via `/auth/login` to receive a JWT upon successful authentication, which is stored in an `HttpOnly` Cookie.
- **User Logout**: Users can log out via `/auth/logout` to receive a maxAge equal 0 Cookie upon successful authentication, which will guide the browser to remove it.
- **Login Status Verification**: Verifies user login status via `/auth/status` using `authMiddleware`. This functionality checks the validity of the JWT in the request and automatically refreshes the JWT in the Cookie if valid.
- **Structured logging**: Logs each request and response detail (follows worker's logging standard), skipping 404 responses, and captures error messages for status codes >= 400.
- **OpenAPI Schema**: Available at `/doc` as a JSON-compliant schema matching [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0.html), using [Zod OpenAPI](https://hono.dev/examples/zod-openapi).
- **Interactive API Documentation**: Accessible at `/reference` for interactive documentation, code examples, and request templates, built with [Scalar for Hono](https://github.com/scalar/scalar/blob/main/packages/hono-api-reference/README.md).

## 📂 Project Structure

```plaintext
.
├── db
│   └── schema.sql              # Database initialization script
├── src
│   ├── index.ts                # Main entry point, initializes Hono application
│   ├── db                      # Database operations
│   ├── lib                     # General utilities and tools
│   │   ├── auth                # Auth-related utilities
│   │   │   ├── auth-token.ts   # JWT generation and cookie setting
│   │   │   ├── hash.ts         # Password hashing utility
│   │   │   ├── password-validator.ts # Password validation utility
│   │   │   └── username-validator.ts # Username validation utility
│   │   └── helper              # Helper functions module
│   ├── middleware              # Middleware modules
│   │   ├── auth.ts             # Checks login state via cookie
│   │   ├── not-found.ts        # 404 handler
│   │   ├── on-error.ts         # Global error handler
│   │   ├── security.ts         # Middleware for CORS and CSRF protection
│   │   └── worker-logger.ts    # Custom logging middleware
│   ├── routes                  # Routing modules
│   │   ├── auth
│   │   │   ├── change-password.ts # Password change logic
│   │   │   ├── index.ts        # Module entry route
│   │   │   ├── login.ts        # Login logic
│   │   │   ├── logout.ts       # Logout logic
│   │   │   ├── register.ts     # Registration logic
│   │   │   ├── reset.ts        # Password reset (in development)
│   │   │   ├── status.ts       # User status check
│   │   │   └── verify.ts       # 2FA verification (in development)
│   │   └── settings            # System settings routes
│   └── types                   # Global type definitions
├── wrangler.toml               # Wrangler configuration file
├── package.json                # Project dependencies and scripts
├── example.dev.vars            # Example environment variables file
└── README.md                   # Project documentation
```

## 🚀 Quick Start

1. Clone the project and install dependencies:

   ```bash
   git clone https://github.com/ZL-Asica/KumoAuth.git
   cd KumoAuth
   yarn install
   ```

2. Set up environment variables:

   - Copy `example.dev.vars` and rename it to `.dev.vars`
   - Set the JWT secret, expire time, CORS_CSRF_ORIGIN, and other necessary configurations

3. Initialize the D1 database locally with Wrangler:

   ```bash
   yarn run db:init
   ```

4. Start the local development server:

   ```bash
   yarn run dev
   ```

## 📚 Future Plans

- Add two-factor authentication (2FA) for enhanced account security
- Provide comprehensive API documentation for easy integration and development
- Third party auth.

---

Thank you for your interest and support! Feel free to suggest features or contribute to help us improve this project 🙌

<!-- Badge Links -->

[github-test-badge]: https://img.shields.io/github/actions/workflow/status/ZL-Asica/KumoAuth/auto-test.yml?logo=github&label=Test
[license-badge]: https://img.shields.io/github/license/ZL-Asica/KumoAuth
[node-badge]: https://img.shields.io/badge/node%3E=20.11-339933?logo=node.js&logoColor=white
[pnpm-badge]: https://img.shields.io/github/package-json/packageManager/ZL-Asica/KumoAuth?label=&logo=pnpm&logoColor=fff&color=F69220
[hono-badge]: https://img.shields.io/badge/Hono-E36002?logo=hono&logoColor=fff
[cloudflare-badge]: https://img.shields.io/badge/Cloudflare-F38020?logo=Cloudflare&logoColor=white
[eslint-badge]: https://img.shields.io/badge/eslint-4B32C3?logo=eslint&logoColor=white
[prettier-badge]: https://img.shields.io/badge/Prettier-F7B93E?logo=Prettier&logoColor=white

<!-- Badge URL Links -->

[github-test-link]: https://github.com/ZL-Asica/KumoAuth/actions/workflows/auto-test.yml
[license-link]: https://github.com/ZL-Asica/KumoAuth?tab=GPL-3.0-1-ov-file#readme
[node-link]: https://nodejs.org/
[pnpm-link]: https://pnpm.io/
[hono-link]: https://hono.dev/
[cloudflare-link]: https://www.cloudflare.com/
[eslint-link]: https://eslint.org/
[prettier-link]: https://prettier.io/
