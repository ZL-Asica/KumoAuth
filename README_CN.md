# KumoAuth

[中文](./README.md) | [English](./README_EN.md)

> Kumo - 日语中的雲☁️ - 一个基于 Cloudflare Workers、D1 数据库和 Hono 框架构建的高效身份认证系统

[![Test by Github Action][github-test-badge]][github-test-link]
[![GitHub License][license-badge]][license-link]
[![Node js][node-badge]][node-link]
[![Yarn Version][yarn-badge]][yarn-link] |
[![Hono][hono-badge]][hono-link]
[![Cloudflare][cloudflare-badge]][cloudflare-link]
[![Eslint][eslint-badge]][eslint-link]
[![Prettier][prettier-badge]][prettier-link]

此项目旨在利用 Cloudflare 的无服务器架构搭建一个简单、轻量的身份认证系统。项目使用了 JWT 来实现用户的无状态认证和访问保护功能，未来计划加入更多功能，如双因素认证、刷新令牌等。

## ✨ 项目简介

本项目的初衷是为小型应用和个人项目提供一个安全、高效的登录认证系统。使用 D1 作为数据库，通过 Cloudflare Workers 部署在全球边缘节点上，使得访问速度和响应时间最优。

## 🎯 MVP 功能清单

- [x] 用户注册功能（带密码加密）📝
- [x] 用户登录/登出功能（返回 JWT -通过Cookie）🔑
- [x] 自动生成的 OpenAPI Schema 和可交互的 Reference 📚
- [x] 用户登陆状态验证及自动刷新（通过Cookie和authMiddleware）🔄
- [x] 404 处理及全局错误处理（JSON）🚫
- [x] 请求及响应的详细日志功能 (排除 404 响应) 📈
- [ ] 基础权限验证（基于 JWT 的路由保护）🔐
- [ ] 密码重置功能 🔄 （in future）
- [ ] 双因素身份验证（2FA）🔒 （in future）
- [ ] Refresh Token 机制 ♻️ （in future）
- [ ] 用户信息更新功能 👤 （in future）

## 📜 目前实现的功能

