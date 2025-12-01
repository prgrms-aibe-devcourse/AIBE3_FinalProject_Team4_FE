import { SlotProvider } from './Slot';

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return <SlotProvider>{children}</SlotProvider>;
}
