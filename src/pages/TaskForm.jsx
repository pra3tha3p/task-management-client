import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate, useParams } from "react-router-dom";

const TaskForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

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
        fetchAvailableTasks();
        if (isEdit) {
            fetchTask();
        }
    }, [id]);

    const fetchAvailableTasks = async () => {
        try {
            const response = await api.get("/tasks");
            // Filter out current task if editing to prevent self-dependency selection in UI
            const tasks = response.data.filter((t) => !isEdit || t.id !== parseInt(id));
            setAvailableTasks(tasks);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        }
    };

    const fetchTask = async () => {
        try {
            const response = await api.get(`/tasks/${id}`);
            const task = response.data;
            setFormData({
                title: task.title,
                description: task.description || "",
                due_date: new Date(task.due_date).toISOString().slice(0, 16), // Format for datetime-local (YYYY-MM-DDTHH:mm)
                priority: task.priority,
                status: task.status,
                dependencyIds: task.dependencies.map((d) => d.dependency.id),
            });
        } catch (error) {
            console.error("Failed to fetch task", error);
            setError("Failed to load task details");
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
            if (isEdit) {
                await api.put(`/tasks/${id}`, formData);
            } else {
                await api.post("/tasks", formData);
            }
            navigate("/tasks");
        } catch (error) {
            setError(error.response?.data?.message || "Failed to save task");
        }
    };

    return (
        <div className="task-form-page">
            <h2>{isEdit ? "Edit Task" : "Create New Task"}</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Task Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Complete Project Report" />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Add details about the task..." />
                </div>
                <div className="form-group">
                    <label>Due Date</label>
                    <input type="datetime-local" name="due_date" value={formData.due_date} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Priority</label>
                    <select name="priority" value={formData.priority} onChange={handleChange}>
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>
                </div>
                {isEdit && (
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
                    <select multiple name="dependencyIds" value={formData.dependencyIds} onChange={handleDependencyChange} className="dependency-select">
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
                    <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{isEdit ? "Update Task" : "Create Task"}</button>
                </div>
            </form>
        </div>
    );
};

export default TaskForm;
