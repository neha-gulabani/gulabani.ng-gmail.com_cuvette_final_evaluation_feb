const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const mongoose = require('mongoose');
const auth = require('../middleware/auth')



router.get('/fetchUsers', async (req, res) => {

    try {
        const users = await User.find({}, 'name email');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});



router.post('/addTask', auth, async (req, res) => {
    try {
        const { title, priority, dueDate, assignee, checklist } = req.body;
        const createdByObjectId = new mongoose.Types.ObjectId(req.user._id);

        const sharedUsers = await Task.find({ createdBy: createdByObjectId }).distinct('sharedWith');

        const assignees = assignee
            ? [new mongoose.Types.ObjectId(assignee), ...sharedUsers]
            : sharedUsers;

        const newTask = new Task({
            title,
            priority: priority.toLowerCase(),
            dueDate,
            createdBy: createdByObjectId,
            assignees,
            checklist
        });

        const savedTask = await newTask.save();
        await savedTask.populate('createdBy', 'name');
        res.status(201).json(savedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});




router.get('/tasks', auth, async (req, res) => {
    try {
        const userId = req.user._id;


        const usersWhoSharedWithCurrentUser = await User.find({
            sharedWith: userId
        }).select('_id');


        const sharedUserIds = usersWhoSharedWithCurrentUser.map(user => user._id);

        const tasks = await Task.find({
            $or: [
                { createdBy: userId },
                { assignees: userId },
                { createdBy: { $in: sharedUserIds } }
            ]
        }).populate('createdBy', 'name').populate('assignees', 'email');;



        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/analytics', auth, async (req, res) => {
    try {
        const userId = req.user._id;


        const sharedUsers = await User.find({ sharedWith: userId }).select('_id');
        const sharedUserIds = sharedUsers.map(user => user._id);

        const tasks = await Task.find({
            $or: [
                { createdBy: userId },
                { assignees: userId },
                { createdBy: { $in: sharedUserIds } }
            ]
        });


        const backlogTasks = tasks.filter(task => task.status === 'backlog').length;
        const toDoTasks = tasks.filter(task => task.status === 'to-do').length;
        const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
        const completedTasks = tasks.filter(task => task.status === 'done').length;


        const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;
        const moderatePriorityTasks = tasks.filter(task => task.priority === 'moderate').length;
        const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;


        const dueDateTasks = tasks.filter(task => task.dueDate !== null).length;

        res.status(200).json({
            backlogTasks,
            toDoTasks,
            inProgressTasks,
            completedTasks,
            lowPriorityTasks,
            moderatePriorityTasks,
            highPriorityTasks,
            dueDateTasks
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/updateTaskStatus/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { status },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ error: 'Failed to update task status' });
    }
});



router.put('/editTask/:taskId', auth, async (req, res) => {
    try {
        const { title, priority, dueDate, checklist, assignees } = req.body;
        const taskId = req.params.taskId;


        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            {
                $set: {
                    title: title,
                    priority: priority,
                    dueDate: dueDate,
                    checklist: checklist,
                    assignees: assignees
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.delete('/deleteTask/:taskId', auth, async (req, res) => {
    try {
        const { taskId } = req.params;


        const deletedTask = await Task.findByIdAndDelete(taskId);

        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;


        const task = await Task.findById(taskId).populate('createdBy', 'name');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/updateChecklist/:taskId', auth, async (req, res) => {
    const { taskId } = req.params;
    const { checklistIndex, completed } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.checklist[checklistIndex].completed = completed;
        await task.save();

        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/assignTasksToUser', auth, async (req, res) => {
    try {
        const { email } = req.body;
        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return res.status(404).json({ message: 'User not found' });
        }


        await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { sharedWith: userToAdd._id } },
            { new: true }
        );

        res.status(200).json({ message: `${email} now has access to your tasks.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});






module.exports = router;
