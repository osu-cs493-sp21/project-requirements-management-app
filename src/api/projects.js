const router = require('express').Router()
exports.router = router

router.get('/', async (req, res) => {
  try {
    if (req.user.projectId != 1) { throw "You are not authorized to list all projects" }

    const projects = await seqProject.findAll()

    if (!projects) { throw "Error getting projects." }
    res.status(200).json({
      projects
    })
  } catch (error) { res.status(400).json({ error: error }) }
})


router.post('/', async (req, res) => {
  try {
    if (req.user.projectId != 1) { throw "You are not authorized to create new projects" }
    const project = req.body
    const existingProject = await seqProject.findOne({ where: { name: project.name } })
    if (existingProject) { throw "Project name already exists" }
    let createResult = await seqProject.create(project)
    res.status(201).json({
      id: createResult.id
    })
  } catch (error) { res.status(400).json({ error: error }) }
})


router.get('/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId)
    if (req.user.projectId != 1) { throw "You are not authorized to view this project" }

    const project = await seqProject.findOne({ where: { id: projectId } })

    if (!project) { throw "Project ID not found in database" }
    res.status(200).json({
      id: project.id,
      name: project.name
    })
  } catch (error) { res.status(400).json({ error: error }) }
})

router.put('/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId)
    if (req.user.projectId != 1) { throw "You are not authorized to edit this project" }

    if (!req.body.name) { throw "Invalid request body." }

    const project = await seqProject.update({ name: req.body.name }, {
                      where: { id: projectId }
                    });

    if (!project) { throw "Project ID not found in database" }


    res.status(200).json({
      id: project.id,
      name: project.name
    })
  } catch (error) { res.status(400).json({ error: error }) }
})
