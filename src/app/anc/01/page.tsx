import type { Metadata } from 'next';
import Board from '../board';
export const metadata: Metadata = {
  title: 'ANC / 01 — 什么是 AI Native Company？',
  description: '由 Lawted 提出并持续研究的 ANC 框架：围绕 Agent，重新组织工作。',
  alternates: { canonical: '/anc/01' },
};
export default function Page() { return <Board />; }
