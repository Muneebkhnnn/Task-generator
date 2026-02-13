import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import Sortable from "../components/Sortable";
import TaskGroup from "../components/TaskGroup";
import { exportAllTasksAsMarkdown, copyToClipboard, downloadAsFile } from '../utils/exportUtils';

function AllTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); 

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/getTasks");
      setTasks(response.data.data);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.specsId === active.id);
        const newIndex = items.findIndex((item) => item.specsId === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks(prev => prev.map(t => 
      t.specsId === updatedTask.specsId ? updatedTask : t
    ));
  };

  const handleExportAll = async () => {
    const markdown = exportAllTasksAsMarkdown(tasks);
    const success = await copyToClipboard(markdown);
    if (success) toast.success('All tasks copied as Markdown!');
    else toast.error('Failed to copy');
  };

  const handleDownloadAll = () => {
    const markdown = exportAllTasksAsMarkdown(tasks);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadAsFile(markdown, `all-tasks-${timestamp}.md`, 'text/markdown');
    toast.success('All tasks downloaded!');
  };


  const groupedTasks = tasks.reduce((groups, task) => {
    const template = task.template || 'Other';
    if (!groups[template]) {
      groups[template] = [];
    }
    groups[template].push(task);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Recent Tasks</h1>
            <p className="text-gray-600">
              View and edit the 5 most recently generated specs
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'grouped' : 'grid')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition cursor-pointer"
              title="Toggle view mode"
            >
              {viewMode === 'grid' ? 'Group' : '⊞ Grid'}
            </button>
            <button
              onClick={handleExportAll}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition cursor-pointer flex items-center gap-2"
              title="Copy all as Markdown"
            >
              Copy All
            </button>
            <button
              onClick={handleDownloadAll}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition cursor-pointer flex items-center gap-2"
              title="Download all as Markdown"
            >
              Download All
            </button>
            <button
              onClick={fetchTasks}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              Refresh
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No tasks generated yet. Go to home page to create one!
          </div>
        ) : viewMode === 'grouped' ? (
          <div>
            {Object.entries(groupedTasks).map(([template, groupTasks]) => (
              <TaskGroup
                key={template}
                title={template}
                tasks={groupTasks}
                onUpdate={handleUpdateTask}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tasks.map(t => t.specsId)} strategy={verticalListSortingStrategy}>
              <div className="space-y-8 grid grid-cols-1 gap-4 md:grid-cols-2 border-8 border-amber-400 overflow-hidden p-2">
                {tasks.map((task) => (
                  <Sortable 
                    key={task.specsId} 
                    task={task} 
                    id={task.specsId}
                    onUpdate={handleUpdateTask}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </>
  );
}

export default AllTasks;
