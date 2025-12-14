import type { MessageLevel } from '@/lib/types/server-message';

/**
 * Converts message level into a set of class names for the log message.
 *
 * @param level Level of the log message.
 * @returns A set of class names for this specific level.
 */
function levelToClassNames(level: MessageLevel) {
  switch (level) {
    case 0:
      return 'text-black font-mono';
    case 1:
      return 'text-red-500 font-mono';
    case 2:
      return 'text-neutral-500';
    case 3:
      return 'text-neutral-700';
    case 4:
      return 'text-red-500';
    default:
      return 'text-neutral-700';
  }
}

interface LogMessageProps {
  receivedAt: Date;
  level: MessageLevel;
  message: string;
}

export function LogMessage({ receivedAt, level, message }: LogMessageProps) {
  return (
    <div className="flex items-center justify-start gap-1.5 text-sm bg-background hover:bg-accent transition-colors w-full px-3 py-1">
      <span className="select-none text-neutral-400 text-xs tabular-nums">
        {receivedAt.toLocaleTimeString('ru')}
      </span>
      <span className={levelToClassNames(level)}>{message}</span>
    </div>
  );
}
