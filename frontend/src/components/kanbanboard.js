import React, { useState, useEffect, useMemo } from 'react';
import '../styles/kanbanboard.css';
import KanbanTask from './kanbantask';
import AddTaskModal from './addtask';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const KanbanBoard = ({ tasks: initialTasks, onSave, onStatusChange }) => {
    const [tasks, setTasks] = useState(initialTasks);
    const [collapsedSections, setCollapsedSections] = useState({
        backlog: true,
        todo: true,
        'in-progress': true,
        done: true
    });
    const [isModalOpen, setIsModalOpen] = useState(false);


    const toggleSectionCollapse = (section) => {
        setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const handleStatusChange = (taskId, newStatus) => {
        axios.put(`https://promanage-jk02.onrender.com/api/task/updateTaskStatus/${taskId}`, { status: newStatus }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then(response => {
                const updatedTask = response.data;
                setTasks(prevTasks =>
                    prevTasks?.map(task =>
                        task._id === taskId ? updatedTask : task
                    )
                );
                onStatusChange(updatedTask);
            })
            .catch(error => {
                console.error('Error updating task status:', error);
            });
    };

    const toggleChecklistItem = (taskId, checklistIndex) => {
        const task = tasks.find(task => task._id === taskId);
        if (!task) return;

        const updatedChecklist = task.checklist?.map((item, index) => {
            return index === checklistIndex
                ? { ...item, completed: !item.completed }
                : item;
        });

        setTasks(prevTasks =>
            prevTasks?.map(t =>
                t._id === taskId ? { ...t, checklist: updatedChecklist } : t
            )
        );





        axios.put(`https://promanage-jk02.onrender.com/api/task/updateChecklist/${taskId}`, {
            checklistIndex,
            completed: updatedChecklist[checklistIndex].completed
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then(response => {
                const updatedTask = response.data;
                setTasks(prevTasks =>
                    prevTasks?.map(t =>
                        t._id === taskId ? updatedTask : t
                    )
                );
            })
            .catch(error => {
                console.error('Error updating checklist item:', error);
                setTasks(prevTasks =>
                    prevTasks?.map(t =>
                        t._id === taskId ? { ...t, checklist: task.checklist } : t
                    )
                );
            });
    };

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSave = (newTask) => {
        setTasks(prevTasks => [...prevTasks, newTask]);
        onSave(newTask);
        setIsModalOpen(false);
    };

    const handleDeleteTask = (taskId) => {
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    };

    const callToast = () => {
        toast('Link copied!')
    }


    const backlogTasks = useMemo(() => tasks.filter(task => task.status === 'backlog'), [tasks]);
    const todoTasks = useMemo(() => tasks.filter(task => task.status === 'to-do'), [tasks]);
    const inProgressTasks = useMemo(() => tasks.filter(task => task.status === 'in-progress'), [tasks]);
    const doneTasks = useMemo(() => tasks.filter(task => task.status === 'done'), [tasks]);

    return (
        <div>
            <ToastContainer />
            <div className="kanban-board">
                <div className="kanban-column">
                    <div className="kanban-column-header">
                        <h3>Backlog</h3>
                        <button onClick={() => toggleSectionCollapse('backlog')} className="collapse-btn">
                            {collapsedSections.backlog ? <i className="fas fa-clone"></i> : <i className="fas fa-clone"></i>}
                        </button>
                    </div>
                    {backlogTasks?.map(task => (
                        <KanbanTask
                            key={task._id}
                            task={task}
                            isCollapsed={collapsedSections.backlog}
                            toggleChecklistItem={toggleChecklistItem}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDeleteTask}
                            callToast={callToast}
                        />
                    ))}
                </div>

                <div className="kanban-column">
                    <div className="kanban-column-header">
                        <h3>To do</h3>
                        <div className="btns-todo">
                            <button className='add-btn' onClick={handleOpenModal}>+</button>
                            <button onClick={() => toggleSectionCollapse('todo')} className="collapse-btn">
                                {collapsedSections.todo ? <i className="fas fa-clone"></i> : <i className="fas fa-clone"></i>}
                            </button>
                        </div>
                    </div>
                    {todoTasks?.map(task => (
                        <KanbanTask
                            key={task._id}
                            task={task}
                            isCollapsed={collapsedSections.todo}
                            toggleChecklistItem={toggleChecklistItem}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDeleteTask}
                            callToast={callToast}
                        />
                    ))}
                </div>

                <div className="kanban-column">
                    <div className="kanban-column-header">
                        <h3>In progress</h3>
                        <button onClick={() => toggleSectionCollapse('in-progress')} className="collapse-btn">
                            {collapsedSections['in-progress'] ? <i className="fas fa-clone"></i> : <i className="fas fa-clone"></i>}
                        </button>
                    </div>
                    {inProgressTasks?.map(task => (
                        <KanbanTask
                            key={task._id}
                            task={task}
                            isCollapsed={collapsedSections['in-progress']}
                            toggleChecklistItem={toggleChecklistItem}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDeleteTask}
                            callToast={callToast}
                        />
                    ))}
                </div>

                <div className="kanban-column">
                    <div className="kanban-column-header">
                        <h3>Done</h3>
                        <button onClick={() => toggleSectionCollapse('done')} className="collapse-btn">
                            {collapsedSections.done ? <i className="fas fa-clone"></i> : <i className="fas fa-clone"></i>}
                        </button>
                    </div>
                    {doneTasks?.map(task => (
                        <KanbanTask
                            key={task._id}
                            task={task}
                            isCollapsed={collapsedSections.done}
                            toggleChecklistItem={toggleChecklistItem}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDeleteTask}
                            callToast={callToast}
                        />
                    ))}
                </div>
            </div>

            {isModalOpen && <AddTaskModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} />}
        </div>
    );
};

export default KanbanBoard;
