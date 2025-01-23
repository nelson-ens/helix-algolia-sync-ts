# Helix to Algolia Github Action
This is a Github action that updates Algolia index.  

Main executable is in dist/index.js (this is built and deploy using build-pack.yml workflow.

## Installation

```sh
npm i
```

## Linting
Ensure all code are linted and formatted before committing back to the git repository.
```sh
npm run lint
npm run format
```

## Testing
Ensure all tests passes with decent coverage (60%) before pushing back to the git repository.
```shell
npm run test
```

## Local development
### Environment Variables

.env
```shell
ALGOLIA_INDEX_NAME=<indexName>
```

.secret
```shell
ALGOLIA_API_KEY=<apiKey>
ALGOLIA_APPLICATION_ID=<appId>
```

### Debugging

1. Run the following command from parent repos; `act -W .github/workflows/helix-algolia-sync.yaml -e ../helix-algolia-sync-ts/samples/publish-event.json`
2.
