import { randomUUID } from 'node:crypto';
import { GameStatus } from '../services/gameService';
import { Game } from '../types';
import { generateRoomCode } from '../utils/roomCode.js';

const games: Game[] = [];
const lifecycleControllers = new Map<string, AbortController>();

export const gamesRepository = {
  getGameByCode: (code: Game['code']) => games.find((game) => game.code === code),
  getGameById: (id: Game['id']) => games.find((game) => game.id === id),
  createGame: (game: Pick<Game, 'questions' | 'hostId'>) => {
    const newGame: Game = {
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
  getLifecycleController: (gameId: Game['id']) => lifecycleControllers.get(gameId),
  deleteLifecycleController: (gameId: Game['id']) => lifecycleControllers.delete(gameId),
};
