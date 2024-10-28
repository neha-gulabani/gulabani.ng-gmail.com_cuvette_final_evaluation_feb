import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import '../styles/sharetask.css'
import logo from '../images/promanage.png'

const TaskSharePage = () => {
    const { taskId } = useParams();
    const [task, setTask] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {

        axios.get(`https://promanage-jk02.onrender.com/api/task/${taskId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => setTask(response.data))
            .catch(err => {
                console.error('Error fetching task:', err);
                setError('Failed to fetch task details');
            });
    }, [taskId]);

    if (error) {
        return <p>{error}</p>;
    }

    if (!task) {
        return <p>Loading task...</p>;
    }


    const formattedDueDate = task.dueDate ? format(new Date(task.dueDate), 'MMM do, yyyy') : 'No due date';
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

    return (
        <div><div className="logo"><img src={logo} />Pro Manage</div>

            <div className="task-share-page">
                <div className="task-meta">
                    <span className={`priority ${task.priority.toLowerCase()}`}>

                        <i class="fa-solid fa-circle"></i>
                        {task.priority} PRIORITY
                    </span>


                </div>
                <h1 className="sharetitle">{task.title}</h1>





                {task.checklist && task.checklist.length > 0 && (
                    <div className="checklist-share">
                        <h3>Checklist ({task.checklist.filter(item => item.completed).length}/{task.checklist.length})</h3>
                        <ul>
                            {task.checklist.map((item, index) => (
                                <li key={index} style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>
                                    <input type="checkbox" checked={item.completed} readOnly />
                                    <label>{item.task}</label>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {formattedDueDate !== "No due date" && <p>
                    <strong>Due Date:</strong> <span className={isOverdue ? 'overdue' : ''}>{formattedDueDate}</span>
                </p>}


            </div>
        </div>
    );
};

export default TaskSharePage;
