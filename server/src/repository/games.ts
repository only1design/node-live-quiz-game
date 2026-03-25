import { GameStatus, IGame } from '@shared/types/game.js';
import { randomUUID } from 'node:crypto';
import { generateRoomCode } from '../utils/roomCode.js';

const games: IGame[] = [];
const lifecycleControllers = new Map<string, AbortController>();

export const gamesRepository = {
  getGameByCode: (code: IGame['code']) => games.find((game) => game.code === code),
  getGameById: (id: IGame['id']) => games.find((game) => game.id === id),
  createGame: (game: Pick<IGame, 'questions' | 'hostId'>) => {
    const newGame: IGame = {
      ...game,
      code: generateRoomCode(),
      id: randomUUID(),
      players: [],
      status: GameStatus.WAITING,
      currentQuestion: -1,
    };
    games.push(newGame);

    lifecycleControllers.set(newGame.id, new AbortController());

    return newGame;
  },
  getLifecycleController: (gameId: IGame['id']) => lifecycleControllers.get(gameId),
  deleteLifecycleController: (gameId: IGame['id']) => lifecycleControllers.delete(gameId),
};
