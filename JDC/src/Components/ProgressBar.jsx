import React from 'react';
import { Check } from 'lucide-react';

export default function ProgressBar({ steps, currentStep }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : isCurrent
                      ? 'bg-red-600 text-white ring-4 ring-red-200'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-6 h-6" /> : index + 1}
                </div>
                <span
                  className={`text-xs mt-2 font-medium text-center ${
                    isCurrent ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                  style={{ maxWidth: '100px' }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}