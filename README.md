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
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).


# Features

- Modular artitechure
- JWT Base Authentication
- Role Based Access Contorol(RBAC) Authorization
- Rate limiter
- TypeScript
- Request Validation
- Error Handling
- Unit Testing
- Database Migrations
- API Documentation (swagger)

## 🛠 Tech Stack

- Node.js
- TypeScript
- Nestjs
- mysql with Mikro-orm
- Jest for Testing
- SuperTest for E2E test
- class validator for Validation
- JWT for Authentication
- Swagger for Documentation
- Multer for Working With File

## Project Structure

```
project-root/
├── src/
│   ├── config                # globa app config
│   │── decorator             # global decorators
│   │── import                # project imports
│   │       ├── external.ts   # Import external modules
│   │       └── internal.ts   # Import internal modules
│   │── migrations            # Database migrations
│   │── entities              # Database Models
│   ├── modules               # App Modules
│   ├── seeder                # Database Seeders
├── types                     # Application (interfaces,types,...)
├── public                    # Static Files(user profile, attach files)
├── dto                       # global DTO
├── responses                 # Message Responses 


```

## Packages

- [Nestjs](https://nestjs.com/) (Main Framwork)
- [MikroOrm](https://mikro-orm.io/)(mini Orm To Working With Postgres )
- [Mysql](https://www.mysql.com/)(Main Database)
- [jwt](https://jwt.io/)(Autentication and Authorization By JsonWebToken)
- [swagger](https://swagger.io/)(Documentation APIs)
- [argon2](https://www.npmjs.com/package/argon2)(New Method for hashing Fast and safe)

## 🔧 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Mysql
- npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ErfanAbedinpour/nestjs-assignment .
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations:

```bash
npm run migration:up
```
4. Run database seed:

```bash
npm run seed
```
5. Start the development server:

```bash
npm run dev
```

### using dokcer for run(Recomendatioin)

1. Clone the repository:

```bash
git clone https://github.com/ErfanAbedinpour/nestjs-assignment.git
```

2. Run Database migrations:

```bash
docker compose up migration
```

3. Run Database Seeders:

```bash
docker compose up seed
```

4. Start

```bash
docker compose up
```

### Running Tests

```bash
# Run tests
npm test

# Run E2E tests
npm run test:e2e
```

### Api Documentaion

- Swagger Docuement http://host:port/docs