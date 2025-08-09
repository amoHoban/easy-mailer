'use client';

import { useState, useEffect } from 'react';
import { TemplateVariable } from '@/types';

interface VariableFormProps {
  variables: TemplateVariable[];
  onVariablesChange: (variables: Record<string, string>) => void;
}

export default function VariableForm({ variables, onVariablesChange }: VariableFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    onVariablesChange(values);
  }, [values, onVariablesChange]);

  const handleChange = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (value) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validateRequired = () => {
    const newErrors: Record<string, boolean> = {};
    variables.forEach(variable => {
      if (variable.required && !values[variable.name]) {
        newErrors[variable.name] = true;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (variables.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No variables detected in the template
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {variables.map(variable => (
          <div key={variable.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {variable.name}
              {variable.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={values[variable.name] || ''}
              onChange={(e) => handleChange(variable.name, e.target.value)}
              className={`
                w-full px-3 py-2.5 border rounded-lg text-base
                focus:ring-2 focus:ring-primary focus:border-transparent
                transition-all duration-200
                ${errors[variable.name] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
              `}
              placeholder={`Enter ${variable.name}${variable.required ? ' (required)' : ''}`}
            />
            {errors[variable.name] && (
              <p className="mt-1 text-sm text-red-600">This field is required</p>
            )}
          </div>
        ))}
      </div>
      {variables.some(v => v.required) && (
        <div className="text-xs text-gray-500 mt-4">
          <p>* Required fields must be filled</p>
        </div>
      )}
    </div>
  );
}