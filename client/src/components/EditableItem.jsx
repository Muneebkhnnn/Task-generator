import { useState } from 'react';

function EditableItem({ value, onSave, multiline = false, className = "" }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (editValue.trim()) {
      onSave(editValue);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex gap-2 items-start">
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20"
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        )}
        <button
          onClick={handleSave}
          className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
        >
          ✓
        </button>
        <button
          onClick={handleCancel}
          className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-xs"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition ${className}`}
      title="Click to edit"
    >
      {value}
    </div>
  );
}

export default EditableItem;
