import * as React from 'react'

export interface DynamicListFieldProps {
  value: string[]
  onChange: (next: string[]) => void
  label?: string
  placeholder?: string
  addLabel?: string
}

/**
 * Growable list of free-text rows. Each row is a text input with a
 * trailing trash button. The trailing "+ Add" row appends a new empty
 * entry and focuses its input.
 *
 * Deleting actually splices the array — it does not blank the row in
 * place — so the indices stay packed and downstream rendering is
 * stable.
 */
export function DynamicListField({
  value,
  onChange,
  label,
  placeholder = 'Type here…',
  addLabel = 'Add',
}: DynamicListFieldProps) {
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([])

  const setRef = React.useCallback(
    (index: number) => (el: HTMLInputElement | null) => {
      inputRefs.current[index] = el
    },
    [],
  )

  const handleRowChange = (index: number, next: string) => {
    const updated = value.slice()
    updated[index] = next
    onChange(updated)
  }

  const handleDelete = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleAdd = () => {
    const nextIndex = value.length
    onChange([...value, ''])
    // Focus the new input after React commits the new row.
    requestAnimationFrame(() => {
      inputRefs.current[nextIndex]?.focus()
    })
  }

  return (
    <div className="w-full flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-text-secondary select-none">
          {label}
        </label>
      )}

      <div className="flex flex-col gap-2">
        {value.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              ref={setRef(index)}
              type="text"
              value={row}
              onChange={(e) => handleRowChange(index, e.target.value)}
              placeholder={placeholder}
              className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-secondary/50 outline-none transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent"
            />
            <button
              type="button"
              onClick={() => handleDelete(index)}
              aria-label={`Delete row ${index + 1}`}
              title="Delete"
              className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-text-secondary hover:text-danger hover:border-danger/40 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.6}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAdd}
          className="self-start inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 transition-colors px-1 py-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          {addLabel}
        </button>
      </div>
    </div>
  )
}
