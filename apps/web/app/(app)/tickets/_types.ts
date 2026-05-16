export type TicketStatus = 'OPEN' | 'PENDING' | 'SOLVED' | 'CLOSED'

export type TicketListItem = {
  id: string
  ticketNumber: number
  subject: string
  status: TicketStatus
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  estimatedCompletionAt: string | null
  deal: { id: string; name: string } | null
  company: { id: string; name: string } | null
  assignee: { id: string; name: string } | null
}

export type TicketDetail = {
  id: string
  ticketNumber: number
  subject: string
  description: string | null
  cause: string | null
  resolution: string | null
  memo: string | null
  status: TicketStatus
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  closedAt: string | null
  estimatedCompletionAt: string | null
  deal: { id: string; name: string } | null
  company: { id: string; name: string } | null
  contact: { id: string; name: string } | null
  assignee: { id: string; name: string } | null
}

export type OrgUser = {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'REP'
}
