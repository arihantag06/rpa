import { useState, useEffect } from 'react';
import { type Workflow } from '../types/workflow';

const STORAGE_KEY = 'automation-workflows';

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);

  // Load workflows from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setWorkflows(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load workflows:', error);
      }
    }
  }, []);

  // Save workflows to localStorage whenever workflows change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
  }, [workflows]);

  const createWorkflow = (name: string, description?: string): Workflow => {
    const newWorkflow: Workflow = {
      id: Date.now().toString(),
      name,
      description,
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setWorkflows(prev => [...prev, newWorkflow]);
    setCurrentWorkflow(newWorkflow);
    return newWorkflow;
  };

  const updateWorkflow = (id: string, updates: Partial<Workflow>) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === id 
        ? { ...workflow, ...updates, updatedAt: new Date().toISOString() }
        : workflow
    ));
    
    if (currentWorkflow?.id === id) {
      setCurrentWorkflow(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
    }
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(workflow => workflow.id !== id));
    if (currentWorkflow?.id === id) {
      setCurrentWorkflow(null);
    }
  };

  const loadWorkflow = (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    if (workflow) {
      setCurrentWorkflow(workflow);
    }
  };

  const addStep = (workflowId: string, step: Omit<WorkflowStep, 'id' | 'order'>) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const newStep: WorkflowStep = {
      ...step,
      id: Date.now().toString(),
      order: workflow.steps.length + 1,
    };

    updateWorkflow(workflowId, {
      steps: [...workflow.steps, newStep]
    });
  };

  const updateStep = (workflowId: string, stepId: string, updates: Partial<WorkflowStep>) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const updatedSteps = workflow.steps.map(step =>
      step.id === stepId ? { ...step, ...updates } : step
    );

    updateWorkflow(workflowId, { steps: updatedSteps });
  };

  const deleteStep = (workflowId: string, stepId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const filteredSteps = workflow.steps.filter(step => step.id !== stepId);
    // Reorder remaining steps
    const reorderedSteps = filteredSteps.map((step, index) => ({
      ...step,
      order: index + 1
    }));

    updateWorkflow(workflowId, { steps: reorderedSteps });
  };

  const reorderSteps = (workflowId: string, fromIndex: number, toIndex: number) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const newSteps = [...workflow.steps];
    const [movedStep] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, movedStep);

    // Update order numbers
    const reorderedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index + 1
    }));

    updateWorkflow(workflowId, { steps: reorderedSteps });
  };

  return {
    workflows,
    currentWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    loadWorkflow,
    addStep,
    updateStep,
    deleteStep,
    reorderSteps,
    setCurrentWorkflow,
  };
}
