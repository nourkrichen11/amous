import { getAdminTopbarAlerts } from '@/features/admin/topbar'

import { AdminTopbarControls } from './AdminTopbar'

export async function AdminTopbarTools() {
  const alerts = await getAdminTopbarAlerts()

  return <AdminTopbarControls alerts={alerts} />
}
