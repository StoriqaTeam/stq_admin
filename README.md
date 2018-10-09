## Dev mode
`yarn dev`

then open http://localhost:9000

## Use custom graphql schema URL

Use `GRAPHQL_URL` environment variable to set URL to fetch schema from. Default value is `https://nightly.stq.cloud/graphql`.

The following command will fetch schema from stable.stq.cloud

`GRAPHQL_URL="https://stable.stq.cloud/graphql" yarn build`


## Define GraphQL-endpoint

For set endpoint for graphql just add

`GRAPHQL_URL='https://beta.stq.cloud/graphql'`

before your yarn-script command
(`GRAPHQL_URL='https://stage.stq.cloud/graphql' yarn dev` or `GRAPHQL_URL='https://beta.stq.cloud/graphql' yarn build` for example)

By default endpoint value is `https://nightly.stq.cloud/graphql`

## Production build

`yarn build`

Check prod build:

`yarn build && docker build -t storiqateam/stq-admin . && docker run -it --rm -p 80:80 storiqateam/stq-admin`

then open http://localhost/admin in browser
