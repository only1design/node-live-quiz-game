export interface IUser {
  index: number;
  name: string;
  password: string;
}

let userIndex = 0;
const getUniqueUserIndex = () => userIndex++;

const users: IUser[] = [];

export const usersRepository = {
  getUserByName: (name: string) => users.find((user) => user.name === name),
  getUserByIndex: (index: number) => users.find((user) => user.index === index),
  createUser: (user: Omit<IUser, 'index'>) => {
    const newUser: IUser = { ...user, index: getUniqueUserIndex() };
    users.push(newUser);
    return newUser;
  },
};
