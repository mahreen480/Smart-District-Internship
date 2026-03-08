import type { AuditEntry } from './types'

function makeAuditCounter() {
  let count = 0
  return (): number => ++count
}

const nextId = makeAuditCounter()

export const auditLogs: AuditEntry[] = []

export function logAudit(message: string): void {
  auditLogs.unshift({
    id:   nextId(),
    time: new Date().toLocaleTimeString(),
    msg:  message,
  })
}