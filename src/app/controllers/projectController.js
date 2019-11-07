const express = require('express')
const authMiddleware = require('../middleware/auth')
const Project = require('../models/project')
const Tasks = require('../models/tasks')

const router = express.Router()
router.use(authMiddleware)


//list
router.get('/', async (req, res) => {
    try {                                          //trazer user
        const listProjects = await Project.find().populate(['user', 'tasks'])

        if (!listProjects)
            return res.send('empty list')

        return res.send({ listProjects })
    } catch (error) {
        console.log(error)
        return res.status(400).send({ error: 'Error loading projects' })
    }
})

// get One
router.get('/:projectId', async (req, res) => {
    try {                                          //trazer user
        const project = await Project.findById(req.params.projectId).populate('user')

        if (!project)
            return res.send(':(')

        return res.send({ project })
    } catch (error) {
        console.log(error)
        return res.status(400).send({ error: 'Error loading project' })
    }
})

//create
router.post('/', async (req, res) => {
    try {
        const { title, description, tasks } = req.body
        const project = await Project.create({ title, description, user: req.userId })

        await Promise.all(tasks.map(async task => {
            const projectTask = new Tasks({ ...task, project: project._id })

            await projectTask.save()
            project.tasks.push(projectTask)

        }))

        await project.save()

        res.send({ project })
    } catch (error) {
        console.log(error)
        return res.status(400).send({ error: 'Error creating new project' })
    }
})

router.put('/:projectId', async (req, res) => {
    try {
        const { title, description, tasks } = req.body
        
        const project = await Project.findByIdAndUpdate(req.params.projectId, { 
            title, 
            description 
        },{ new: true })
        
        project.tasks = []
        await Tasks.remove({ project: project._id })

        await Promise.all(tasks.map(async task => {
            const projectTask = new Tasks({ ...task, project: project._id })

            await projectTask.save()
            project.tasks.push(projectTask)

        }))

        await project.save()

        res.send({ project })
    } catch (error) {
        console.log(error)
        return res.status(400).send({ error: 'Error updating new project' })
    }
})

//delete
router.delete('/:projectId', async (req, res) => {
    try {                                          //trazer user
        await Project.findByIdAndDelete(req.params.projectId).populate('user')
        
        return res.send("ok")
    } catch (error) {
        console.log(error)
        return res.status(400).send({ error: 'Error deleting project' })
    }
})

module.exports = app => app.use('/projects', router)