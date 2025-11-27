import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  modal: ReactNode;
}

export default function ShorlogLayout({ children, modal }: Props) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
