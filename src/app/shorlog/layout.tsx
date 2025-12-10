import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  modal: ReactNode;
}

export default function ShorlogLayout({ children, modal }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/40 to-slate-50">
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8 lg:px-12 pb-16 pt-10">{children}</div>
      </main>
      {modal}
    </div>
  );
}
