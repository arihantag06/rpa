import { Play, HelpCircle, Save, Settings, Trash2, Plus, GripVertical } from 'lucide-react';
import { type WorkflowStep } from '../types/workflow';

interface WorkflowStepProps {
  step: WorkflowStep;
  onUpdate: (step: WorkflowStep) => void;
  onDelete: (stepId: string) => void;
  onAddStep: (afterStepId: string) => void;
  onRun: (stepId: string) => void;
}

export default function WorkflowStepComponent({
  step,
  onUpdate,
  onDelete,
  onAddStep,
  onRun
}: WorkflowStepProps) {
  const handleConfigChange = (key: string, value: string) => {
    onUpdate({
      ...step,
      config: {
        ...step.config,
        [key]: value
      }
    });
  };

  const renderStepConfig = () => {
    switch (step.type) {
      case 'navigate':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              URL
            </label>
            <input
              type="url"
              value={step.config.url || ''}
              onChange={(e) => handleConfigChange('url', e.target.value)}
              placeholder="The URL to navigate to (e.g., https://example.com)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );
      case 'type':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              XPath Selector
            </label>
            <input
              type="text"
              value={step.config.xpath || ''}
              onChange={(e) => handleConfigChange('xpath', e.target.value)}
              placeholder="XPath of the element to type into (e.g., //input[@id='username'])"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <label className="block text-sm font-medium text-gray-700">
              Text to Type
            </label>
            <input
              type="text"
              value={step.config.text || ''}
              onChange={(e) => handleConfigChange('text', e.target.value)}
              placeholder="The text to type into the element"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );
      case 'click':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              XPath Selector
            </label>
            <input
              type="text"
              value={step.config.xpath || ''}
              onChange={(e) => handleConfigChange('xpath', e.target.value)}
              placeholder="XPath of the element to click (e.g., //button[@id='submit'])"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );
      case 'wait':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Duration (seconds)
            </label>
            <input
              type="number"
              value={step.config.duration || ''}
              onChange={(e) => handleConfigChange('duration', e.target.value)}
              placeholder="Wait duration in seconds"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );
      case 'screenshot':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Filename (optional)
            </label>
            <input
              type="text"
              value={step.config.filename || ''}
              onChange={(e) => handleConfigChange('filename', e.target.value)}
              placeholder="Screenshot filename (auto-generated if empty)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
      {/* Step Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="cursor-move p-1 hover:bg-gray-100 rounded">
            <GripVertical size={16} className="text-gray-400" />
          </div>
          <div className="w-8 h-8 bg-purple-600 text-white rounded flex items-center justify-center text-sm font-semibold">
            {step.order}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
            <p className="text-sm text-gray-600">{step.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onRun(step.id)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
            title="Run step"
          >
            <Play size={16} />
          </button>
          <button
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Help"
          >
            <HelpCircle size={16} />
          </button>
          <button
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
            title="Save"
          >
            <Save size={16} />
          </button>
          <button
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => onDelete(step.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Step Configuration */}
      <div className="mb-4">
        {renderStepConfig()}
      </div>

      {/* Add Step Button */}
      <button
        onClick={() => onAddStep(step.id)}
        className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-md hover:bg-purple-50 transition-colors"
      >
        <Plus size={20} />
        <span>Add Step</span>
      </button>
    </div>
  );
}
