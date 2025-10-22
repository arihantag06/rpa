import { useState } from 'react';
import Sidebar from "./components/Sidebar";
import AutomationPage from "./routes/automation/page";
import OCRPage from "./routes/ocr/page";
import { WorkflowProvider } from "./contexts/WorkflowContext";

type TabType = 'ocr' | 'rpa';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('rpa');

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <WorkflowProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="flex-1 overflow-hidden">
          {activeTab === 'ocr' ? <OCRPage /> : <AutomationPage />}
        </div>
      </div>
    </WorkflowProvider>
  );
}

export default App
