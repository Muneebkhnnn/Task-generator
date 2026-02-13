import { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Sortable from './Sortable';

function TaskGroup({ title, tasks, onUpdate, onDragEnd }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [groupTitle, setGroupTitle] = useState(title);

  const handleTitleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="mb-8 border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xl font-bold text-gray-700 hover:text-gray-900"
          >
            {isCollapsed ? '▶' : '▼'}
          </button>
          {isEditing ? (
            <input
              type="text"
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
              className="text-xl font-bold px-2 py-1 border rounded"
              autoFocus
            />
          ) : (
            <h2
              onClick={() => setIsEditing(true)}
              className="text-xl font-bold cursor-pointer hover:text-blue-600"
            >
              {groupTitle} ({tasks.length})
            </h2>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={tasks.map(t => t.specsId)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {tasks.map((task) => (
                <Sortable
                  key={task.specsId}
                  task={task}
                  id={task.specsId}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

export default TaskGroup;
