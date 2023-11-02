interface ILoggerMetadata {
  module: string;
  [key: string]: unknown;
}

interface ILogger {
  debug(message: string, metadata: ILoggerMetadata): void;
  info(message: string, metadata: ILoggerMetadata): void;
  warn(message: string, metadata: ILoggerMetadata): void;
  error(message: string, metadata: ILoggerMetadata): void;
}

export { ILogger, ILoggerMetadata };
