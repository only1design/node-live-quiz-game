import { IGame, IPlayer } from '@shared/types/game.js';
import { IPlayerResult, OutgoingType } from '@shared/types/ws.js';
import { UnexpectedError } from '../errors/unexpectedError.js';
import { IPlayerAnswer, IRound, roundsRepository } from '../repository/round.js';
import { broadcast, getConnectionByUser } from './connectionService.js';
import { getGameParticipantsConnections, iterateGameQuestion } from './gameService.js';
import { getUserByIndex } from './usersService.js';

const BASE_POINTS = 1000;

export const initRound = (game: IGame) => {
  const question = game.questions[game.currentQuestion];

  const timer = setTimeout(() => {
    iterateGameQuestion(game);
  }, question.timeLimitSec * 1000);

  roundsRepository.createRound(game.id, game.currentQuestion, timer);

  const participantsConnections = getGameParticipantsConnections(game);

  broadcast(participantsConnections, OutgoingType.QUESTION, {
    text: question.text,
    options: question.options,
    timeLimitSec: question.timeLimitSec,
    questionNumber: game.currentQuestion + 1,
    totalQuestions: game.questions.length,
  });
};

export const closeRound = (game: IGame) => {
  const round = getRoundByGameId(game.id);

  round.timer.close();

  const playerResults = [];

  for (const player of game.players) {
    const playerResult = getPlayerResults(game, round, player);
    player.score = playerResult.totalScore;
    playerResults.push(playerResult);
  }

  const participantsConnections = getGameParticipantsConnections(game);

  broadcast(participantsConnections, OutgoingType.QUESTION_RESULT, {
    questionIndex: round.questionIndex,
    correctIndex: game.questions[round.questionIndex].correctIndex,
    playerResults,
  });

  deleteRoundByGameId(game);
};

export const getPlayerResults = (game: IGame, round: IRound, player: IPlayer): IPlayerResult => {
  const playerAnswer = round.playerAnswers[player.index];

  const playerResult: IPlayerResult = {
    name: player.name,
    answered: !!playerAnswer,
    correct: false,
    pointsEarned: 0,
    totalScore: player.score,
  };

  const question = game.questions[round.questionIndex];

  if (!playerResult.answered) {
    return playerResult;
  }

  const { correctIndex, timeLimitSec } = question;
  const { optionsIndex: answerIndex, timestamp: answerTimestamp } = playerAnswer;
  const { startedAt: roundStartedAt } = round;

  playerResult.correct = answerIndex === correctIndex;

  if (!playerResult.correct) {
    return playerResult;
  }

  const timeLimit = timeLimitSec * 1000;
  const answerTime = answerTimestamp - roundStartedAt;
  const timeRemaining = timeLimit - answerTime;

  playerResult.pointsEarned = BASE_POINTS * (timeRemaining / timeLimit);
  playerResult.totalScore += playerResult.pointsEarned;

  return playerResult;
};

export const getRoundByGameId = (gameId: IGame['id']) => {
  const round = roundsRepository.getRoundByGameId(gameId);

  if (!round) {
    throw new UnexpectedError('Game round not found');
  }

  return round;
};

export const deleteRoundByGameId = (game: IGame) => {
  const roundDeleted = roundsRepository.deleteRound(game.id);

  if (!roundDeleted) {
    throw new UnexpectedError('Game round not found');
  }
};

export const saveQuestionAnswer = (
  round: IRound,
  playerIndex: IPlayerAnswer['playerId'],
  optionsIndex: IPlayerAnswer['optionsIndex']
) => {
  round.playerAnswers[playerIndex] = {
    playerId: playerIndex,
    optionsIndex,
    timestamp: Date.now(),
  };
};

export const getPendingPlayers = (game: IGame) => {
  const round = getRoundByGameId(game.id);

  return game.players.filter((player) => {
    const user = getUserByIndex(player.index);
    const connection = getConnectionByUser(user);
    const answer = round.playerAnswers[player.index];

    return !answer && connection;
  });
};

export const onPendingPlayersChange = (game: IGame) => {
  if (!getPendingPlayers(game).length) {
    iterateGameQuestion(game);
  }
};
