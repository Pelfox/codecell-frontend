import type { ChartConfig } from '../ui/chart';
import type { Message } from '@/lib/types/server-message';
import { ChartAreaIcon } from 'lucide-react';
import { Line, LineChart, XAxis } from 'recharts';
import { Button } from '../ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface StatisticsDialogProps {
  messages: Message[];
}

function formatBytes(bytes: number) {
  if (bytes === 0) {
    return '0Б';
  }
  const scale = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const formatted = Math.floor(Math.log(bytes) / Math.log(scale));
  return `${(bytes / scale ** formatted).toFixed(1)} ${sizes[formatted]}`;
}

function TooltipContent({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <span className="text-muted-foreground">{name}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

const chartConfig = {
  memory: {
    label: 'Память',
    color: '#4A90E2',
  },
  cpu: {
    label: 'Процессор',
    color: '#F5A623',
  },
} satisfies ChartConfig;

function StatisticsChart({ messages }: StatisticsDialogProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-50 w-full">
      <LineChart
        accessibilityLayer
        data={messages.map((message) => ({
          timestamp: message.receivedAt.toISOString(),
          memory: message.statistics?.memoryUsed,
          cpu: message.statistics?.cpuPercent,
        }))}
      >
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value: string) => new Date(value).toLocaleTimeString('ru')}
        />

        <ChartTooltip
          content={<ChartTooltipContent />}
          labelFormatter={(value: string) => new Date(value).toLocaleTimeString('ru')}
          formatter={(value: any, name: string) => {
            if (name === 'cpu') {
              return (
                <TooltipContent name={chartConfig[name].label} value={`${value.toFixed(1)}%`} />
              );
            }
            if (name === 'memory') {
              return <TooltipContent name={chartConfig[name].label} value={formatBytes(value)} />;
            }
            return <TooltipContent name={name} value={value} />;
          }}
        />

        <Line
          yAxisId="cpu"
          type="monotone"
          dataKey="cpu"
          stroke="var(--color-cpu)"
          strokeWidth={2}
          dot={false}
        />

        <Line
          yAxisId="memory"
          type="monotone"
          dataKey="memory"
          stroke="var(--color-memory)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

export function StatisticsDialog({ messages }: StatisticsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon-sm">
          <ChartAreaIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Мониторинг</DialogTitle>
          <DialogDescription>Информация о состоянии Вашей программы.</DialogDescription>
        </DialogHeader>
        {messages.length === 0 ? (
          <span className="text-center text-sm text-foreground">
            Здесь появится статистика Вашей программы.
          </span>
        ) : (
          <StatisticsChart messages={messages} />
        )}
      </DialogContent>
    </Dialog>
  );
}
