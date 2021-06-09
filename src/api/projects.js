const router = require('express').Router()
exports.router = router

router.get('/', async (req, res) => {
  try {
    if (req.user.projectId != 1) { throw "You are not authorized to list all projects" }

    const projects = await seqProject.findAll()

    if (!projects) { throw "Error getting list of projects." }
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


router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (req.user.projectId != 1 && req.user.projectId != id) { throw "You are not authorized to view this user" }

    const project = await seqProject.findOne({ where: { id: id } })

    features = await seqFeature.findAll({ where: { ProjectId: id } })

    for (i in features){
      definitions = await seqDefinition.findAll({ where:{ featureId: features[i].id } })
      questions = await seqQuestion.findAll({ where: { featureId: features[i].id } })
    }

    if (!project) { throw "Project ID not found in database" }
    res.status(200).json({
      id: project.id,
      name: project.name,
      features: features,
      definitions: definitions,
      questions: questions
    })
  } catch (error) { res.status(400).json({ error: error }) }
})

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (req.user.projectId != 1 ) { throw "You are not authorized to view this user" }

    if (!req.body.name) { throw "Invalid request body." }

    const success = await seqProject.update({ name: req.body.name }, {
                      where: { id: id }
                    });

    if (!success) { throw "Error editting Project" }
    const project = await seqProject.findOne({ where: { id: id } })

    res.status(201).json({
      id: project.id,
      name: project.name
    })
  } catch (error) { res.status(400).json({ error: error }) }
})

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (req.user.projectId != 1 ) { throw "You are not authorized to view this user" }

    const success = await seqProject.destroy({ where: { id: id } });

    if (!success) { throw "Error deleting Project" }

    res.status(202).json()
  } catch (error) { res.status(400).json({ error: error }) }
})
