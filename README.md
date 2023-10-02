# order-manager

![](https://media.giphy.com/media/3o6Mb37UkzBVPLy0fu/giphy.gif)

# Overview

The `order-manager` microservice is a dedicated component designed for the core management of orders. It provides a RESTful API that facilitates operations such as creating, retrieving, and updating orders.

## API Endpoints Overview

| Endpoint         | Method | Description                                |
| ---------------- | ------ | ------------------------------------------ |
| `/v1/orders`     | GET    | Retrieve a list of all orders              |
| `/v1/orders/:id` | GET    | Retrieve details of a specific order by ID |
| `/v1/orders`     | POST   | Create or update an order                  |

For detailed information on request and response formats, please refer to the Swagger documentation at `/api/docs`.

## Health Check

To ensure the service is running and healthy, you can use the root endpoint:

| Endpoint | Method | Description                                                     |
| -------- | ------ | --------------------------------------------------------------- |
| `/`      | GET    | A successful response indicates that the service is operational |

---

## Relevance [CRITICAL]

If this service is down:

- Orders will not be processed

## Sub-Components, Infrastructure/Service Dependencies

- [Mongo](https://www.mongodb.com/atlas/database)

## Architecture & Technologies

- **Architecture**: Inspired in a clean architecture combined with the hexagonal architecture and based on domain-driven design. Isolating domain citizens and application use-cases of any kind of external dependency.

  ![](https://khalilstemmler.com/img/blog/ddd-intro/clean.jpg)

  The folder structure follows the different layers:

  - [application](./src/application/) for application services (use-cases)
  - [domain](./src/domain) for domain entities and interfaces (core)
  - [handlers](./src/handlers) for the web API and event listeners (ingresses)
  - [infrastructure](./src/infrastructure) for infra implementations (e.g.: database)

- **Language**:

  - [**TypeScript**](https://www.typescriptlang.org/) (see [tsconfig.json](./tsconfig.json)) with [Node.js](https://nodejs.dev/)

- **App Framework**:

  - **Server**: [Express](https://expressjs.com/)
  - **Request validation**: [express-validator](https://express-validator.github.io/docs/)

- **Persistence**:

  - [**Database Module**](./src/infrastructure/db/database.module.ts) with [Mongo Client](./src/infrastructure/db/mongo/mongo-client.ts) using [mongoose](https://mongoosejs.com/)

- **Exceptions**:

  - [**Custom exceptions**](./src/domain/exceptions/) with [ts-error](https://github.com/gfmio/ts-error)

- **Observability**:

  - [**Logger**](./src/logger.module.ts) with [Pino](https://getpino.io/#/)

- **Documentation**:

  - **API**: [Swagger](https://swagger.io/) with [OpenAPI Specification](https://spec.openapis.org/oas/v3.1.0)
  - **CHANGELOG**: Check what is new or changed [here](./docs/CHANGELOG.md)

  Additional documentation will be place under [`docs`](./docs/)

- **Testing**

  - **Framework**: [jest](https://jestjs.io/) (see [jest.config.json](./jest.config.json))
  - **Component testing**: [SuperTest](https://github.com/visionmedia/supertest#readme)

- **Code style**:

  - [**Prettier**](https://prettier.io/) (see [.prettierrc](./.prettierrc))
  - [**ESLint**](https://eslint.org/) (see [.eslintrc](./.eslintrc))

## For Developers

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [TECHDEBT.md](./TECHDEBT.md)

## License

This project is licensed under the MIT License. For more details, see the [LICENSE](./LICENSE) file.
