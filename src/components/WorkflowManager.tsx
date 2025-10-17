import { useState } from 'react';
import { Plus, Edit, Trash2, Play, Folder, Save } from 'lucide-react';
import { useWorkflowContext } from '../contexts/WorkflowContext';

interface WorkflowManagerProps {
  onWorkflowSelect: (workflowId: string) => void;
}

export default function WorkflowManager({ onWorkflowSelect }: WorkflowManagerProps) {
  const { workflows, createWorkflow, deleteWorkflow } = useWorkflowContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');

  const handleCreateWorkflow = () => {
    if (newWorkflowName.trim()) {
      const workflow = createWorkflow(newWorkflowName.trim(), newWorkflowDescription.trim() || undefined);
      setNewWorkflowName('');
      setNewWorkflowDescription('');
      setShowCreateForm(false);
      onWorkflowSelect(workflow.id);
    }
  };

  const handleDeleteWorkflow = (workflowId: string, workflowName: string) => {
    if (confirm(`Are you sure you want to delete "${workflowName}"? This action cannot be undone.`)) {
      deleteWorkflow(workflowId);
    }
  };

  const handleResetWorkflows = () => {
    if (confirm('This will clear all workflows and reload templates. Are you sure?')) {
      localStorage.removeItem('automation-workflows');
      localStorage.removeItem('automation-templates-loaded');
      window.location.reload();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Workflows</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          <Plus size={16} />
          <span>New Workflow</span>
        </button>
      </div>

      {/* Create Workflow Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Workflow</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workflow Name *
              </label>
              <input
                type="text"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                placeholder="Enter workflow name (e.g., Login Automation)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={newWorkflowDescription}
                onChange={(e) => setNewWorkflowDescription(e.target.value)}
                placeholder="Describe what this workflow does..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCreateWorkflow}
                disabled={!newWorkflowName.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={16} />
                <span>Create Workflow</span>
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewWorkflowName('');
                  setNewWorkflowDescription('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflows List */}
      <div className="space-y-3">
        {workflows.length === 0 ? (
          <div className="text-center py-8">
            <Folder size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Workflows Yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first workflow to start automating tasks
            </p>
            <div className="flex flex-col items-center space-y-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <Plus size={16} />
                <span>Create Your First Workflow</span>
              </button>
              <button
                onClick={handleResetWorkflows}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Reset & Load Templates
              </button>
            </div>
          </div>
        ) : (
          workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Play size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                    <p className="text-sm text-gray-600">
                      {workflow.description || 'No description'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {workflow.steps.length} step{workflow.steps.length !== 1 ? 's' : ''} • 
                      Created {new Date(workflow.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onWorkflowSelect(workflow.id)}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteWorkflow(workflow.id, workflow.name)}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
