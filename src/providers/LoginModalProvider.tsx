'use client';

import { createContext, useContext, useState } from 'react';

type LoginModalState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const LoginModalContext = createContext<LoginModalState | null>(null);

export function LoginModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <LoginModalContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const ctx = useContext(LoginModalContext);
  if (!ctx) throw new Error('useLoginModal must be inside LoginModalProvider');
  return ctx;
}
