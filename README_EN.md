# KumoAuth

[中文](./README.md) | [English](./README_EN.md)

> Kumo - means cloud (雲☁️) in Japanese - is a lightweight and efficient authentication system built with Cloudflare Workers, D1 Database, and the Hono framework.

![Test by Github Action](https://img.shields.io/github/actions/workflow/status/ZL-Asica/KumoAuth/auto-test.yml?logo=github&label=Test) | ![GitHub License](https://img.shields.io/github/license/ZL-Asica/KumoAuth) | ![Yarn Version](https://img.shields.io/github/package-json/packageManager/ZL-Asica/KumoAuth?label=&logo=yarn&logoColor=fff)

![Hono](https://img.shields.io/badge/Hono-E36002?logo=hono&logoColor=fff) | ![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?logo=Cloudflare&logoColor=white)

![Eslint](https://img.shields.io/badge/eslint-4B32C3?logo=eslint&logoColor=white) | ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?logo=Prettier&logoColor=white)

This project leverages Cloudflare's serverless architecture to build a simple, lightweight authentication system. It uses JWTs for stateless authentication and access protection, with plans for additional features like two-factor authentication and refresh tokens.

## ✨ Project Overview

Designed for small applications and personal projects, this system provides a secure and efficient login solution. D1 is used as the database, and the app is deployed globally on Cloudflare Workers for optimal access speed and low latency.

## 🎯 MVP Feature List

- [x] User registration with password encryption 📝
- [x] User login (returns JWT via Cookie) 🔑
- [x] Auto-generated OpenAPI Schema and Interactive Reference 📚
- [x] User login status verification (via Cookie) 🔄
- [ ] Basic authorization (JWT-protected routes) 🔐
- [ ] Password reset feature 🔄 (in future)
- [ ] Two-factor authentication (2FA) 🔒 (in future)
- [ ] Refresh Token mechanism ♻️ (in future)
- [ ] User profile updates 👤 (in future)

## 📜 Current Features

- **User Registration**: Users can register a new account via `/auth/register`, with passwords encrypted and stored in the database.
- **User Login**: Users can log in via `/auth/login` to receive a JWT upon successful authentication, which is stored in an `HttpOnly` Cookie.
- **Login Status Verification**: Verify user login status via `/auth/status`, which checks the presence of the Cookie and the validity of the JWT within it.
- **OpenAPI Schema**: Available at `/doc` as a JSON-compliant schema matching [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0.html), using [Zod OpenAPI](https://hono.dev/examples/zod-openapi).
- **Interactive API Documentation**: Accessible at `/reference` for interactive documentation, code examples, and request templates, built with [Scalar for Hono](https://github.com/scalar/scalar/blob/main/packages/hono-api-reference/README.md).

## 📂 Project Structure

```plaintext
.
├── db
│   └── schema.sql            # Database initialization script
├── src
│   ├── auth
│   │   ├── login.ts          # Login logic
│   │   ├── register.ts       # Registration logic
│   │   ├── reset.ts          # Password reset (in development)
│   │   └── verify.ts         # 2FA verification (in development)
│   ├── index.ts              # Main entry, initializes Hono app
│   └── utils
│   │   ├── hash.ts           # Password hashing utilities
│   │   └── jwt.ts            # JWT generation and verification
│   └── lib
│       ├── db                # Database query
│       └── helper            # Data structure builder
├── wrangler.toml             # Wrangler configuration file
├── package.json              # Project dependencies and scripts
├── example.env               # Environment variable sample file
└── README.md                 # Project documentation
```

## 🚀 Quick Start

1. Clone the project and install dependencies:

   ```bash
   git clone https://github.com/ZL-Asica/KumoAuth.git
   cd KumoAuth
   yarn install
   ```

2. Set up environment variables:

   - Copy `example.env` and rename it to `.env`
   - Set the JWT secret and other necessary configurations

3. Initialize the D1 database locally with Wrangler:

   ```bash
   yarn run db:init
   ```

4. Start the local development server:

   ```bash
   yarn run dev
   ```

## 📚 Future Plans

- Implement a refresh token mechanism to improve user experience
- Add two-factor authentication (2FA) for enhanced account security
- Improve error handling and logging
- Provide comprehensive API documentation for easy integration and development

---

Thank you for your interest and support! Feel free to suggest features or contribute to help us improve this project 🙌
