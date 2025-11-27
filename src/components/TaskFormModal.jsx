import React, { useEffect, useState } from "react";
import api from "../services/api";

const TaskFormModal = ({ isOpen, onClose, onTaskCreated, taskToEdit }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        due_date: "",
        priority: "medium",
        status: "pending",
        dependencyIds: [],
    });
    const [availableTasks, setAvailableTasks] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchAvailableTasks();
            if (taskToEdit) {
                setFormData({
                    title: taskToEdit.title,
                    description: taskToEdit.description || "",
                    due_date: new Date(taskToEdit.due_date).toISOString().slice(0, 16),
                    priority: taskToEdit.priority,
                    status: taskToEdit.status,
                    dependencyIds: taskToEdit.dependencies ? taskToEdit.dependencies.map(d => d.dependency.id) : [],
                });
            } else {
                // Reset form when modal opens for new task
                setFormData({
                    title: "",
                    description: "",
                    due_date: "",
                    priority: "medium",
                    status: "pending",
                    dependencyIds: [],
                });
            }
            setError("");
        }
    }, [isOpen, taskToEdit]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    const fetchAvailableTasks = async () => {
        try {
            const response = await api.get("/tasks");
            // Filter out current task if editing to prevent self-dependency selection
            const tasks = response.data.filter(t => !taskToEdit || t.id !== taskToEdit.id);
            setAvailableTasks(tasks);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDependencyChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option) => parseInt(option.value));
        setFormData((prev) => ({ ...prev, dependencyIds: selectedOptions }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (taskToEdit) {
                await api.put(`/tasks/${taskToEdit.id}`, formData);
            } else {
                await api.post("/tasks", formData);
            }
            onTaskCreated(); // Callback to refresh task list
            onClose(); // Close modal
        } catch (error) {
            setError(error.response?.data?.message || "Failed to save task");
        }
    };

    const handleOverlayClick = (e) => {
        // Close modal if clicking on the overlay (not the modal content)
        if (e.target.className === "modal-overlay") {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-container">
                <div className="modal-header">
                    <h2>{taskToEdit ? "Edit Task" : "Create New Task"}</h2>
                    <button className="modal-close" onClick={onClose} aria-label="Close modal">
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    {error && <div className="error">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Task Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Complete Project Report"
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Add details about the task..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Due Date</label>
                            <input
                                type="datetime-local"
                                name="due_date"
                                value={formData.due_date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Priority</label>
                            <select name="priority" value={formData.priority} onChange={handleChange}>
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                        </div>
                        {taskToEdit && (
                            <div className="form-group">
                                <label>Status</label>
                                <select name="status" value={formData.status} onChange={handleChange}>
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        )}
                        <div className="form-group">
                            <label>Dependencies (Hold Ctrl/Cmd to select multiple)</label>
                            <select
                                multiple
                                name="dependencyIds"
                                value={formData.dependencyIds}
                                onChange={handleDependencyChange}
                                className="dependency-select"
                            >
                                {availableTasks.map((task) => (
                                    <option key={task.id} value={task.id}>
                                        {task.title} ({task.status})
                                    </option>
                                ))}
                            </select>
                            <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--gray-500)' }}>
                                Tasks selected here must be completed before this task can be marked as done.
                            </small>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                                {taskToEdit ? "Update Task" : "Create Task"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TaskFormModal;
