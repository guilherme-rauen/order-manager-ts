## Development

```
# Setup

rename .env.sample => .env             # set up environment variables locally
npm ci                                 # install dependencies

# Local Testing

npm run test(:watch|:cov)              # run tests (with watcher|coverage)

./docker/docker-compose up -d          # start mongo instance (infra depedency)
npm run build                          # build the application from TS to JS
npm run start(:dev)                    # start application (for local development)

# PR Preparation

npm update                             # update dependencies (non breaking changes)
npm audit fix                          # auto-fix vulnerabilities
npm run lint:fix                       # auto-fix linter issues
npm run test:all                       # test if it is ready for PR
```

See complete list of scripts in [`package.json.scripts`](./package.json)
