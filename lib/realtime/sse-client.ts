/**
 * Human-readable messages for each of expected error code from the server.
 */
const statusMessages: Record<number, string> = {
  400: 'Ваш запрос не является корректным. Повторите попытку с иным запросом.',
  401: 'Для выполнения данного действия требуется войти в аккаунт.',
  409: 'В данный момент уже выполняется другой запрос. Пожалуйста, дождитесь его завершения.',
  422: 'Запрос на выполнение содержит некорректные данные.',
  429: 'Вы выполняете слишком много запросов. Повторите попытку чуть позже.',
  500: 'Произошла внутренняя ошибка сервера. Пожалуйста, зарепорьте эту ошибку.',
  502: 'Не удаётся исполнить Ваш запрос. Если ошибка повторяется, пожалуйста, зарепорьте её.',
  504: 'Наш сервер не отвечает. Пожалуйста, повторите попытку позже.',
};

/**
 * Callback hooks for the SSE client lifecycle.
 */
interface Callbacks {
  /**
   * Called when the SSE connection is successfully opened.
   */
  onConnectionOpen?: () => void;
  /**
   * Called when an SSE event is received.
   *
   * @param event Event name (defaults to "message").
   * @param data Parsed event payload.
   */
  onEvent?: (event: string, data: unknown) => void;
  /**
   * Called when an error occurs during connection, parsing, or message
   * handling.
   *
   * @param error The caught error.
   */
  onError?: (error: Error) => void;
  /**
   * Called when the SSE connection is closed normally.
   */
  onConnectionClose?: () => void;
}

/**
 * Creates a Server-Sent Events (SSE) client using the Fetch API.
 *
 * This function establishes a streaming connection to an SSE endpoint,
 * parses incoming events, and dispatches them via provided callbacks.
 *
 * @param callbacks Object of callbacks to call on certain actions.
 * @param endpoint Endpoint to execute `fetch` against of.
 * @param init Initial request data.
 */
export async function createSSEClient(callbacks: Callbacks, endpoint: string, init?: RequestInit) {
  let buffer = '';
  const controller = new AbortController(); // TODO: maybe expose a `stop` method?

  async function connect() {
    const response = await fetch(endpoint, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'text/event-stream',
        ...init?.headers,
      },
    });
    console.log('Got initial response from the SSE endpoint with status', response.status);

    if (response.status === 401) {
      console.log('Attempting to refresh/issue execution token for SSE connection');
      const tokenResponse = await fetch('/api/token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      });

      console.log('Got response from token endpoint with status', tokenResponse.status);
      if (!tokenResponse.ok) {
        const message =
          statusMessages[response.status] ??
          `Получен неожиданный ответ: ${response.statusText} (${response.status}).`;
        callbacks.onError?.(new Error(message));
        return;
      }
      return connect();
    }

    if (!response.ok || !response.body) {
      const message =
        statusMessages[response.status] ??
        `Получен неожиданный ответ: ${response.statusText} (${response.status}).`;
      callbacks.onError?.(new Error(message));
      return;
    }

    callbacks.onConnectionOpen?.();
    const decoder = new TextDecoder();
    const reader = response.body.getReader();

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split('\n\n');
      buffer = events.pop() ?? '';

      for (const rawEvent of events) {
        // got an empty event
        if (!rawEvent.trim()) {
          continue;
        }

        let event = 'message';
        const dataLines: string[] = [];

        for (const line of rawEvent.split('\n')) {
          // comment or an empty payload line
          if (line.startsWith(':')) {
            continue;
          }

          if (line.startsWith('event:')) {
            event = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataLines.push(line.slice(5).trim());
          }
        }

        try {
          const data = JSON.parse(dataLines.join('\n')); // TODO: make this configurable
          callbacks.onEvent?.(event, data);
        } catch (error) {
          callbacks.onError?.(error as Error);
        }
      }
    }

    callbacks.onConnectionClose?.();
  }

  try {
    await connect();
  } catch (error) {
    if ((error as any).name !== 'AbortError') {
      callbacks.onError?.(error as Error);
    }
  }

  return () => controller.abort();
}
