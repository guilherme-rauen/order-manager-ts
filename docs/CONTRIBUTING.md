# CONTRIBUTING

## Development

### Setup

Follow the [`Getting Started`](./GETTING-STARTED.md) steps

### Local Testing

```
npm run test(:watch|:cov)              # run tests (with watcher|coverage)

npm run start:dev                      # start application on dev mode
```

### PR Preparation

```
npm update                             # update dependencies (non breaking changes)

npm audit fix                          # auto-fix vulnerabilities

npm run lint:fix                       # auto-fix linter issues

npm run test:all                       # test if it is ready for PR
```

See complete list of scripts in [`package.json.scripts`](./package.json)
