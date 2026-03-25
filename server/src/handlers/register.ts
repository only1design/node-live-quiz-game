import { usersRepository } from '../repository/users.js';
import { associateUserWithConnection, send } from '../services/connectionService.js';
import { IncomingType, OutgoingType } from '../types';
import { HandlerArgs } from './index';

export const register = ({ data, connection }: HandlerArgs<IncomingType.REG>) => {
  const { name, password } = data;

  const existedUser = usersRepository.getUserByName(name);

  if (!existedUser) {
    const user = usersRepository.createUser({ name, password });

    const responseData = {
      name: user.name,
      index: user.index,
      error: false,
      errorText: '',
    };

    associateUserWithConnection(connection, user);

    return send(connection, OutgoingType.REG, responseData);
  } else if (existedUser.password === password) {
    const responseData = {
      name: existedUser.name,
      index: existedUser.index,
      error: false,
      errorText: '',
    };

    associateUserWithConnection(connection, existedUser);

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
