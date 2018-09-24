import { ApolloError } from 'apollo-client';
import {
  head,
  pathOr,
  pipe,
  toPairs,
  last,
  map,
  propOr,
  fromPairs,
  flatten,
} from 'ramda';
import { GraphQLError } from 'graphql';

const extractValidationErrorsFromGraphQLError = (
  graphqlError: ApolloError,
): { [k: string]: string } => {
  const rootError = head(graphqlError.graphQLErrors);
  if (!rootError) {
    return {};
  }

  const error = rootError as GraphQLError & {
    data: {
      code: number | undefined;
      details: { message: string | undefined } | undefined;
    };
  };
  const errMsg = pathOr(null, ['data', 'details', 'message'], error);
  if (!errMsg) {
    return {};
  }

  let errorJson: { [k: string]: Array<{ message: string | undefined }> } = {};
  try {
    errorJson = JSON.parse(errMsg);
  } catch {
    //
  }

  /* {
    "email": [
      {
        "code": "email",
        "message": "Invalid email format",
        "params": {
          "value": "a"
        }
      }
    ],
    "password": [
      {
        "code": "length",
        "message": "Password should be between 8 and 30 symbols",
        "params": {
          "value": "a",
          "min": 8,
          "max": 30
        }
      }
    ]
  } -> {
    email: "Invalid email format",
    password: "Password should be between 8 and 30 symbols",
  } */

  const errJsonToPairs = toPairs(errorJson);

  const result = map((item): [string, string] => {
    const val = last(item);
    let errValidationMsg = '';
    if (val instanceof Array) {
      const errObj = head(val);
      errValidationMsg = propOr('', 'message', errObj);
    }
    return [head(item) as string, errValidationMsg];
  }, errJsonToPairs);

  return fromPairs(result);
};

export default extractValidationErrorsFromGraphQLError;
