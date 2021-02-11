## Dev mode

`yarn dev`

then open http://localhost:9000

## Use custom graphql schema URL

Use `GRAPHQL_URL` environment variable to set URL to fetch schema from. Default value is `https://nightly.grame.cloud/graphql`.

The following command will fetch schema from stable.stq.cloud

`GRAPHQL_URL="https://stable.grame.cloud/graphql" yarn build`

## Define GraphQL-endpoint

For set endpoint for graphql just add

`GRAPHQL_URL='https://beta.grame.cloud/graphql'`

before your yarn-script command
(`GRAPHQL_URL='https://stage.grame.cloud/graphql' yarn dev` or `GRAPHQL_URL='https://beta.grame.cloud/graphql' yarn build` for example)

By default endpoint value is `https://nightly.grame.cloud/graphql`

## Define subpath for app

export `APP_SUBPATH` var with value for desired app subpath before build, default is '/'
(your app will be available by path `<domain>/<APP_SUBPATH>`)

_dont forget update nginx config too_

## Production build

Make sure that you have defined `APP_SUBPATH`, `PRODUCT_URL`, `GRAPHQL_URL` env-vars, then run

`yarn build`

### Check prod build:

Make sure that you have defined `APP_SUBPATH`, `PRODUCT_URL`, `GRAPHQL_URL` env-vars, then run

`yarn prod:check`

then open http://localhost/$APP_SUBPATH in browser
