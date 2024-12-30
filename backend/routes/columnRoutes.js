const express = require('express');
const router = express.Router();
const Column = require('../models/Column');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Get user's columns
router.get('/columns', auth, async (req, res) => {
    try {
        const columns = await Column.find({ userId: req.user._id }).sort('order');
        res.json(columns);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching columns' });
    }
});

// Add new column
router.post('/columns', auth, async (req, res) => {
    try {
        const { name } = req.body;
        const lastColumn = await Column.findOne({ userId: req.user._id }).sort('-order');
        const order = lastColumn ? lastColumn.order + 1 : 0;

        const column = new Column({
            name,
            order,
            userId: req.user._id
        });

        await column.save();
        res.status(201).json(column);
    } catch (error) {
        res.status(500).json({ message: 'Error creating column' });
    }
});

// Rename column
router.put('/columns/:columnId', auth, async (req, res) => {
    try {
        const { name } = req.body;
        const column = await Column.findOneAndUpdate(
            { _id: req.params.columnId, userId: req.user._id },
            { name },
            { new: true }
        );

        if (!column) {
            return res.status(404).json({ message: 'Column not found' });
        }

        res.json(column);
    } catch (error) {
        res.status(500).json({ message: 'Error updating column' });
    }
});

// Delete column
router.delete('/columns/:columnId', auth, async (req, res) => {
    console.log('Deleting column');
    try {
        const column = await Column.findOne({
            _id: req.params.columnId,
            userId: req.user._id,
            isDefault: false
        });
        console.log('Column found:', column);

        if (!column) {
            return res.status(404).json({ message: 'Column not found or cannot be deleted' });
        }

        // Move tasks to backlog
        const columnName = column.name.toLowerCase();
        const updatedTasks = await Task.updateMany(
            { status: columnName },
            { status: 'backlog' }
        );
        console.log(`${updatedTasks.modifiedCount} tasks moved to backlog`);

        // Delete the column
        const deletedColumn = await Column.findByIdAndDelete(column._id);
        console.log('Column deleted:', deletedColumn);

        res.json({ message: 'Column deleted successfully' });
    } catch (error) {
        console.error('Error deleting column:', error);
        res.status(500).json({ message: 'Error deleting column' });
    }
});


// Sync columns when sharing tasks
router.post('/sync-columns', auth, async (req, res) => {
    try {
        const { targetUserId, columns } = req.body;

        // Get target user's existing columns
        const existingColumns = await Column.find({ userId: targetUserId });
        const existingColumnNames = new Set(existingColumns.map(c => c.name.toLowerCase()));

        // Add missing columns
        const columnsToAdd = columns.filter(c => !existingColumnNames.has(c.name.toLowerCase()));

        if (columnsToAdd.length > 0) {
            const lastOrder = existingColumns.length > 0
                ? Math.max(...existingColumns.map(c => c.order))
                : -1;

            const newColumns = columnsToAdd.map((column, index) => ({
                name: column.name,
                order: lastOrder + index + 1,
                userId: targetUserId
            }));

            await Column.insertMany(newColumns);
        }

        res.json({ message: 'Columns synchronized successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error synchronizing columns' });
    }
});

module.exports = router;