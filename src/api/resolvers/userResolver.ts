import {GraphQLError} from 'graphql';
import {
  Cat,
  Credentials,
  User,
  UserInput,
  UserOutput,
} from '../../types/DBTypes';
import fetchData from '../../functions/fetchData';
import {LoginResponse, UserResponse} from '../../types/MessageTypes';
import {MyContext} from '../../types/MyContext';

export default {
  Query: {
    users: async () => {
      return fetchData<UserOutput[]>(`${process.env.AUTH_URL}/users`);
    },
    userById: async (_parent: undefined, args: {id: string}) => {
      return fetchData<UserOutput>(`${process.env.AUTH_URL}/users/${args.id}`);
    },
  },
  Mutation: {
    register: async (_parent: undefined, args: {user: UserInput}) => {
      return fetchData<UserResponse>(`${process.env.AUTH_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args.user),
      });
    },
    login: async (_parent: undefined, args: {credentials: Credentials}) => {
      return fetchData<LoginResponse>(`${process.env.AUTH_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: args.credentials.username,
          password: args.credentials.password,
        }),
      });
    },
    updateUser: async (
      _parent: undefined,
      args: {user: Partial<UserInput>},
      context: MyContext,
    ) => {
      return fetchData<UserResponse>(`${process.env.AUTH_URL}/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + context.userdata?.token,
        },
        body: JSON.stringify(args.user),
      });
    },
    deleteUser: async (
      _parent: undefined,
      _args: undefined,
      context: MyContext,
    ) => {
      return fetchData<UserResponse>(`${process.env.AUTH_URL}/users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + context.userdata?.token,
        },
      });
    },
    updateUserAsAdmin: async (
      _parent: undefined,
      args: {user: Partial<UserInput>; id: string},
      context: MyContext,
    ) => {
      if (context.userdata?.user?.role !== 'admin') {
        throw new GraphQLError('Insufficient permissions');
      }
      return fetchData<UserResponse>(
        `${process.env.AUTH_URL}/users/${args.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + context.userdata?.token,
          },
          body: JSON.stringify(args.user),
        },
      );
    },
    deleteUserAsAdmin: async (
      _parent: undefined,
      args: {id: string},
      context: MyContext,
    ) => {
      if (context.userdata?.user?.role !== 'admin') {
        throw new GraphQLError('Insufficient permissions');
      }

      return fetchData<UserResponse>(
        `${process.env.AUTH_URL}/users/${args.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + context.userdata?.token,
          },
        },
      );
    },
  },
  Cat: {
    owner: async (parent: Cat) => {
      return fetchData<User>(`${process.env.AUTH_URL}/users/${parent.owner}`);
    },
  },
};
