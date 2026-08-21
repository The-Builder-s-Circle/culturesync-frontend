import { apiClient } from './client'
import type { BaseApiResponse } from './auth'

/**
 * Matches CultureSync.Domain.Common.Enums.DayOfWeekOption (1 = Monday ... 7 = Sunday).
 */
export type DayOfWeekOption = 1 | 2 | 3 | 4 | 5 | 6 | 7

/**
 * Matches CultureSync.Domain.Common.Enums.PayPeriod.
 */
export const PAY_PERIOD = {
  Weekly: 1,
  BiWeekly: 2,
  SemiMonthly: 3,
  Monthly: 4,
} as const

export type PayPeriod = (typeof PAY_PERIOD)[keyof typeof PAY_PERIOD]

export interface WorkScheduleConfiguration {
  workingDays?: DayOfWeekOption[] | null
  startTime?: string
  endTime?: string
}

export interface LeavePolicyConfiguration {
  annualLeaveDays?: number
  sickLeaveDays?: number
  carryOverDays?: number
  allowHalfDayLeave?: boolean
  requireManagerApproval?: boolean
}

export interface PayrollConfiguration {
  payPeriod?: PayPeriod
  probationPeriodDays?: number
}

export interface AttendanceConfiguration {
  enableAttendanceTracking?: boolean
  lateArrivalGracePeriodMinutes?: number
  earlyDepartureGracePeriodMinutes?: number
  allowOvertime?: boolean
  requireOvertimeApproval?: boolean
}

export interface OnboardingConfiguration {
  requireJobTitle?: boolean
  requireDepartment?: boolean
  requireEmergencyContact?: boolean
  requireEmployeeDocuments?: boolean
  requireManager?: boolean
}

export interface ConfigureHRSettingsCommand {
  workSchedule?: WorkScheduleConfiguration
  leavePolicy?: LeavePolicyConfiguration
  payroll?: PayrollConfiguration
  attendance?: AttendanceConfiguration
  onboarding?: OnboardingConfiguration
}

export const hrConfigurationApi = {
  /**
   * Save HR configuration for a tenant
   * (POST /api/tenants/{tenantId}/hr-configuration/setup)
   */
  setup: async (
    tenantId: string,
    payload: ConfigureHRSettingsCommand
  ): Promise<BaseApiResponse> => {
    const response = await apiClient.post<BaseApiResponse>(
      `/api/tenants/${encodeURIComponent(tenantId)}/hr-configuration/setup`,
      payload
    )
    return response.data
  },
}