- **用户注册**：用户可以通过 `/auth/register` 注册新账户，密码将会被加密存储在数据库中。
- **用户登录**：通过 `/auth/login` 登录，验证通过后会返回 JWT 令牌，并在 `HttpOnly` 的 Cookie 中储存。
- **用户登出**：通过`/auth/logout`登出，验证通过后会自动设置maxAge为0，引导浏览器删除 Cookie。
- **登陆状态验证**：通过 `/auth/status` 使用 `authMiddleware` 验证用户的登陆状态。此功能检查请求中 JWT 的有效性并在有效时自动刷新 Cookie 中的 JWT。
- **OpenAPI Schema**：目前还没有添加权限验证，在 `/doc` 的路径下可以直接获取到符合 [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0.html) 结构的 JSON 格式的 Schema（采用了 [Zod OpenAPI](https://hono.dev/examples/zod-openapi) 实现)。
- **日志**: 记录每一次请求和对应的响应（遵循 Cloudflare Worker 的日志标准），忽略 404 响应，对于状态码 >= 400 的，记录错误信息。
- **交互式 API 文档**：目前还没有添加权限验证，在 `/reference` 的路径下可以直接使用和查看可交互的在线文档，并且可以查看对应的 Schema、不同语言进行请求的代码架构、示例等。（采用了 [Scalar for Hono](https://github.com/scalar/scalar/blob/main/packages/hono-api-reference/README.md) 实现)。

## 📂 项目结构

```plaintext
.
├── db
│   └── schema.sql              # 数据库初始化脚本
├── src
│   ├── index.ts                # 主入口，初始化 Hono 应用
│   ├── db                      # 数据库操作相关
│   ├── lib                     # 通用逻辑和工具库
│   │   ├── auth                # auth 的相关工具
│   │   │   ├── auth-token.ts   # JWT 生成及 Cookie 设置
│   │   │   ├── hash.ts         # 密码加密工具
│   │   │   ├── password-validator.ts # 密码验证工具
│   │   │   └── username-validator.ts # 用户名验证工具
│   │   └── helper              # 辅助功能模块
│   ├── middleware              # 中间件模块
│   │   ├── auth.ts             # 检测 Cookie 的登录状态
│   │   ├── not-found.ts        # 404 处理
│   │   ├── on-error.ts         # 全局错误处理
│   │   ├── security.ts         # CORS 和 CSRF 处理中间件
│   │   └── worker-logger.ts    # 自定义日志记录
│   ├── routes                  # 路由模块
│   │   ├── auth
│   │   │   ├── change-password.ts # 修改密码逻辑
│   │   │   ├── index.ts        # 模块入口路由
│   │   │   ├── login.ts        # 登录逻辑
│   │   │   ├── logout.ts       # 登出逻辑
│   │   │   ├── register.ts     # 注册逻辑
│   │   │   ├── reset.ts        # 密码重置（开发中）
│   │   │   ├── status.ts       # 用户状态检测
│   │   │   └── verify.ts       # 2FA 验证（开发中）
│   │   └── settings            # 系统设置路由
│   └── types                   # 全局类型定义
├── wrangler.toml               # Wrangler 配置文件
├── package.json                # 项目依赖和脚本
├── example.dev.vars            # 环境变量示例文件
└── README.md                   # 项目说明文档
```

## 🚀 快速开始

1. 克隆项目并安装依赖：

   ```bash
   git clone https://github.com/ZL-Asica/KumoAuth.git
   cd KumoAuth
   yarn install
   ```

2. 配置环境变量：

   - 复制 `example.dev.vars` 并重命名为 `.dev.vars`
   - 设置 JWT 密钥、有效时长、CORS_CSRF_ORIGIN和其他必要配置

3. 使用 Wrangler 在本地初始化 D1 数据库：

   ```bash
   yarn run db:init
   ```

4. 本地启动开发环境：

   ```bash
   yarn run dev
   ```

## 📚 未来发展计划

- 加入双因素身份验证（2FA），提高账户安全性
- 提供详细的 API 文档，方便集成与二次开发
- 接入第三方验证

---

感谢你的关注与支持！欢迎提出建议或加入贡献，帮助我们一起完善这个项目 🙌

<!-- Badge Links -->

[github-test-badge]: https://img.shields.io/github/actions/workflow/status/ZL-Asica/KumoAuth/auto-test.yml?logo=github&label=Test
[license-badge]: https://img.shields.io/github/license/ZL-Asica/KumoAuth
[node-badge]: https://img.shields.io/badge/node%3E=20.11-339933?logo=node.js&logoColor=white&labelColor=339933
[yarn-badge]: https://img.shields.io/github/package-json/packageManager/ZL-Asica/KumoAuth?label=&logo=yarn&logoColor=fff
[hono-badge]: https://img.shields.io/badge/Hono-E36002?logo=hono&logoColor=fff
[cloudflare-badge]: https://img.shields.io/badge/Cloudflare-F38020?logo=Cloudflare&logoColor=white
[eslint-badge]: https://img.shields.io/badge/eslint-4B32C3?logo=eslint&logoColor=white
[prettier-badge]: https://img.shields.io/badge/Prettier-F7B93E?logo=Prettier&logoColor=white

<!-- Badge URL Links -->

[github-test-link]: https://github.com/ZL-Asica/KumoAuth/actions/workflows/auto-test.yml
[license-link]: https://github.com/ZL-Asica/KumoAuth?tab=GPL-3.0-1-ov-file#readme
[node-link]: https://nodejs.org/
[yarn-link]: https://yarnpkg.com/
[hono-link]: https://hono.dev/
[cloudflare-link]: https://www.cloudflare.com/
[eslint-link]: https://eslint.org/
[prettier-link]: https://prettier.io/
