import express from 'express'
import { createTask, getTasks } from '../controller/task.controller.js'

const router = express.Router()


router.post('/tasks', createTask)
router.get('/getTasks', getTasks)


export default router
