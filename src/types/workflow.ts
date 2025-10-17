export interface WorkflowStep {
  id: string;
  type: 'navigate' | 'click' | 'type' | 'wait' | 'screenshot';
  title: string;
  description: string;
  config: {
    // Navigate step
    url?: string;
    // Click/Type steps
    xpath?: string;
    // Type step
    text?: string;
    // Wait step
    duration?: number;
    // Screenshot step
    filename?: string;
  };
  order: number;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  isRunning?: boolean;
}

export interface BrowserState {
  url: string;
  title: string;
  isLoading: boolean;
  canControl: boolean;
  screenshot?: string;
  error?: string;
}

export interface ExecutionResult {
  stepId: string;
  success: boolean;
  message: string;
  screenshot?: string;
  timestamp: string;
}
