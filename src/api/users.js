const router = require('express').Router()
exports.router = router

router.get('/', async (req, res) => {
  try {
    if (req.user.projectId != 1) { throw "You are not authorized to list all projects" }

    const users = await seqUser.findAll()

    if (!users) { throw "Error getting list of users." }
    res.status(200).json({
      users
    })
  } catch (error) { res.status(400).json({ error: error }) }
})

router.get('/:id/photo', async (req, res) => {
  try { // TODO: This should return a photo, not json.
    const userId = parseInt(req.params.id)
    const userPhoto = await seqUser.findOne({ where: { id: userId } })
    if (req.user.projectId != 1 && req.user.projectId != userPhoto.projectId) { throw "You are not authorized to view this user" }
    if (!userPhoto) { throw "User ID not found in database" }
    res.status(200).json({
      photo: userPhoto.photoPath
    })
  } catch (error) { res.status(400).json({ error: error }) }
})

router.post('/', async (req, res) => {
  try {
    if (req.user.projectId != 1) { throw "You are not authorized to create new users" }
    const user = req.body
    const existingUser = await seqUser.findOne({ where: { email: user.email } })
    if (existingUser) { throw "Account already exists" }
    let createResult = await seqUser.create(user)
    res.status(201).json({
      id: createResult.id,
      links: {
        user: `/users/${createResult.id}`
      }
    })
  } catch (error) { res.status(400).json({ error: error }) }
})

router.get('/login/', async (req, res) => {
  try {
    const user = await seqUser.scope("includePassword").findOne({ where: { email: req.body.email } })
    if (!user || !(await user.checkPassword(req.body.password))) { throw "Invalid email or password" }
    const token = jwt.sign(
      { 
        id: user.id,
        projectId: user.projectId 
      },
      jwtSecret,
      { expiresIn: '30d' })
    res.status(200).json({ jwt: token })
  } catch (error) { res.status(400).json({ error: error }) }
})

router.get('/:id/', async (req, res) => {
  try {
    const user = await seqUser.findOne({ where: { id: req.params.id } })
    if (!user) { throw "User not found" }
    if (
      req.user.projectId != 1
      && req.user.projectId != user.projectId) { throw "You are not authorized to view this user" }
    res.status(200).json(user)

  } catch (error) { res.status(400).json({ error: error }) }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (req.user.projectId != 1 ) { throw "You are not authorized to edit this user" }

    const oldUser = await seqUser.findOne({ where: { id: id } })

    let updateData = {};
    updateData.name = req.body.name || user.name;
    updateData.email = req.body.email || user.email;
    updateData.photoPath = req.body.photoPath || user.photoPath;
    updateData.password = req.body.password || user.password;
    const success = await seqUser.update(updateData, { where: { id: id } })

    if (!success) { throw "Error editting Project" }
    const newUser = await seqUser.findOne({ where: { id: id } })

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      photoPath: newUser.photoPath,
      projectId: newUser.projectId
    })
  } catch (error) { res.status(400).json({ error: error }) }
})


router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (req.user.projectId != 1 ) { throw "You are not authorized to delete this User" }

    const success = await seqUser.destroy({ where: { id: id } });

    if (!success) { throw "Error deleting User" }

    res.status(202).json()
  } catch (error) { res.status(400).json({ error: error }) }
})
