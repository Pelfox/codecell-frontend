'use client';

import type z from 'zod';
import type { executeSchema } from '@/lib/types/execute-schema';
import type { Message } from '@/lib/types/server-message';
import { PlayIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { LogMessage } from '@/components/log-message';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { createSSEClient } from '@/lib/realtime/sse-client';
import { CodeEditor } from '../code-editor';
import { Slider } from '../ui/slider';
import { StatisticsDialog } from './statistics-dialog';

export function CodePlayground() {
  const [code, setCode] = useState('');
  const [stdin, setStdin] = useState('');
  const [timeoutSeconds, setTimeoutSeconds] = useState(20);

  const [isRunning, setIsRunning] = useState(false);
  const [outputLogs, setOutputLogs] = useState<Message[]>([]);
  const [statisticsMessages, setStatisticsMessages] = useState<Message[]>([]);

  async function handleStartClick() {
    // TODO: if `isRunning` is true, on second click cancel the operation

    const requestBody = {
      stdin: stdin.split('\n'),
      sourceCode: code,
      timeoutSeconds,
    } as z.infer<typeof executeSchema>;

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    };

    // handler for a event when connection is opened
    function onConnectionOpen() {
      setOutputLogs([]);
      setIsRunning(true);
    }

    // handler for each event from the server
    function onEvent(event: string, data: unknown) {
      if (event === 'error') {
        const eventData = data as { message: string };
        console.error('Got a server error:', eventData.message);
        toast.error('Серверная ошибка', {
          description: eventData.message || 'Неизвестная ошибка.',
        });
        return;
      }

      if (event === 'message') {
        const message: Message = {
          ...(data as Omit<Message, 'receivedAt'>),
          receivedAt: new Date(),
        };

        if (!message.statistics) {
          setOutputLogs((prev) => [...prev, message]);
        } else if (message.statistics) {
          setStatisticsMessages((prev) => [...prev, message]);
        }

        return;
      }

      console.warn('Got an unknown event:', event, data);
    }

    // handler for connection- and other errors
    function onError(error: Error) {
      toast.error('Ошибка запроса', {
        description: error.message || 'Неизвестная ошибка.',
      });
      console.error('SSE client experienced an error:', error);
    }

    // handler for connection close event
    function onConnectionClose() {
      setIsRunning(false);
    }

    await createSSEClient(
      {
        onConnectionOpen,
        onEvent,
        onError,
        onConnectionClose,
      },
      '/api/execute',
      requestOptions,
    );
  }

  return (
    <div className="flex flex-col h-dvh w-dvw">
      {/* Header */}
      <div className="w-full border-b border-border px-4 h-14 flex items-center justify-between">
        <span className="font-semibold tracking-tight">CodeCell</span>
        <div className="flex items-center justify-end gap-2">
          <StatisticsDialog messages={statisticsMessages} />
          <Button
            variant="default"
            size="icon-sm"
            type="button"
            disabled={isRunning}
            onClick={handleStartClick}
          >
            {isRunning ? <Spinner /> : <PlayIcon />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Code editor */}
        <div className="flex-1 min-h-0 md:flex-none w-full md:w-[65%] lg:w-[75%] md:border-r border-border overflow-auto overscroll-none">
          {isRunning && (
            <div className="relative w-full h-1 bg-muted overflow-hidden rounded-full">
              <div className="absolute inset-y-0 left-0 bg-sidebar-primary animate-[indeterminate1_2.1s_cubic-bezier(0.65,0.815,0.735,0.395)_infinite]" />
              <div className="absolute inset-y-0 left-0 bg-sidebar-primary animate-[indeterminate2_2.1s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
            </div>
          )}
          <CodeEditor
            disabled={isRunning}
            onContentsChange={(value) => setCode(value)}
            language="dotnet"
          />
        </div>

        {/* Sidebar */}
        <div className="flex-1 min-h-0 md:flex-none w-full md:w-[35%] lg:w-[25%] flex flex-col">
          {/* stdin */}
          <div className="p-3 border-b border-border">
            <Label className="mb-1.5">Вводные данные (stdin)</Label>
            <Textarea
              value={stdin}
              onChange={(event) => setStdin(event.currentTarget.value)}
              disabled={isRunning}
            />
            <span className="text-xs text-muted-foreground">
              * Каждая новая строчка учитывается как новый аргумент для stdin.
            </span>
            <div className="mt-3">
              <Label className="mb-3">Максимальное время выполнения</Label>
              <Slider
                defaultValue={[20]}
                value={[timeoutSeconds]}
                onValueChange={(value) => setTimeoutSeconds(value[0])}
                min={10}
                step={1}
                max={120}
              />
              <div className="mt-3 w-full flex items-center justify-between text-xs text-muted-foreground">
                <span>10 сек.</span>
                <span>{timeoutSeconds} сек.</span>
                <span>120 сек.</span>
              </div>
            </div>
          </div>

          {/* output */}
          <div className="p-3 flex flex-col flex-1 min-h-0">
            <Label className="mb-1.5">Вывод программы</Label>

            {outputLogs.length === 0 && (
              <div className="text-center mt-3">
                <span className="text-sm text-muted-foreground select-none">
                  Здесь будут появляться логи.
                </span>
              </div>
            )}

            <div className="-mx-3 flex-1 min-h-0 overflow-auto overscroll-none">
              {outputLogs.map((entry, index) => (
                <LogMessage key={index} {...entry} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
