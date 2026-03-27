import { UnexpectedError } from '../errors/unexpectedError.js';
import { lastQuestionsSchemaVersion, QuestionsSchemaVersion } from '../services/gameService.js';
import { Question } from '../types';

export const validateQuestions = (
  questions: Question[],
  schemaVersion: QuestionsSchemaVersion = lastQuestionsSchemaVersion
) => {
  const validQuestions = questions.filter((question) => {
    if (schemaVersion === QuestionsSchemaVersion.V1) {
      if (typeof question.text !== 'string' || question.text.length === 0) {
        return false;
      }

      if (
        !Array.isArray(question.options) ||
        question.options.length !== 4 ||
        !question.options.every((option) => typeof option === 'string' && option.length > 0)
      ) {
        return false;
      }

      if (
        typeof question.correctIndex !== 'number' ||
        !Number.isInteger(question.correctIndex) ||
        question.correctIndex < 0 ||
        question.correctIndex > 3
      ) {
        return false;
      }

      if (typeof question.timeLimitSec !== 'number' || question.timeLimitSec <= 0) {
        return false;
      }

      return true;
    } else {
      throw new UnexpectedError('Unsupported questions schema version');
    }
  });

  if (validQuestions.length !== questions.length) {
    throw new UnexpectedError('Invalid questions');
  }
};
