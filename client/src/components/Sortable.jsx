import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { useState } from 'react';
import EditableItem from './EditableItem';
import { exportAsMarkdown, exportAsText, copyToClipboard, downloadAsFile } from '../utils/exportUtils';
import toast from 'react-hot-toast';
import './Sortable.css';

function Sortable({ task: initialTask, id, onUpdate }) {
    const [task, setTask] = useState(initialTask);
    const [collapsedSections, setCollapsedSections] = useState({});
    const [showActions, setShowActions] = useState(false);
    
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const toggleSection = (section) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleUpdateStory = (storyId, newValue) => {
        const updated = {
            ...task,
            userStories: task.userStories.map(s => 
                s.id === storyId ? { ...s, story: newValue } : s
            )
        };
        setTask(updated);
        onUpdate?.(updated);
    };

    const handleUpdateTask = (taskId, newValue) => {
        const updated = {
            ...task,
            engineeringTasks: task.engineeringTasks.map(t => 
                t.id === taskId ? { ...t, task: newValue } : t
            )
        };
        setTask(updated);
        onUpdate?.(updated);
    };

    const handleUpdateRisk = (riskId, field, newValue) => {
        const updated = {
            ...task,
            risks: task.risks.map(r => 
                r.id === riskId ? { ...r, [field]: newValue } : r
            )
        };
        setTask(updated);
        onUpdate?.(updated);
    };

    const handleCopyMarkdown = async () => {
        const markdown = exportAsMarkdown(task);
        const success = await copyToClipboard(markdown);
        if (success) toast.success('Copied as Markdown!');
        else toast.error('Failed to copy');
    };

    const handleCopyText = async () => {
        const text = exportAsText(task);
        const success = await copyToClipboard(text);
        if (success) toast.success('Copied as Text!');
        else toast.error('Failed to copy');
    };

    const handleDownloadMarkdown = () => {
        const markdown = exportAsMarkdown(task);
        const filename = `${task.goal.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        downloadAsFile(markdown, filename, 'text/markdown');
        toast.success('Downloaded!');
    };

    const handleDownloadText = () => {
        const text = exportAsText(task);
        const filename = `${task.goal.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        downloadAsFile(text, filename, 'text/plain');
        toast.success('Downloaded!');
    };

    return (
        <div 
            ref={setNodeRef}
            style={style}
            className={`sortable-item relative h-96  overflow-scroll rounded-lg p-6 my-2 ${isDragging ? 'dragging' : ''}`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div 
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 cursor-grab active:cursor-grabbing p-2 hover:bg-gray-200 rounded"
                title="Drag to reorder"
            >
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z"></path>
                </svg>
            </div>

            {showActions && (
                <div className="absolute top-2 right-2 flex gap-2 bg-white rounded shadow-lg p-2 z-10">
                    <button
                        onClick={handleCopyMarkdown}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        title="Copy as Markdown"
                    >
                        📋 MD
                    </button>
                    <button
                        onClick={handleCopyText}
                        className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                        title="Copy as Text"
                    >
                        📋 TXT
                    </button>
                    <button
                        onClick={handleDownloadMarkdown}
                        className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                        title="Download as Markdown"
                    >
                        ⬇️ MD
                    </button>
                    <button
                        onClick={handleDownloadText}
                        className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
                        title="Download as Text"
                    >
                        ⬇️ TXT
                    </button>
                </div>
            )}
            <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">{task.goal}</h2>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                        <span className="font-semibold">Users:</span> {task.users}
                    </div>
                    <div>
                        <span className="font-semibold">Constraints:</span> {task.constraints}
                    </div>
                    <div>
                        <span className="font-semibold">Template:</span> {task.template}
                    </div>
                </div>
            </div>

            {/* User Stories */}
            <div className="mb-4">
                <h3 
                    className="cursor-pointer text-lg font-semibold mb-2 text-blue-600 flex items-center gap-2"
                    onClick={() => toggleSection('stories')}
                >
                    <span>{collapsedSections.stories ? '▶' : '▼'}</span>
                    📖 User Stories ({task.userStories.length})
                </h3>
                {!collapsedSections.stories && (
                    <ul className="space-y-2">
                        {task.userStories.map((story) => (
                            <li key={story.id} className="flex gap-2 items-start">
                                <span className="font-mono text-xs text-gray-500 mt-2">{story.id}</span>
                                <EditableItem 
                                    value={story.story} 
                                    onSave={(newValue) => handleUpdateStory(story.id, newValue)}
                                    multiline
                                    className="flex-1"
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Engineering Tasks */}
            <div className="mb-4">
                <h3 
                    className="cursor-pointer text-lg font-semibold mb-2 text-green-600 flex items-center gap-2"
                    onClick={() => toggleSection('tasks')}
                >
                    <span>{collapsedSections.tasks ? '▶' : '▼'}</span>
                    🔧 Engineering Tasks ({task.engineeringTasks.length})
                </h3>
                {!collapsedSections.tasks && (
                    <ul className="space-y-2">
                        {task.engineeringTasks.map((taskItem) => (
                            <li key={taskItem.id} className="flex gap-2 items-start">
                                <span className="font-mono text-xs text-gray-500 mt-2">{taskItem.id}</span>
                                <EditableItem 
                                    value={taskItem.task} 
                                    onSave={(newValue) => handleUpdateTask(taskItem.id, newValue)}
                                    multiline
                                    className="flex-1"
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Risks */}
            <div>
                <h3 
                    className="cursor-pointer text-lg font-semibold mb-2 text-red-600 flex items-center gap-2"
                    onClick={() => toggleSection('risks')}
                >
                    <span>{collapsedSections.risks ? '▶' : '▼'}</span>
                    ⚠️ Risks ({task.risks.length})
                </h3>
                {!collapsedSections.risks && (
                    <ul className="space-y-3">
                        {task.risks.map((risk) => (
                            <li key={risk.id} className="border-l-4 border-red-400 pl-4">
                                <div className="flex gap-2 mb-1 items-start">
                                    <span className="font-mono text-xs text-gray-500 mt-2">{risk.id}</span>
                                    <EditableItem 
                                        value={risk.risk} 
                                        onSave={(newValue) => handleUpdateRisk(risk.id, 'risk', newValue)}
                                        className="flex-1 font-semibold"
                                    />
                                </div>
                                <div className="text-sm text-gray-600 ml-10">
                                    <span className="font-semibold">Mitigation:</span>{' '}
                                    <EditableItem 
                                        value={risk.mitigation} 
                                        onSave={(newValue) => handleUpdateRisk(risk.id, 'mitigation', newValue)}
                                        multiline
                                        className="inline-block"
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mt-4 text-xs text-gray-400">
                Created: {new Date(task.createdAt).toLocaleString()}
            </div>
        </div>
    );
}

export default Sortable;