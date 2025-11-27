interface Props {
  actions: string[];
}

export default function ActionBubble({ actions }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {actions.map((action) => (
        <button
          key={action}
          className="px-4 py-2 text-xs rounded-xl bg-[#F0EAF8] text-[#6A5A90] hover:bg-[#E6DEF3] transition"
        >
          {action}
        </button>
      ))}
    </div>
  );
}
