const router = module.exports = require('express').Router();

router.use('/users', require('./users').router);

router.use('/projects/', require('./definitions').router);
router.use('/projects/', require('./questions').router);
router.use('/projects/', require('./features').router);
router.use('/projects', require('./projects').router);
