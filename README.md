# Helix to Algolia Github Action
This is a Github action that updates Algolia index.  

Main executable is in dist/index.js (this is built and deploy using build-pack.yml workflow.

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
npm run format
```

## Testing

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
