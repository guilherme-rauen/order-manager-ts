# Getting Started

## Requirements

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/en)

## Running Dependencies

```
docker-compose -f ./docker/docker-compose.yml up -d           # start postgres instance (database depedency)
```

## Setting Environment Variables

```
rename .env.sample => .env                                    # set up required local environment variables
```

## Building Application

```
npm ci                                                        # install dependencies
npm run prisma:generate                                       # build prisma client based on the schema
npm run prisma:migration                                      # apply the schema migrations to the database
npm run build                                                 # build the application
```

## Running Application

```
npm run start                                                 # start application
```
