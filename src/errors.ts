export class AnnasArchiveError extends Error {
  public readonly statusCode: number;

  constructor(
    message: string,
    statusCode: number,
  ) {
    super(message);
    this.name = "AnnasArchiveError";
    this.statusCode = statusCode;
  }
}
