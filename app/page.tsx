import type { Metadata } from 'next';
import { CodePlayground } from '@/components/playground/code-playground';

export const metadata: Metadata = {
  title: 'CodeCell',
  description: 'Онлайн-песочница с отличной скоростью и удобностью использования.',
};

export default function Home() {
  return <CodePlayground />;
}
