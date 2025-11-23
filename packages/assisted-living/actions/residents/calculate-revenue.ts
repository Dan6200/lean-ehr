'use server'
import { getResidentData } from './get'
import { verifySession } from '#root/auth/server/definitions'

export async function calculateRevenue(residentId: string): Promise<number> {
  try {
    const { provider_id } = await verifySession()
    const residentData = await getResidentData(provider_id, residentId)
    const { financials } = residentData

    if (!financials || financials.length === 0) {
      return 0
    }

    const totalBalance = financials.reduce((acc, transaction) => {
      if (transaction.type === 'CHARGE') {
        return acc + transaction.amount
      } else {
        return acc - transaction.amount
      }
    }, 0)

    return totalBalance
  } catch (error) {
    console.error(
      `Failed to calculate revenue for resident ${residentId}:`,
      error,
    )
    return 0 // Return 0 in case of an error
  }
}
