import { router } from '../middleware/trpc'
import { companiesRouter } from './companies'
import { contactsRouter } from './contacts'
import { dealsRouter } from './deals'
import { tasksRouter } from './tasks'
import { callsRouter } from './calls'
import { faqRouter } from './faq'
import { driveFoldersRouter } from './driveFolders'
import { knowledgeRulesRouter } from './knowledgeRules'

export const appRouter = router({
  companies: companiesRouter,
  contacts: contactsRouter,
  deals: dealsRouter,
  tasks: tasksRouter,
  calls: callsRouter,
  faq: faqRouter,
  driveFolders: driveFoldersRouter,
  knowledgeRules: knowledgeRulesRouter,
})

export type AppRouter = typeof appRouter
