export class ErrorResponse {
  message: string;
  error: Error | any;
  stackTrace?: string;

  constructor(message: string, error: Error | any, stackTrace?: string) {
    this.message = message;
    this.error = error;
    this.stackTrace = stackTrace;
  }
}
