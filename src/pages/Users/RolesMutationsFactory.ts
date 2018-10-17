import ApolloClient from 'apollo-client';

import { AvailableUserRoleType } from './RoleCheckbox';
import {
  UserMicroserviceRole,
  StoresMicroserviceRole,
} from '../../../__generated__/globalTypes';
import {
  AddRoleToUserMutation,
  AddRoleToUserMutationVariables,
} from './__generated__/AddRoleToUserMutation';
import {
  RemoveRoleFromUserMutation,
  RemoveRoleFromUserMutationVariables,
} from './__generated__/RemoveRoleFromUserMutation';
import {
  AddRoleToUserOnStores,
  AddRoleToUserOnStoresVariables,
} from './__generated__/AddRoleToUserOnStores';
import {
  RemoveRoleFromUserOnStores,
  RemoveRoleFromUserOnStoresVariables,
} from './__generated__/RemoveRoleFromUserOnStores';
import {
  USER_ADD_ROLE_MUTATION,
  USER_REMOVE_ROLE_MUTATION,
  USER_ADD_ROLE_TO_STORES_MUTATION,
  USER_REMOVE_ROLE_FROM_STORES_MUTATION,
} from './queries';

interface InputType {
  userId: number;
  role: AvailableUserRoleType;
  checked: boolean;
  client: ApolloClient<any>;
  microservice: 'users' | 'stores';
}

interface ReturnType {
  userId: number;
  role: AvailableUserRoleType;
  added: boolean;
  microservice: 'users' | 'stores';
}

const getMutationForRole = (params: InputType): Promise<ReturnType | null> => {
  if (params.microservice === 'users') {
    if (params.checked) {
      return params.client
        .mutate<AddRoleToUserMutation, AddRoleToUserMutationVariables>({
          mutation: USER_ADD_ROLE_MUTATION,
          variables: {
            input: {
              clientMutationId: '',
              userId: params.userId,
              name: params.role as UserMicroserviceRole,
            },
          },
        })
        .then(({ data }) => {
          if (!data) {
            return Promise.resolve(null);
          }
          const { userId, name } = data.addRoleToUserOnUsersMicroservice;
          return Promise.resolve({
            userId: userId,
            role: name as AvailableUserRoleType,
            added: true,
            microservice: params.microservice,
          });
        });
    } else {
      return params.client
        .mutate<
          RemoveRoleFromUserMutation,
          RemoveRoleFromUserMutationVariables
        >({
          mutation: USER_REMOVE_ROLE_MUTATION,
          variables: {
            input: {
              clientMutationId: '',
              name: params.role as UserMicroserviceRole,
              userId: params.userId,
            },
          },
        })
        .then(({ data }) => {
          if (!data) {
            return Promise.resolve(null);
          }
          const { userId, name } = data.removeRoleFromUserOnUsersMicroservice;
          return Promise.resolve({
            userId: userId,
            role: name,
            added: false,
            microservice: params.microservice,
          });
        });
    }
  } else if (params.microservice === 'stores') {
    if (params.checked) {
      return params.client
        .mutate<AddRoleToUserOnStores, AddRoleToUserOnStoresVariables>({
          mutation: USER_ADD_ROLE_TO_STORES_MUTATION,
          variables: {
            input: {
              clientMutationId: '',
              userId: params.userId,
              name: params.role as StoresMicroserviceRole,
            },
          },
        })
        .then(({ data }) => {
          if (!data) {
            return Promise.resolve(null);
          }

          const { userId, name } = data.addRoleToUserOnStoresMicroservice;
          return Promise.resolve({
            userId: userId,
            role: name,
            added: true,
            microservice: params.microservice,
          });
        });
    } else {
      return params.client
        .mutate<
          RemoveRoleFromUserOnStores,
          RemoveRoleFromUserOnStoresVariables
        >({
          mutation: USER_REMOVE_ROLE_FROM_STORES_MUTATION,
          variables: {
            input: {
              clientMutationId: '',
              name: params.role as StoresMicroserviceRole,
              userId: params.userId,
            },
          },
        })
        .then(({ data }) => {
          if (!data) {
            return Promise.resolve(null);
          }

          const { userId, name } = data.removeRoleFromUserOnStoresMicroservice;
          return Promise.resolve({
            userId: userId,
            role: name,
            added: false,
            microservice: params.microservice,
          });
        });
    }
  }
  return Promise.resolve(null);
};

export { getMutationForRole };
