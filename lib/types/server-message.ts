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
   * Informational message from an orchestrator (runner) process.
   */
  INFO = 3,
  /**
   * Error message from an orchestrator (runner) process.
   */
  ERROR = 4,
  /**
   * Message containing system resource usage statistics.
   */
  STATISTICS = 5,
  /**
   * Message type could not be determined or is unsupported.
   */
  UNRECOGNIZED = -1,
}

/**
 * Represents system resource usage statistics at a point in time.
 */
export interface StatisticsMessage {
  /**
   * Current CPU utilization as a percentage.
   *
   * Range: 0-100
   * Unit: percent (%)
   */
  cpuPercent: number;
  /**
   * Amount of memory currently in use.
   *
   * Unit: bytes (B)
   */
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
  /**
   * Process exit code associated with the execution. Set only with the `level`
   * value of `MessageLevel.EXIT_CODE`.
   */
  exitCode?: number;
  /**
   * Optional system resource usage statistics captured at the time
   * this message was generated. Set only with the `level` value of `MessageLevel.STATISTICS`.
   */
  statistics?: StatisticsMessage;
  /**
   * Timestamp indicating when the message was received.
   */
  receivedAt: Date;
}
