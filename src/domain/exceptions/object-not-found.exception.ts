import ExtendableError from 'ts-error';

export class ObjectNotFoundException extends ExtendableError {
  constructor(objectName: string, id: string) {
    super(`${objectName} with ID ${id} not found`);
  }
}
