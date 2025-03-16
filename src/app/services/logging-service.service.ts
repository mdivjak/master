import { Injectable, isDevMode } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private logLevel: LogLevel = isDevMode() ? LogLevel.DEBUG : LogLevel.WARN;

  debug(message: string, ...optionalParams: any[]) {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.debug(message, ...optionalParams);
    }
  }

  info(message: string, ...optionalParams: any[]) {
    if (this.logLevel <= LogLevel.INFO) {
      console.info(message, ...optionalParams);
    }
  }

  warn(message: string, ...optionalParams: any[]) {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(message, ...optionalParams);
    }
  }

  error(message: string, ...optionalParams: any[]) {
    if (this.logLevel <= LogLevel.ERROR) {
      console.error(message, ...optionalParams);
    }
  }
}

enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR
}