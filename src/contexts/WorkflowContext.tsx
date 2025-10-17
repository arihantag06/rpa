import { createContext, useContext, ReactNode } from 'react';
import { useWorkflows } from '../hooks/useWorkflows';

const WorkflowContext = createContext<ReturnType<typeof useWorkflows> | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const workflowData = useWorkflows();
  return (
    <WorkflowContext.Provider value={workflowData}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflowContext() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflowContext must be used within a WorkflowProvider');
  }
  return context;
}
