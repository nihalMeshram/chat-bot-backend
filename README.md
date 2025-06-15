<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# 🧠 Chat Bot Backend

Chat-Bot Backend is a modular NestJS backend supporting document-aware question-answering via LLM and RAG.

- Auth Module: JWT-based login/logout/register with Passport and role-based access control.

- User Module: APIs for creating, updating, deleting (soft delete), restoring, and retrieving users.

- Document Module: Upload, download, delete documents (stored in MinIO).

- Ingestion Api: Trigger's generating and storing embeddings from documents for later semantic use including ingestion status api's.

- Chat Module: Receives user questions, retrieves relevant document embeddings, and forwards them to an external LLM-based RAG (Retrieval-Augmented Generation) service for intelligent responses.


## 📦 Project setup

```bash
$ npm install
```


## 🚀 Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```


## 🧪 Run tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## 🐳 Setup using docker compose

```bash
$ docker compose up -d --build
```

## 🛠️ Post-Setup Instructions

After installing dependencies or starting the application, make sure to:

#### 1. Run Database Migrations
```bash
# Apply all database migrations
$ npm run migration:run

# Run seeder to create default users
$ npm run seeder:run 
```

#### 2. Default User Credentials

| Role   | Full Name   | Email                                           | Password       |
| ------ | ----------- | ----------------------------------------------- | -------------- |
| Admin  | Admin User  | [admin@example.com](mailto:admin@example.com)   | AdminPass123!  |
| Editor | Editor User | [editor@example.com](mailto:editor@example.com) | EditorPass123! |
| Viewer | Viewer User | [viewer@example.com](mailto:viewer@example.com) | ViewerPass123! |

🔐 Note: Passwords are hashed using bcrypt and are safe for local development. Make sure to change them in production environments.

#### 3. Create MinIO Bucket
Ensure the bucket specified as MINIO_BUCKET in your .env file exists.

- Open: http://localhost:9001

- Login with MINIO_ROOT_USER / MINIO_ROOT_PASSWORD

- Create a new bucket with the value of MINIO_BUCKET


## ⚙️ Environment Variables

All required environment variables must be defined in a .env file. Use the provided example.env as a reference.

| Variable              | Required | Default   | Description                                      |
| --------------------- | -------- | --------- | ------------------------------------------------ |
| `PORT`                | No       | 3000      | Server port                                      |
| `HOST`                | No       | 0.0.0.0   | Server host                                      |
| `NODE_ENV`            | ✅ Yes    |           | Environment (`development` / `production`)       |
| `DB_USER`             | ✅ Yes    |           | PostgreSQL username                              |
| `DB_PASSWORD`         | ✅ Yes    |           | PostgreSQL password                              |
| `DB_NAME`             | ✅ Yes    |           | PostgreSQL database name                         |
| `DB_PORT`             | No       | 5432      | PostgreSQL port                                  |
| `DB_HOST`             | No       | localhost | DB host (use `postgres` if using Docker Compose) |
| `JWT_SECRET`          | ✅ Yes    |           | Secret key used for signing JWT tokens           |
| `JWT_EXPIRES_IN`      | No       | 1d        | JWT expiration time                              |
| `MINIO_ENDPOINT_INTERNAL`      | ✅ Yes    |           | File storage endpoint (internal) |
| `MINIO_ENDPOINT_EXTERNAL`      | ✅ Yes    |           | File storage endpoint (public) |
| `MINIO_REGION`        | No       | us-east-1 | MinIO region                                     |
| `MINIO_ROOT_USER`     | ✅ Yes    |           | MinIO root access key                            |
| `MINIO_ROOT_PASSWORD` | ✅ Yes    |           | MinIO secret key                                 |
| `MINIO_BUCKET`        | ✅ Yes    |           | Bucket name used to store files                  |


## 📘 API Documentation
The Chat Bot backend includes auto-generated Swagger documentation to explore and test API endpoints.

- URL: http://localhost:3000/api


## 📬 Stay in touch

- Author - [Nihal Meshram](https://github.com/nihalMeshram)
- LinkedIn - [@nihal-meshram](https://www.linkedin.com/in/nihal-meshram/)


## ⚖️ License

📜 Licensed under the [MIT License](LICENSE) © 2024 Nihal Meshram.
