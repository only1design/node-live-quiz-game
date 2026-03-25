export class UnexpectedError extends Error {
  constructor(message: string = 'Unexpected error') {
    super(message);
  }
}
