import { useState } from 'react';
import { Plus, Globe, MousePointer, Type, Clock, Camera } from 'lucide-react';

interface StepType {
  id: string;
  type: 'navigate' | 'click' | 'type' | 'wait' | 'screenshot';
  title: string;
  description: string;
  icon: React.ReactNode;
}

const stepTypes: StepType[] = [
  {
    id: 'navigate',
    type: 'navigate',
    title: 'Navigate to URL',
    description: 'Navigate to a specific URL',
    icon: <Globe size={20} className="text-blue-600" />
  },
  {
    id: 'click',
    type: 'click',
    title: 'Click Element',
    description: 'Click on an element using XPath',
    icon: <MousePointer size={20} className="text-green-600" />
  },
  {
    id: 'type',
    type: 'type',
    title: 'Type Text',
    description: 'Type text into an input field using XPath',
    icon: <Type size={20} className="text-purple-600" />
  },
  {
    id: 'wait',
    type: 'wait',
    title: 'Wait',
    description: 'Wait for a specified duration',
    icon: <Clock size={20} className="text-yellow-600" />
  },
  {
    id: 'screenshot',
    type: 'screenshot',
    title: 'Take Screenshot',
    description: 'Capture a screenshot of the current page',
    icon: <Camera size={20} className="text-gray-600" />
  }
];

interface StepSelectorProps {
  onStepSelect: (stepType: StepType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function StepSelector({ onStepSelect, isOpen, onClose }: StepSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSteps = stepTypes.filter(step =>
    step.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    step.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStepSelect = (stepType: StepType) => {
    onStepSelect(stepType);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Step</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search for step types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Steps Grid */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSteps.map((step) => (
              <button
                key={step.id}
                onClick={() => handleStepSelect(step)}
                className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
              >
                <div className="flex-shrink-0">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </button>
            ))}
          </div>

          {filteredSteps.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No steps found matching your search.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Select a step type to add it to your workflow. You can configure the step details after adding it.
          </p>
        </div>
      </div>
    </div>
  );
}
