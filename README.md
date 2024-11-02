# KumoAuth

[中文](./README.md) | [English](./README_EN.md)

> Kumo - 日语中的雲☁️ - 一个基于 Cloudflare Workers、D1 数据库和 Hono 框架构建的高效身份认证系统

![Test by Github Action](https://img.shields.io/github/actions/workflow/status/ZL-Asica/KumoAuth/auto-test.yml?logo=github&label=Test) ![GitHub License](https://img.shields.io/github/license/ZL-Asica/KumoAuth) ![Yarn Version](https://img.shields.io/github/package-json/packageManager/ZL-Asica/KumoAuth?label=&logo=yarn&logoColor=fff)

![Hono](https://img.shields.io/badge/Hono-E36002?logo=hono&logoColor=fff) ![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?logo=Cloudflare&logoColor=white) ![Eslint](https://img.shields.io/badge/eslint-4B32C3?logo=eslint&logoColor=white) ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?logo=Prettier&logoColor=white)

此项目旨在利用 Cloudflare 的无服务器架构搭建一个简单、轻量的身份认证系统。项目使用了 JWT 来实现用户的无状态认证和访问保护功能，未来计划加入更多功能，如双因素认证、刷新令牌等。

## ✨ 项目简介

本项目的初衷是为小型应用和个人项目提供一个安全、高效的登录认证系统。使用 D1 作为数据库，通过 Cloudflare Workers 部署在全球边缘节点上，使得访问速度和响应时间最优。

## 🎯 MVP 功能清单

- [x] 用户注册功能（带密码加密）📝
- [x] 用户登录功能（返回 JWT -通过Cookie）🔑
- [x] 自动生成的 OpenAPI Schema 和可交互的 Reference（通过Cookie）📚
- [x] 用户登陆状态验证（通过Cookie）🔄
- [ ] 基础权限验证（基于 JWT 的路由保护）🔐
- [ ] 密码重置功能 🔄 （in future）
- [ ] 双因素身份验证（2FA）🔒 （in future）
- [ ] Refresh Token 机制 ♻️ （in future）
- [ ] 用户信息更新功能 👤 （in future）

## 📜 目前实现的功能

- **用户注册**：用户可以通过 `/auth/register` 注册新账户，密码将会被加密存储在数据库中。
- **用户登录**：通过 `/auth/login` 登录，验证通过后会返回 JWT 令牌，并在 `HttpOnly` 的 Cookie 中储存。
- **登陆状态验证**：通过 `/auth/status` 验证用户的登陆状态，检查请求是否有 Cookie ，有的状态下会检查 Cookie 中的 JWT 是否有效、过期、或者无效。
- **OpenAPI Schema**：目前还没有添加权限验证，在 `/doc` 的路径下可以直接获取到符合 [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0.html) 结构的 JSON 格式的 Schema（采用了 [Zod OpenAPI](https://hono.dev/examples/zod-openapi) 实现)。
- **交互式 API 文档**：目前还没有添加权限验证，在 `/reference` 的路径下可以直接使用和查看可交互的在线文档，并且可以查看对应的 Schema、不同语言进行请求的代码架构、示例等。（采用了 [Scalar for Hono](https://github.com/scalar/scalar/blob/main/packages/hono-api-reference/README.md) 实现)。

## 📂 项目结构

```plaintext
.
├── db
│   └── schema.sql            # 数据库初始化脚本
├── src
│   ├── auth
│   │   ├── login.ts          # 登录逻辑
│   │   ├── register.ts       # 注册逻辑
│   │   ├── reset.ts          # 密码重置（开发中）
│   │   └── verify.ts         # 2FA 验证（开发中）
│   ├── index.ts              # 主入口文件，初始化 Hono 应用
│   └── utils
│   │   ├── hash.ts           # 密码加密工具
│   │   └── jwt.ts            # JWT 生成和验证
│   └── lib
│       ├── db                # 数据库操作
│       └── helper            # JSON 构建和错误响应处理
├── wrangler.toml             # Wrangler 配置文件
├── package.json              # 项目依赖和脚本
├── example.env               # 环境变量示例文件
└── README.md                 # 项目说明文档
```

## 🚀 快速开始

1. 克隆项目并安装依赖：

   ```bash
   git clone https://github.com/ZL-Asica/KumoAuth.git
   cd KumoAuth
   yarn install
   ```

2. 配置环境变量：

   - 复制 `example.env` 并重命名为 `.env`
   - 设置 JWT 密钥和其他必要配置

3. 使用 Wrangler 在本地初始化 D1 数据库：

   ```bash
   yarn run db:init
   ```

4. 本地启动开发环境：

   ```bash
   yarn run dev
   ```

## 📚 未来发展计划

- 实现 Refresh Token 机制，改善用户体验
- 加入双因素身份验证（2FA），提高账户安全性
- 完善错误处理和日志记录功能
- 提供详细的 API 文档，方便集成与二次开发

---

感谢你的关注与支持！欢迎提出建议或加入贡献，帮助我们一起完善这个项目 🙌
