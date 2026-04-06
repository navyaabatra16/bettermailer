export const EMAIL_ACTION_ICON_PATHS = [
  "M8 2l1.5 4.5H14l-3.75 2.7 1.5 4.5L8 11.2l-3.75 2.5 1.5-4.5L2 6.5h4.5z",
  "M5 5l6 6M11 5l-6 6",
  "M3 4h10M4 4v9h8V4",
  "M8 4v4l2 2",
];

export interface EmailRowProps {
  sender: string;
  subject: string;
  snippet: string;
  time: string;
  active?: boolean;
}

export default function EmailRow({
  sender,
  subject,
  snippet,
  time,
  active = false,
}: EmailRowProps) {
  return (
    <div
      className={`group flex cursor-pointer items-center gap-3 border-b border-gray-100 px-5 py-3 ${
        active ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      <input
        type="checkbox"
        className="size-4 shrink-0 rounded border-gray-300 accent-gray-600 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(event) => event.stopPropagation()}
      />

      <span className="w-36 shrink-0 truncate text-sm font-medium text-gray-800">
        {sender}
      </span>

      <div className="flex min-w-0 flex-1 items-baseline gap-1.5 overflow-hidden">
        <span className="max-w-[45%] shrink-0 truncate text-sm font-medium text-gray-800">
          {subject}
        </span>
        <span className="truncate text-sm text-gray-400">{snippet}</span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <div className="hidden items-center gap-1 group-hover:flex">
          {EMAIL_ACTION_ICON_PATHS.map((path, index) => (
            <button
              key={index}
              className="flex size-6 items-center justify-center rounded text-gray-400 hover:bg-gray-200 hover:text-gray-700"
              onClick={(event) => event.stopPropagation()}
            >
              <svg
                className="size-3.5"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d={path} />
              </svg>
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400 group-hover:hidden">{time}</span>
      </div>
    </div>
  );
}
