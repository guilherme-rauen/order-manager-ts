import { Result, ValidationError } from 'express-validator';
import ExtendableError from 'ts-error';

export class ControllerValidationException extends ExtendableError {
  public constructor(errors: Result<ValidationError>) {
    super(errors.array()[0].msg as string);
  }
}
