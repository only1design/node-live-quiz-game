import { UnexpectedError } from '../errors/unexpectedError.js';
import { gamesRepository } from '../repository/games.js';
import { Game, Question, OutgoingType, Score, User } from '../types';
import { addDisposableListener, broadcast, getConnectionByUser } from './connectionService.js';
import { closeRound, isRoundInit, initRound, onPendingPlayersChange } from './roundService.js';
import { getUserByIndex } from './usersService.js';

export enum QuestionsSchemaVersion {
  V1 = 1,
}

export enum GameStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
}

export const lastQuestionsSchemaVersion = QuestionsSchemaVersion.V1;

export const getGameByCode = (code: Game['code']) => {
  const game = gamesRepository.getGameByCode(code);

  if (!game) {
    throw new UnexpectedError("Game doesn't exist");
  }

  return game;
};

export const getGameById = (id: Game['id']) => {
  const game = gamesRepository.getGameById(id);

  if (!game) {
    throw new UnexpectedError("Game doesn't exist");
  }

  return game;
};

export const createGame = (hostId: Game['hostId'], questions: Question[]) => {
  return gamesRepository.createGame({ questions, hostId: String(hostId) });
};

export const getLifecycleController = (game: Game) => {
  const lifecycleController = gamesRepository.getLifecycleController(game.id);

  if (!lifecycleController) {
    throw new UnexpectedError('Game lifecycle controller not found');
  }

  return lifecycleController;
};

export const joinUserToGame = (user: User, game: Game) => {
  game.players.push({ name: user.name, index: String(user.index), score: 0 });

  const playersConnections = getGamePlayersConnections(game);

  onPlayerListChange(game);

  broadcast(playersConnections, OutgoingType.PLAYER_JOINED, {
    playerName: user.name,
    playerCount: game.players.length,
  });
};

export const onPlayerListChange = (game: Game) => {
  const participantsConnections = getGameParticipantsConnections(game);

  broadcast(participantsConnections, OutgoingType.UPDATE_PLAYERS, game.players);
};

export const getGamePlayersConnections = (game: Game) => {
  return game.players
    .map((player) => getConnectionByUser(getUserByIndex(player.index)))
    .filter((ws) => ws !== undefined);
};

export const getGameHostConnection = (game: Game) => {
  return getConnectionByUser(getUserByIndex(game.hostId));
};

export const getGameParticipantsConnections = (game: Game) => {
  const players = getGamePlayersConnections(game);
  const host = getGameHostConnection(game);

  return [...players, host].filter((ws) => ws !== undefined);
};

export const importQuestions = (game: Game, questions: Question[]) => {
  game.questions = questions;
};

export const startGame = (game: Game) => {
  game.status = GameStatus.IN_PROGRESS;

  const controller = getLifecycleController(game);
  const playersConnections = getGamePlayersConnections(game);

  for (const connection of playersConnections) {
    addDisposableListener(connection, 'close', () => onPendingPlayersChange(game), controller);
  }

  iterateGameQuestion(game);
};

export const iterateGameQuestion = (game: Game) => {
  if (game.status !== GameStatus.IN_PROGRESS) {
    throw new UnexpectedError('Game is not in progress.');
  }

  if (isRoundInit(game)) {
    closeRound(game);
  }

  if (game.currentQuestion === game.questions.length - 1) {
    finishGame(game);
    return;
  }

  game.currentQuestion++;
  initRound(game);
};

export const finishGame = (game: Game) => {
  game.status = GameStatus.FINISHED;

  const scoreboard: Score[] = [...game.players]
    .sort((playerA, playerB) => playerB.score - playerA.score)
    .reduce<Score[]>((acc, cur, index) => {
      const prevScore = index > 0 ? acc[index - 1].score : 0;
      const prevRank = index > 0 ? acc[index - 1].rank : 0;

      // Use the same rank for users with the same score
      const rank = cur.score === prevScore ? prevRank : prevRank + 1;

      const score = {
        name: cur.name,
        score: cur.score,
        rank: rank,
      };

      acc.push(score);

      return acc;
    }, []);

  const controller = getLifecycleController(game);
  const participantsConnections = getGameParticipantsConnections(game);

  broadcast(participantsConnections, OutgoingType.GAME_FINISHED, {
    scoreboard,
  });
  controller.abort();

  gamesRepository.deleteLifecycleController(game.id);
};

export const terminateGame = (game: Game) => {
  if (isRoundInit(game)) {
    closeRound(game);
  }
  finishGame(game);
};
