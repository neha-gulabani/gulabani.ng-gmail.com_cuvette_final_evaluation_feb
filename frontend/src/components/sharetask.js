import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import '../styles/sharetask.css';
import logo from '../images/promanage.png';

const TaskSharePage = () => {
    const { taskId } = useParams();
    const [task, setTask] = useState(null);
    const [error, setError] = useState(null);
    const [columns, setColumns] = useState([]);
    const [isSharing, setIsSharing] = useState(false);

    // Fetch task and sync columns
    useEffect(() => {
        const fetchTaskAndSyncColumns = async () => {
            try {
                // Fetch task details
                const taskResponse = await axios.get(
                    `http://localhost:5000/api/task/${taskId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${sessionStorage.getItem('token')}`
                        }
                    }
                );
                setTask(taskResponse.data);

                // Fetch user's columns
                const columnsResponse = await axios.get(
                    'http://localhost:5000/api/columns',
                    {
                        headers: {
                            Authorization: `Bearer ${sessionStorage.getItem('token')}`
                        }
                    }
                );
                setColumns(columnsResponse.data);

                // Sync columns if task is shared with current user
                if (taskResponse.data.assignees?.includes(taskResponse.data.createdBy)) {
                    await syncColumns(taskResponse.data.createdBy);
                }
            } catch (err) {
                console.error('Error:', err);
                setError('Failed to fetch task details');
            }
        };

        fetchTaskAndSyncColumns();
    }, [taskId]);

    // Function to sync columns
    const syncColumns = async (targetUserId) => {
        try {
            await axios.post(
                'http://localhost:5000/api/columns/sync-columns',
                {
                    targetUserId,
                    columns
                },
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`
                    }
                }
            );
        } catch (err) {
            console.error('Error syncing columns:', err);
        }
    };

    // Share task with another user
    const shareTask = async (email) => {
        setIsSharing(true);
        try {
            const response = await axios.post(
                `http://localhost:5000/api/task/share/${taskId}`,
                { userEmail: email },
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`
                    }
                }
            );
            // Sync columns after successful share
            if (response.data.targetUserId) {
                await syncColumns(response.data.targetUserId);
            }
            return true;
        } catch (err) {
            console.error('Error sharing task:', err);
            throw err;
        } finally {
            setIsSharing(false);
        }
    };

    if (error) {
        return <p>{error}</p>;
    }

    if (!task) {
        return <p>Loading task...</p>;
    }

    const formattedDueDate = task.dueDate ? format(new Date(task.dueDate), 'MMM do, yyyy') : 'No due date';
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

    return (
        <div>
            <div className="logo">
                <img src={logo} alt="Pro Manage Logo" />
                Pro Manage
            </div>

            <div className="task-share-page">
                <div className="task-meta">
                    <span className={`priority ${task.priority.toLowerCase()}`}>
                        <i className="fa-solid fa-circle"></i>
                        {task.priority} PRIORITY
                    </span>
                </div>

                <h1 className="sharetitle">{task.title}</h1>

                <div className="status-section">
                    <strong>Status:</strong>
                    <span className={`status-tag ${task.status.toLowerCase()}`}>
                        {task.status}
                    </span>
                </div>

                {task.checklist && task.checklist.length > 0 && (
                    <div className="checklist-share">
                        <h3>
                            Checklist ({task.checklist.filter(item => item.completed).length}/
                            {task.checklist.length})
                        </h3>
                        <ul>
                            {task.checklist.map((item, index) => (
                                <li
                                    key={index}
                                    style={{ textDecoration: item.completed ? 'line-through' : 'none' }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={item.completed}
                                        readOnly
                                    />
                                    <label>{item.task}</label>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {formattedDueDate !== "No due date" && (
                    <p>
                        <strong>Due Date:</strong>
                        <span className={isOverdue ? 'overdue' : ''}>
                            {formattedDueDate}
                        </span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default TaskSharePage;