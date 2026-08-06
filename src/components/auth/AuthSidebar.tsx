import React from 'react'

export interface AuthSidebarProps {
  variant?: 'register' | 'login' | 'verify-otp'
  targetEmail?: string
}

export const AuthSidebar: React.FC<AuthSidebarProps> = ({
  variant = 'register',
  targetEmail = 'oriolowomustapha@gmail.com',
}) => {
  if (variant === 'login') {
    return (
      <div className="flex-1 bg-slate-950 text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden font-sans">
        {/* Background Glow */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div>
          <span className="font-mono text-xs font-semibold tracking-widest text-indigo-400 uppercase">
            WELCOME BACK
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white leading-tight">
            Good to have <br />
            you back
          </h2>

          <div className="mt-12 space-y-4 font-sans">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-base shrink-0">
                👥
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">People Analytics</h4>
                <p className="text-[11px] text-slate-400">Real-time workforce insights</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 text-base shrink-0">
                📋
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Smart Onboarding</h4>
                <p className="text-[11px] text-slate-400">Wizard-driven tenant setup</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-base shrink-0">
                ⚡
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Automated Workflows</h4>
                <p className="text-[11px] text-slate-400">Approvals, reviews, policies</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>SOC 2 Type II</span>
          <span>·</span>
          <span>GDPR</span>
          <span>·</span>
          <span>ISO 27001</span>
        </div>
      </div>
    )
  }

  if (variant === 'verify-otp') {
    return (
      <div className="flex-1 bg-slate-950 text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden font-sans">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div>
          <span className="font-mono text-xs font-semibold tracking-widest text-indigo-400 uppercase">
            EMAIL VERIFICATION
          </span>

          <div className="mt-8 w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-lg">
            ✉️
          </div>

          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white">
            Check your inbox
          </h2>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            We sent a 6-digit verification code to <br />
            <span className="font-semibold text-white">{targetEmail}</span>
          </p>

          <ul className="mt-8 space-y-3 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Check spam/junk folders</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Code expires in 5 minutes</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Use 123456 in this demo</span>
            </li>
          </ul>
        </div>

        <div className="text-[11px] text-slate-500">
          Need help? <a href="#support" className="text-indigo-400 hover:underline">Contact Support</a>
        </div>
      </div>
    )
  }

  // Register Variant (Default)
  return (
    <div className="flex-1 bg-slate-950 text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden font-sans">
      <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      <div>
        <span className="font-mono text-xs font-semibold tracking-widest text-indigo-400 uppercase">
          ENTERPRISE HR PLATFORM
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white leading-tight">
          The people platform <br />
          your team deserves
        </h2>
        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          Onboard faster, manage smarter. CultureSync centralizes HR operations across departments so you can focus on your people.
        </p>

        {/* Metrics Grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 font-sans">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="font-mono text-xl font-bold text-white">3,400+</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Organizations</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="font-mono text-xl font-bold text-white">680K+</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Employees managed</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="font-mono text-xl font-bold text-white">99.9%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Uptime SLA</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="font-mono text-xl font-bold text-white">4.9★</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Customer rating</p>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-500 font-mono">
        © 2025 CultureSync Inc. All rights reserved.
      </div>
    </div>
  )
}
