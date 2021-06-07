const router = require('express').Router()
exports.router = router

// Route to list all of a user's photos.
router.get('/:userId/photo', async (req, res) => {
  const userId = parseInt(req.params.userId);
  const userPhoto = await seqUser.findOne({ where: { id: userId } })
  res.status(200).json({
    photo: userPhoto.photoPath
  });
});

// Create user
router.post('/', async (req, res) => {
  console.log(req.body)
  const user = req.body
  const existingUser = await seqUser.findOne({ where: { email: user.email } })
  if (existingUser) {
    res.status(400).json({ error: "Account already exists" });
  } else {
    let createResult = await seqUser.create(user);
    console.log(createResult)
    res.status(201).json({
      id: createResult.id,
      links: {
        user: `/users/${createResult.id}`
      }
    })
  }
});

// // Login
// router.get('/login', async (req, res) => {
//   const user = await seqUser.scope("includePassword").findOne({ where: { email: req.body.email } })
//   if (user && await user.checkPassword(req.body.password)) {
//     const token = jwt.sign({
//       id: user.id,
//       admin: user.admin
//     }, jwtSecret, { expiresIn: '5h' });
//     res.status(200).json({ jwt: token });
//   } else {
//     res.status(401).json({ error: "Invalid login" });
//   }
// });

// router.get('/:userid/', async (req, res) => {
//   if ((req.user && parseInt(req.user.id) == parseInt(req.params.userid) || req.user.admin == true)) {
//     const user = await seqUser.findOne({ where: { id: req.params.userid } })
//     if (user) {
//       res.status(200).json(user);
//     } else {
//       res.status(400).json({ error: "User not found" });
//     }
//   } else {
//     res.status(401).json({ error: "Not authorized" });
//   }
// });