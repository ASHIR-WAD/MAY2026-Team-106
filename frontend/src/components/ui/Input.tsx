import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, id, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const isPassword = type === "password";
    const currentType = isPassword && showPassword ? "text" : type;

    return (
      <div className="w-full flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-text-secondary select-none">
          {label}
        </label>
        <div className="relative w-full">
          <input
            id={inputId}
            type={currentType}
            ref={ref}
            className={`flex h-10 w-full rounded-md border bg-surface px-3 py-2 text-text-primary placeholder:text-text-secondary/50 outline-none transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-40 ${
              error ? "border-danger focus-visible:ring-danger" : "border-border"
            } ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm my-1 mr-1 px-1.5 bg-surface"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          )}
        </div>
        {error && <p className="text-sm text-danger mt-0.5">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
