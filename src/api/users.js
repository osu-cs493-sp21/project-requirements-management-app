const router = require('express').Router()
exports.router = router
const multer = require('multer')
var crypto = require('crypto')

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

const acceptedFileTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const upload = multer({
  storage: multer.diskStorage({
    destination: `${appRoot}/userImages`,
    filename: (req, file, callback) => {
      const filename = crypto.pseudoRandomBytes(16).toString('hex');
      const extension = acceptedFileTypes[file.mimetype];
      callback(null, `${filename}.${extension}`);
    }
  }),
  fileFilter: (req, file, callback) => {
    callback(null, !!acceptedFileTypes[file.mimetype])
  }
});

router.put('/:userId/photo', upload.single('photo'), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    if (isNaN(userId)) { throw "User ID in path is not valid" }

    if (!req.file) { throw "You must provide a jpg or png file" }
    console.log(req.file.filename)

    const user = await seqUser.findOne({ where: { id: userId } })
    if (!user) { throw "User ID not found in database" }
    if (req.user.projectId != 1 && req.user.projectId != user.projectId) {
      throw "You are not authorized to view this user"
    }

    user.photoPath = `/userImages/${req.file.filename}`
    user.save()

    res.status(200).json({
      photo: user.photoPath
    })
  } catch (error) { res.status(400).json({ error: error }) }
})

router.post('/', async (req, res) => {
  try {
    if (req.user.projectId != 1) { throw "You are not authorized to create new users" }
    const user = req.body
    await seqUser.build(user).validate()
    const existingUser = await seqUser.findOne({ where: { email: user.email } })
    if (existingUser) { throw "Account already exists" }
    let createResult = await newUser.save()
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

router.get('/:userId/', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    if (isNaN(userId)) { throw "User ID in path is not valid" }

    const user = await seqUser.findOne({ where: { id: userId } })
    if (!user) { throw "User not found" }

    if (req.user.projectId != 1 && req.user.projectId != user.projectId) {
      throw "You are not authorized to view this user"
    }

    res.status(200).json(user)
  } catch (error) { res.status(400).json({ error: error }) }
});

router.put('/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    if (isNaN(userId)) { throw "User ID in path is not valid" }
    const newUserData = req.body
    if (req.user.projectId != 1) { throw "You are not authorized to edit users" }
    const user = await seqUser.findOne({ where: { id: userId } })
    if (!user) { throw "User not found" }
    const success = await user.update(newUserData)
    if (!success) { throw "Error editing user" }
    res.status(202).json({
      links: { user: `/users/${userId}` }
    })
  } catch (error) { res.status(400).json({ error: error }) }
})


router.delete('/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    if (isNaN(userId)) { throw "User ID in path is not valid" }
    if (req.user.projectId != 1) { throw "You are not authorized to delete this User" }

    const success = await seqUser.destroy({ where: { id: userId } });

    if (!success) { throw "Error deleting User" }

    res.status(202).json()
  } catch (error) { res.status(400).json({ error: error }) }
})
