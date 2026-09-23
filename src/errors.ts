export class LibraryFetchError extends Error {
  public readonly statusCode: number;

  constructor(
    message: string,
    statusCode: number,
  ) {
    super(message);
    this.name = "LibraryFetchError";
    this.statusCode = statusCode;
  }
}
