import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  modal: ReactNode;
}

export default function ShorlogLayout({ children, modal }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/40 to-slate-50">
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pb-16 pt-10">{children}</div>
      </main>
      {modal}
    </div>
  );
}
