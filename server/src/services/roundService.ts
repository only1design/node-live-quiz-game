import { AnswerData, Game, OutgoingType, Player, PlayerResult, User } from '../types';
import { broadcast } from './connectionService.js';
import { getGameParticipantsConnections, iterateGameQuestion } from './gameService.js';

const BASE_POINTS = 1000;

export const initRound = (game: Game) => {
  const question = game.questions[game.currentQuestion];

  game.questionTimer = setTimeout(() => {
    iterateGameQuestion(game);
  }, question.timeLimitSec * 1000);
  game.questionStartTime = Date.now();
  game.playerAnswers = new Map();

  const participantsConnections = getGameParticipantsConnections(game);

  broadcast(participantsConnections, OutgoingType.QUESTION, {
    text: question.text,
    options: question.options,
    timeLimitSec: question.timeLimitSec,
    questionNumber: game.currentQuestion + 1,
    totalQuestions: game.questions.length,
  });
};

export const closeRound = async (game: Game) => {
  game.questionTimer?.close();

  const playerResults = [];

  for (const player of game.players) {
    const playerResult = getPlayerResults(game, player);
    player.score = playerResult.totalScore;
    playerResults.push(playerResult);
  }

  const participantsConnections = getGameParticipantsConnections(game);

  broadcast(participantsConnections, OutgoingType.QUESTION_RESULT, {
    questionIndex: game.currentQuestion,
    correctIndex: game.questions[game.currentQuestion].correctIndex,
    playerResults,
  });

  deleteRound(game);

  // Give some time to participants to get acquired with a round result before the next step
  await new Promise((resolve) => setTimeout(resolve, 7_000));
};

export const getPlayerResults = (game: Game, player: Player): PlayerResult => {
  const playerAnswer = game?.playerAnswers?.get(player.index);

  const playerResult: PlayerResult = {
    name: player.name,
    answered: !!playerAnswer,
    correct: false,
    pointsEarned: 0,
    totalScore: player.score,
  };

  const question = game.questions[game.currentQuestion];

  if (!playerResult.answered || playerAnswer === undefined) {
    return playerResult;
  }

  const { correctIndex, timeLimitSec } = question;
  const { answerIndex, timestamp } = playerAnswer;
  const { questionStartTime } = game;

  playerResult.correct = answerIndex === correctIndex;

  if (!playerResult.correct || questionStartTime === undefined) {
    return playerResult;
  }

  const timeLimit = timeLimitSec * 1000;
  const answerTime = timestamp - questionStartTime;
  const timeRemaining = timeLimit - answerTime;

  playerResult.pointsEarned = Math.ceil(BASE_POINTS * (timeRemaining / timeLimit));
  playerResult.totalScore += playerResult.pointsEarned;

  return playerResult;
};

export const isRoundInit = (game: Game) => Boolean(game.questionTimer);

export const deleteRound = (game: Game) => {
  delete game.questionTimer;
  delete game.questionStartTime;
  delete game.playerAnswers;
};

export const saveQuestionAnswer = (
  game: Game,
  playerIndex: User['index'],
  answerIndex: AnswerData['answerIndex']
) => {
  game?.playerAnswers?.set(playerIndex, {
    answerIndex,
    timestamp: Date.now(),
  });
};

export const getPendingPlayers = (game: Game) => {
  return game.players.filter((player) => {
    const connection = player.ws;
    const answer = game?.playerAnswers?.get(player.index);

    return !answer && connection;
  });
};

export const onPendingPlayersChange = (game: Game) => {
  if (!getPendingPlayers(game).length) {
    iterateGameQuestion(game);
  }
};
