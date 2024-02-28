import {GraphQLError} from 'graphql';
import {MyContext} from '../types/MyContext';

const isLogged = (context: MyContext) => {
  if (!context.userdata) {
    throw new GraphQLError('Not authenticated', {
      extensions: {code: 'UNAUTHORIZED', http: {status: 401}},
    });
  }
};

const isLoggedAsAdmin = (context: MyContext) => {
  if (context.userdata?.user?.role !== 'admin') {
    throw new GraphQLError('Not authorized', {
      extensions: {code: 'UNAUTHORIZED', http: {status: 401}},
    });
  }
};

export {isLogged, isLoggedAsAdmin};
