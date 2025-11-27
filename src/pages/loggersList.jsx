import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import TaskFormModal from "../components/TaskFormModal";

const LoggersList = () => {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [editingTask, setEditingTask] = useState(null);

    useEffect(() => {
        fetchLoggers();
    }, []);

    const fetchLoggers = async () => {
        try {
            const response = await api.get("/tasks/loggerlist");
            setTasks(response.data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    };



    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="task-list-page">
            <div className="header">
                <h1>Task History Logs</h1>
            </div>

            <div className="full-width-container">
                {tasks.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--gray-500)' }}>
                        <p>No history logs found.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Task Title</th>
                                    <th>Previous Status</th>
                                    <th>New Status</th>
                                    <th>Previous Priority</th>
                                    <th>New Priority</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((log) => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.date).toLocaleString()}</td>
                                        <td>{log.task?.title || `Task #${log.taskId}`}</td>
                                        <td>
                                            <span className={`status-text ${log.prevStatus}`}>
                                                {log.prevStatus?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-text ${log.status}`}>
                                                {log.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`priority ${log.prevPriority}`}>
                                                {log.prevPriority}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`priority ${log.priority}`}>
                                                {log.priority}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoggersList;
