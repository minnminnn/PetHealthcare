"use client";

interface AccountType {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface AccountTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  types: AccountType[];
  disabled?: boolean;
}

export function AccountTypeSelector({
  value,
  onChange,
  types,
  disabled = false,
}: AccountTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {types.map((type) => (
        <button
          key={type.id}
          type="button"
          onClick={() => onChange(type.id)}
          disabled={disabled}
          className={`rounded-[12px] border-2 p-3.5 text-left transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${
            value === type.id
              ? "border-[#D85F53] dark:border-[#EF7569] bg-[#FFE4DF] dark:bg-[rgba(239,117,105,0.14)]"
              : "border-[#D1D2CC] dark:border-white/14 hover:border-[#D85F53]/50 dark:hover:border-[#EF7569]/50"
          }`}
          aria-pressed={value === type.id}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex-shrink-0 ${
                value === type.id
                  ? "text-[#D85F53] dark:text-[#EF7569]"
                  : "text-[#676964] dark:text-[#B7B8B2]"
              }`}
            >
              {type.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-[#20211F] dark:text-[#F1F1ED]">
                {type.label}
              </div>
              <div className="text-xs text-[#676964] dark:text-[#B7B8B2] mt-1 line-clamp-2">
                {type.description}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
