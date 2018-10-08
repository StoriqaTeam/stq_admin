`yarn dev`

## Use custom graphql schema URL

Use `GRAPHQL_URL` environment variable to set URL to fetch schema from. Default value is `https://nightly.stq.cloud/graphql`.

```
# The following command will fetch schema from stable.stq.cloud
maxim@pluto:~/Documents/stq_admin$ GRAPHQL_URL="https://stable.stq.cloud/graphql" yarn build
```

