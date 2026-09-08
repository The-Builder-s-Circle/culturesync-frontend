import React from 'react'

export const ComplianceBadges: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap text-[11px] font-medium text-slate-500">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200/60">
        🔒 SOC 2 Type II
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200/60">
        🛡️ GDPR Compliant
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200/60">
        ⚡ ISO 27001
      </span>
    </div>
  )
}
