import type { OrgUser, TicketDetail, TicketListItem } from '../_types'
import { DEMO_OWNER, getDemoTicketDetail, getDemoTicketsForApi } from '@/lib/demo-crm-data'

export const MOCK_TICKETS: TicketListItem[] = getDemoTicketsForApi() as TicketListItem[]

export function getMockTicketDetail(id: string): TicketDetail | null {
  return getDemoTicketDetail(id) as TicketDetail | null
}

export const MOCK_ORG_USERS: OrgUser[] = [
  { id: DEMO_OWNER.id, name: DEMO_OWNER.name, email: DEMO_OWNER.email, role: 'ADMIN' },
]
