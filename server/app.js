import express from 'express'
import cors from 'cors'
import {
    getProjects,
    getProject,
    createProject
} from './database.js'

const app = express()

app.use(express.json())
app.use(cors())

app.get("/projects", async (req, res) => {
    const projects = await getProjects()
    res.json(projects)
})

app.get("/projects/:id", async (req, res, next) => {
    const id = req.params.id
    const project = await getProject(id)
    res.json(project)
})

app.post("/projects", async (req, res, next) => {
    const {title, contents} = req.body
    const note = await createProject(title, contents)
    res.status(201).json(note)
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong')
})

app.listen(8080, () => {
    console.log('listening on port 8080')
})