import { usersRepository } from '../repository/users.js';
import { send } from '../services/connectionService.js';
import { createUser } from '../services/usersService';
import { IncomingType, OutgoingType } from '../types';
import { HandlerArgs } from './index';

export const register = ({ data, connection }: HandlerArgs<IncomingType.REG>) => {
  const { name, password } = data;

  const existedUser = usersRepository.getUserByName(name);

  if (!existedUser) {
    const user = createUser(name, password, connection);

    const responseData = {
      name: user.name,
      index: user.index,
      error: false,
      errorText: '',
    };

    return send(connection, OutgoingType.REG, responseData);
  } else if (existedUser.password === password) {
    if (existedUser.ws) {
      const responseData = {
        name: existedUser.name,
        index: existedUser.index,
        error: true,
        errorText: 'The user is currently online. Only one session per user is allowed.',
      };

      return send(connection, OutgoingType.REG, responseData);
    }

    existedUser.ws = connection;

    const responseData = {
      name: existedUser.name,
      index: existedUser.index,
      error: false,
      errorText: '',
    };

    return send(connection, OutgoingType.REG, responseData);
  } else {
    const responseData = {
      name: existedUser.name,
      index: existedUser.index,
      error: true,
      errorText: 'The user with this name already exists. Password is incorrect.',
    };

    return send(connection, OutgoingType.REG, responseData);
  }
};
