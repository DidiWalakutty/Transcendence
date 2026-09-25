export class UserUsernameAlreadyExistsError extends Error {
  constructor() {
    super('A user with this username already exists');
    this.name = UserUsernameAlreadyExistsError.name;
  }
}
