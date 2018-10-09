`yarn dev`

## Use custom graphql schema URL

Use `GRAPHQL_URL` environment variable to set URL to fetch schema from. Default value is `https://nightly.stq.cloud/graphql`.

```
# The following command will fetch schema from stable.stq.cloud
GRAPHQL_URL="https://stable.stq.cloud/graphql" yarn build
```

## Define GraphQL-endpoint

```
For set endpoint for graphql just add `--env.endpoint='https://beta.stq.cloud/graphql'` to run command
(yarn dev --env.endpoint='https://stage.stq.cloud/graphql' or yarn build --env.endpoint='https://beta.stq.cloud/graphql' for example)
By default endpoint set to https://nightly.stq.cloud/graphql
```

## Production build

`yarn build`

```
Check prod build: `yarn build && docker build -t storiqateam/stq-admin . && docker run -it --rm -p 80:80 storiqateam/stq-admin`
then open http://localhost/admin in browser
```
