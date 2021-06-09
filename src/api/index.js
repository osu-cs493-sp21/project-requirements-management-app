const router = module.exports = require('express').Router();

router.use('/projects/:projectId/feature/', require('./features').router);
router.use('/users', require('./users').router);
