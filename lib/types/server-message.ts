/**
 * Represents the type or severity of a message emitted by a server process.
 */
export enum MessageLevel {
  /**
   * Standard output from a process (stdout).
   */
  STDOUT = 0,
  /**
   * Standard error output from a process (stderr).
   */
  STDERR = 1,
  /**
   * Process exit code message.
   */
  EXIT_CODE = 2,
  /**
   * Informational message from a orchestrator (runner) process.
   */
  INFO = 3,
  /**
   * Error message from a orchestrator (runner) process.
   */
  ERROR = 4,
  /**
   * Message type could not be determined or is unsupported.
   */
  UNRECOGNIZED = -1,
}

export interface StatisticsMessage {
  cpuPercent: number;
  memoryUsed: number;
}

/**
 * Represents a single message for an execution request.
 */
export interface Message {
  /**
   * Unique identifier of the exection request that produced this message.
   */
  requestId: string;
  /**
   * Severity or category of the message.
   */
  level: MessageLevel;
  /**
   * Human-readable message content.
   */
  message?: string;
  exitCode?: number;
  statistics?: StatisticsMessage;
  /**
   * Timestamp indicating when the message was received.
   */
  receivedAt: Date;
}
