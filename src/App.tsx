import AutomationPage from "./routes/automation/page"
import { WorkflowProvider } from "./contexts/WorkflowContext"

function App() {
  return (
    <WorkflowProvider>
      <AutomationPage />
    </WorkflowProvider>
  )
}

export default App
