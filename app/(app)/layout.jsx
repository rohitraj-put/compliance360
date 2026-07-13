import { DataProvider } from '@/context/DataContext'
import Sidebar from '@/components/Sidebar'

export default function AppLayout({ children }) {
  return (
    <DataProvider>
      <div className="app-shell">
        <Sidebar />
        <div className="main">{children}</div>
      </div>
    </DataProvider>
  )
}
