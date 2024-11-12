'use client';
// components/Options.tsx
import React, { useState } from 'react';
import { Option } from '@/app/types/ProductDetails';

interface OptionsProps {
  options: Option[];
  setOptions: React.Dispatch<React.SetStateAction<Option[]>>; // Correctly typed as React.Dispatch<SetStateAction<Option[]>>
}

const Options: React.FC<OptionsProps> = ({ options, setOptions }) => {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  // Add a new option
  const handleAddOption = () => {
    if (key && value) {
      setOptions((prevOptions) => [
        ...prevOptions,
        { key, value },
      ]);
      setKey('');  // Clear input fields after adding
      setValue('');
    }
  };

  // Remove an option by index
  const handleRemoveOption = (index: number) => {
    setOptions((prevOptions) => prevOptions.filter((_, i) => i !== index));
  };

  return (
    <div className="options-container">
      <h3 className="text-xl font-bold mb-2">Product Options</h3>
      
      {options.length > 0 ? (
        options.map((option, index) => (
          <div key={index} className="option-row flex items-center mb-2">
            <input
              type="text"
              value={option.key}
              disabled
              className="mr-2 p-2 border border-gray-300 rounded"
              readOnly
            />
            <input
              type="text"
              value={option.value}
              disabled
              className="mr-2 p-2 border border-gray-300 rounded"
              readOnly
            />
            <button
            type='button'
              onClick={() => handleRemoveOption(index)}
              className="p-1 bg-red-500 text-white rounded"
            >
              Remove
            </button>
          </div>
        ))
      ) : (
        <p>No options added yet.</p>
      )}
      
      {/* Form to add new options */}
      <div className="add-option-form mt-4">
        <input
          type="text"
          placeholder="Option Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="p-2 border border-gray-300 rounded mr-2"
        />
        <input
          type="text"
          placeholder="Option Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="p-2 border border-gray-300 rounded mr-2"
        />
        <button
          onClick={handleAddOption}
          type='button'
          className="p-2 bg-blue-500 text-white rounded"
        >
          Add Option
        </button>
      </div>
    </div>
  );
};

export default Options;
