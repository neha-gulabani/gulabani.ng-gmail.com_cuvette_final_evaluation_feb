import React, { useState, useEffect, useMemo, useRef } from 'react';
import '../styles/kanbanboard.css';
import KanbanTask from './kanbantask';
import AddTaskModal from './addtask';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import ColumnManager from './columnmanager'
import 'react-toastify/dist/ReactToastify.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// import socket from '../socket';

const KanbanBoard = ({ tasks: initialTasks, onSave, onStatusChange, fetchTask }) => {
    const [tasks, setTasks] = useState(initialTasks);
    const [columns, setColumns] = useState([
        { id: 'backlog', name: 'Backlog', isDefault: true },
        { id: 'todo', name: 'To do', isDefault: true },
        { id: 'inprogress', name: 'In progress', isDefault: true },
        { id: 'done', name: 'Done', isDefault: true }
    ]);
    const [collapsedSections, setCollapsedSections] = useState({
        backlog: true,
        'todo': true,
        'inprogress': true,
        done: true
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [editingColumn, setEditingColumn] = useState(null);
    const isDraggingRef = useRef(false);

    useEffect(() => {
        console.log('initial:', initialTasks)
        if (initialTasks) {

            setTasks(initialTasks);
        }

    }, [initialTasks]);



    console.log('Tasks:', tasks);
    console.log('Columns:', columns);

    useEffect(() => {
        if (isDraggingRef.current && tasks) {
            const newTask = [...tasks]
            setTasks(newTask)
            console.log('useEffect task', tasks)
        }
    }, [isDraggingRef.current, tasks])

    useEffect(() => {
        const fetchColumns = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/column/columns', {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
                });

                const customColumns = response.data.map(col => ({
                    id: col.name.toLowerCase().replace(/\s+/g, '-'),
                    name: col.name,
                    isDefault: false,
                    _id: col._id,
                }));

                // Replace columns with merged default and fetched custom columns
                const mergedColumns = [
                    ...columns.filter(col => col.isDefault), // Default columns
                    ...customColumns, // Fetched columns
                ];

                // Remove duplicates
                const uniqueColumns = mergedColumns.filter(
                    (col, index, self) =>
                        index === self.findIndex(c => c.id === col.id)
                );

                setColumns(uniqueColumns);

                // Initialize collapsedSections for new columns
                setCollapsedSections(prev => ({
                    ...prev,
                    ...customColumns.reduce((acc, col) => ({
                        ...acc,
                        [col.id]: true,
                    }), {}),
                }));
            } catch (error) {
                console.error('Error fetching columns:', error);
            }
        };
        fetchColumns();

    }, []);

    const handleDragStart = () => {

        isDraggingRef.current = true;
    };

    const toggleSectionCollapse = (section) => {
        setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };


    const handleDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        try {
            const draggedTask = tasks.find(task => task._id === draggableId);

            // Create a new array of tasks for the source column
            const newTasks = Array.from(tasks);
            const [removed] = newTasks.splice(source.index, 1);
            newTasks.splice(destination.index, 0, { ...removed, status: destination.droppableId });

            // Update UI optimistically
            setTasks(newTasks);
            console.log('drag task', tasks)

            // Update backend
            const response = await axios.put(
                `http://localhost:5000/api/task/updateTaskStatus/${draggableId}`,
                {
                    status: destination.droppableId,
                    position: destination.index
                },
                {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                }
            );

            if (onStatusChange) {
                onStatusChange(draggedTask);
            }

            // socket.emit('task-updated', response.data);
        } catch (error) {
            console.error('Error updating task status:', error);
            toast.error('Failed to update task status');
            setTasks(tasks); // Revert to previous state
            console.log('error task:', tasks)
        }
    };


    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const response = await axios.put(
                `http://localhost:5000/api/task/updateTaskStatus/${taskId}`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    },
                }
            );

            const updatedTask = response.data;
            setTasks(prevTasks =>
                prevTasks?.map(task =>
                    task._id === taskId ? updatedTask : task
                )
            );
            console.log('updatedTask', tasks)
            onStatusChange(updatedTask);
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const handleAddColumn = async () => {
        if (!newColumnName.trim()) return;

        try {
            const response = await axios.post(
                'http://localhost:5000/api/column/columns',
                { name: newColumnName },
                {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                }
            );

            const newColumn = {
                id: newColumnName.toLowerCase().replace(/\s+/g, '-'),
                name: newColumnName,
                isDefault: false,
                _id: response.data._id
            };

            setColumns([...columns, newColumn]);
            setCollapsedSections(prev => ({
                ...prev,
                [newColumn.id]: true
            }));

            setNewColumnName('');
            setIsAddingColumn(false);
        } catch (error) {
            console.error('Error adding column:', error);
            toast.error('Failed to add column');
        }
    };

    const handleRenameColumn = async (columnId, newName) => {
        if (!newName.trim() || columns.find(col => col.isDefault && col._id === columnId)) {
            return;
        }

        try {
            await axios.put(
                `http://localhost:5000/api/column/columns/${columnId}`,
                { name: newName },
                {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                }
            );

            const newId = newName.toLowerCase().replace(/\s+/g, '-');
            setColumns(cols => cols.map(col =>
                col._id === columnId ? { ...col, name: newName, id: newId } : col
            ));

            // Update tasks with the new status name
            const tasksToUpdate = tasks.filter(task => task.status === columnId);
            for (const task of tasksToUpdate) {
                await handleStatusChange(task._id, newId);
            }

            setEditingColumn(null);
        } catch (error) {
            console.error('Error renaming column:', error);
            toast.error('Failed to rename column');
        }
    };

    const handleDeleteColumn = async (columnId) => {
        try {

            await axios.delete(
                `http://localhost:5000/api/column/columns/${columnId}`,
                {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                }
            );

            // Move tasks to backlog
            const tasksToMove = tasks.filter(task =>
                task.status === columns.find(col => col._id === columnId)?.id
            );

            for (const task of tasksToMove) {
                await handleStatusChange(task._id, 'backlog');
            }

            setColumns(cols => cols.filter(col => col._id !== columnId));
        } catch (error) {
            console.error('Error deleting column:', error);
            toast.error('Failed to delete column');
        }
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
        console.log('checklist', tasks)

        axios.put(`http://localhost:5000/api/task/updateChecklist/${taskId}`, {
            checklistIndex,
            completed: updatedChecklist[checklistIndex].completed
        }, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
        })
            .then(response => {
                const updatedTask = response.data;
                setTasks(prevTasks =>
                    prevTasks?.map(t =>
                        t._id === taskId ? updatedTask : t
                    )
                );
                console.log('updatechecklist', tasks)
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
        fetchTask()
        const taskExists = tasks.some(task => task._id === newTask._id);
        if (!taskExists) {
            setTasks(prevTasks => [...prevTasks, newTask]);
            console.log('handleSave', tasks)
            if (onSave) {
                onSave(newTask);
            }
        }
        // setTasks(prevTasks => [...prevTasks, newTask]);
        // onSave(newTask);
        setIsModalOpen(false);
    };

    const handleDeleteTask = (taskId) => {
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
        console.log('delete task', tasks)
    };

    const callToast = () => {
        toast('Link copied!')
    };

    // Create task groupings for each column
    const tasksByColumn = useMemo(() => {
        return columns.reduce((acc, column) => ({
            ...acc,
            [column.id]: tasks.filter(task => task.status === column.id)
        }), {});
    }, [columns, tasks]);
    const memoizedColumns = useMemo(() => columns, [columns]);


    return (
        <div className="kanban-board">
            <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
                {columns.map(column => (
                    <div key={column.id} className="kanban-column">
                        <div className="kanban-column-header">
                            <ColumnManager
                                column={column}
                                onRename={handleRenameColumn}
                                onDelete={handleDeleteColumn}
                            />
                            <div className="btns-todo">
                                {column.id === 'todo' && (
                                    <button className="add-btn" onClick={handleOpenModal}>+</button>
                                )}
                                <button
                                    onClick={() => toggleSectionCollapse(column.id)}
                                    className="collapse-btn"
                                >
                                    <i className="fas fa-clone"></i>
                                </button>
                            </div>
                        </div>

                        <Droppable droppableId={column.id} key={column._id}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`kanban-column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''
                                        }`}
                                >
                                    {tasksByColumn[column.id]?.map((task, index) => (
                                        <Draggable
                                            key={task._id}
                                            draggableId={task._id}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`kanban-task ${snapshot.isDragging ? 'dragging' : ''
                                                        }`}
                                                >
                                                    <KanbanTask
                                                        task={task}
                                                        isCollapsed={collapsedSections[column.id]}
                                                        toggleChecklistItem={toggleChecklistItem}
                                                        onStatusChange={handleStatusChange}
                                                        onDelete={handleDeleteTask}
                                                        callToast={callToast}
                                                        key={task._id}
                                                        setTask={setTasks}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </DragDropContext>

            {isAddingColumn ? (
                <div className="add-column-form">
                    <input
                        type="text"
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        placeholder="New column name"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleAddColumn();
                            }
                        }}
                        autoFocus
                    />
                    <button onClick={handleAddColumn}>Add</button>
                    <button onClick={() => setIsAddingColumn(false)}>Cancel</button>
                </div>
            ) : (
                <button className="add-column-btn" onClick={() => setIsAddingColumn(true)}>
                    + Add Column
                </button>
            )}

            {isModalOpen && (
                <AddTaskModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default KanbanBoard;