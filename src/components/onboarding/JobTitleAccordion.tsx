import { Button, TextInput } from '../ui'
import { IconChevronDown, IconChevronUp, IconPlus, IconX } from '@tabler/icons-react'

export interface JobTitleAccordionProps {
  department: string
  titles: string[]
  suggestions: string[]
  isOpen: boolean
  draftInput: string
  onToggle: () => void
  onAddSuggestion: (suggestion: string) => void
  onAddCustom: () => void
  onDraftChange: (value: string) => void
  onRemoveTitle: (title: string) => void
}

export function JobTitleAccordion({
  department,
  titles,
  suggestions,
  isOpen,
  draftInput,
  onToggle,
  onAddSuggestion,
  onAddCustom,
  onDraftChange,
  onRemoveTitle,
}: JobTitleAccordionProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all shadow-xs">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50/50 sm:p-5"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base font-semibold text-slate-800">{department}</span>
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
            {titles.length}
          </span>
        </div>
        <div className="text-slate-400">
          {isOpen ? (
            <IconChevronUp className="size-5" aria-hidden="true" />
          ) : (
            <IconChevronDown className="size-5" aria-hidden="true" />
          )}
        </div>
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="border-t border-slate-100 px-4 pb-5 pt-3 sm:px-5">
          {/* Active Titles Chips */}
          {titles.length === 0 ? (
            <p className="mb-3 text-xs text-slate-400">No titles added yet</p>
          ) : (
            <div className="mb-4 flex flex-wrap gap-2">
              {titles.map((title) => (
                <span
                  key={title}
                  className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/60 py-1 pl-3 pr-2 text-xs font-medium text-indigo-700"
                >
                  {title}
                  <button
                    type="button"
                    onClick={() => onRemoveTitle(title)}
                    aria-label={`Remove ${title}`}
                    className="rounded-full p-0.5 text-indigo-400 transition-colors hover:bg-indigo-200/50 hover:text-indigo-800"
                  >
                    <IconX className="size-3.5" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Suggestions Row */}
          {suggestions.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-slate-500">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => onAddSuggestion(suggestion)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Title Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onAddCustom()
            }}
            className="flex items-center gap-2"
          >
            <div className="flex-1">
              <TextInput
                placeholder="Add custom title..."
                value={draftInput}
                onChange={(e) => onDraftChange(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              disabled={!draftInput.trim()}
              className="shrink-0"
            >
              <IconPlus className="size-4" aria-hidden="true" />
              Add
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
