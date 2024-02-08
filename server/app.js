import express from 'express'
import cors from 'cors'
import {
    getProjects,
    getProject,
    createProject,
    deleteProject,
    updateProject
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
    const {title, contents, stack, team_name, team_members } = req.body
    const note = await createProject(title, contents, stack, team_name, team_members)
    res.status(201).json(note)
})

app.delete("/projects/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await deleteProject(id);
        if (result.affectedRows > 0) {
            res.status(200).send(`Project with ID ${id} deleted successfully.`);
        } else {
            res.status(404).send("Project not found.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Something went wrong');
    }
});

app.put("/projects/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, contents, stack, team_name, team_members } = req.body;

        const updatedProject = await updateProject(id, title, contents, stack, team_name, team_members);

        if (updatedProject) {
            res.json(updatedProject);
        } else {
            res.status(404).send("Project not found.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong')
})

app.listen(8080, () => {
    console.log('listening on port 8080')
})