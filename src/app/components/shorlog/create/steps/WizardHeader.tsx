import { Step } from '../types';

interface WizardHeaderProps {
  step: Step;
  title: string;
}

export default function WizardHeader({ step, title }: WizardHeaderProps) {
  const steps = [
    { id: 1, label: '섬네일' },
    { id: 2, label: '편집' },
    { id: 3, label: '작성' },
  ];

  return (
    <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3 md:px-6 lg:px-8">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold text-slate-900 md:text-xl">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500 md:text-sm">
          쇼로그를 완성하기까지 3단계예요. ({step}/3)
        </p>
      </div>

      <ol className="flex items-center gap-2 md:gap-3" aria-label="작성 단계">
        {steps.map((s) => {
          const isActive = s.id === step;
          const isDone = s.id < step;

          return (
            <li key={s.id} className="flex items-center gap-1 text-xs md:text-sm">
              <span
                className={[
                  'flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-medium md:h-7 md:w-7',
                  isActive
                    ? 'border-[#2979FF] bg-[#2979FF] text-white'
                    : isDone
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-slate-50 text-slate-400',
                ].join(' ')}
              >
                {s.id}
              </span>
              <span
                className={
                  isActive
                    ? 'hidden text-xs font-medium text-slate-900 md:inline'
                    : 'hidden text-xs text-slate-400 md:inline'
                }
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </header>
  );
}
