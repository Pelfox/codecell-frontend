import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center text-center">
      {/* Title/Heading */}
      <div className="relative flex items-center justify-center py-16">
        <div className="absolute text-[10rem] font-extrabold tracking-widest text-muted select-none">
          404
        </div>
        <h1 className="relative text-4xl font-bold">Страница не найдена</h1>
      </div>

      {/* Description */}
      <p className="mt-3 text-muted-foreground">
        Мы не можем найти страницу, которую вы ищете. Возможно, она была удалена или переименована.
      </p>

      {/* CTA */}
      <div className="mt-8">
        <Button asChild>
          <Link href="/">Домой</Link>
        </Button>
      </div>
    </div>
  );
}
