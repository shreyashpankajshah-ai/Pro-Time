// routes/tasks.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Initialize Firebase Admin (Requires your Firebase service account key JSON)
// var serviceAccount = require("../path/to/your/serviceAccountKey.json");
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
// const db = admin.firestore();

/* Note: Until you add your Firebase JSON key, we will use an advanced in-memory 
   simulation to test the API endpoints without crashing. */
let dbSimulation = []; 

// @route   GET /api/v1/tasks
// @desc    Retrieve all tasks sorted by time
router.get('/', async (req, res) => {
    try {
        // Firebase code would be:
        // const snapshot = await db.collection('tasks').orderBy('time').get();
        // const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const tasks = dbSimulation.sort((a, b) => a.time.localeCompare(b.time));
        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database Synchronization Failure' });
    }
});

// @route   POST /api/v1/tasks
// @desc    Inject a new task into the system
router.post('/', async (req, res) => {
    try {
        const { title, time, priority } = req.body;
        
        if (!title || !time) {
            return res.status(400).json({ success: false, error: 'Missing critical parameters' });
        }

        const newTask = { title, time, priority, status: 'pending', createdAt: new Date().toISOString() };
        
        // Firebase code would be:
        // const docRef = await db.collection('tasks').add(newTask);
        // newTask.id = docRef.id;

        newTask.id = Date.now().toString();
        dbSimulation.push(newTask);

        res.status(201).json({ success: true, data: newTask });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Injection Failed' });
    }
});

// @route   PATCH /api/v1/tasks/:id/status
// @desc    Toggle task completion status
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'pending' or 'completed'
        
        // Firebase code would be:
        // await db.collection('tasks').doc(id).update({ status });
        
        const taskIndex = dbSimulation.findIndex(t => t.id === id);
        if (taskIndex === -1) return res.status(404).json({ success: false, error: 'Node not found' });
        
        dbSimulation[taskIndex].status = status;

        res.status(200).json({ success: true, data: dbSimulation[taskIndex] });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Update Protocol Failed' });
    }
});

module.exports = router;