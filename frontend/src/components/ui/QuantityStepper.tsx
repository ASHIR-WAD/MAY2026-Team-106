import { Button } from "./Button";

export interface QuantityStepperProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max: number;
}

export function QuantityStepper({ value, onChange, min = 0, max }: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-1 bg-surface border border-border rounded-md p-1 w-max">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        type="button"
        className="!h-7 !w-7 !p-0"
      >
        -
      </Button>
      <span className="text-text-primary text-sm font-semibold w-10 text-center select-none">
        {value}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        type="button"
        className="!h-7 !w-7 !p-0"
      >
        +
      </Button>
    </div>
  );
}
