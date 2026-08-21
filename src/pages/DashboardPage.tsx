import { useEffect, useState } from 'react'
import { Button } from '../components/ui'
import { ChangePasswordModal } from '../components/auth'
import { jobPostingApi, tenantApi } from '../api'
import type { JobPostingListItem } from '../api'

export default function DashboardPage() {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [postings, setPostings] = useState<JobPostingListItem[]>([])
  const [isLoadingPostings, setIsLoadingPostings] = useState(true)
  const [postingsError, setPostingsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadPostings = async () => {
      setIsLoadingPostings(true)
      setPostingsError(null)
      try {
        const activeTenantId = await tenantApi.resolveActiveTenantId()
        if (!activeTenantId) {
          throw new Error('Tenant identifier not found.')
        }

        const res = await jobPostingApi.getJobPostingsPaginated(activeTenantId, {
          pageNumber: 1,
          pageSize: 20,
        })

        const isOk = Boolean(res.isSuccess || res.succeeded)
        if (!isOk) {
          throw new Error(
            res.message ||
              res.messages?.join('. ') ||
              'Failed to load salary bands.'
          )
        }

        if (!cancelled) setPostings(Array.isArray(res.data) ? res.data : [])
      } catch (err: unknown) {
        if (!cancelled) {
          setPostingsError(
            err instanceof Error ? err.message : 'Failed to load salary bands.'
          )
        }
      } finally {
        if (!cancelled) setIsLoadingPostings(false)
      }
    }

    loadPostings()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your organization's HR setup.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsChangePasswordOpen(true)}
        >
          Change password
        </Button>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-800">Salary bands</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Job postings configured for your organization.
        </p>

        {isLoadingPostings && (
          <div className="mt-4 space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        )}

        {!isLoadingPostings && postingsError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {postingsError}
          </div>
        )}

        {!isLoadingPostings && !postingsError && postings.length === 0 && (
          <p className="mt-4 text-xs text-slate-500">
            No salary bands yet. Complete onboarding to configure them.
          </p>
        )}

        {!isLoadingPostings && !postingsError && postings.length > 0 && (
          <ul className="mt-4 divide-y divide-slate-100">
            {postings.map((posting, index) => (
              <li
                key={posting.id || index}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <span className="font-medium text-slate-700">
                  Band {index + 1}
                </span>
                <span className="font-mono text-xs text-slate-500">
                  {posting.minimumSalary?.toLocaleString()} —{' '}
                  {posting.maximumSalary?.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  )
}
