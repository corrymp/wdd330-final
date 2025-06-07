const express = require('express');
const controller = require('./controller.js');
const router = express.Router();

router.use(express.static('public'));
router.use('/styles', express.static(__dirname + 'public/styles'));
router.use('/scripts', express.static(__dirname + 'public/scripts'));
router.use('/images', express.static(__dirname + 'public/images'));

router.get('/about', controller.about);
router.get('/links', controller.links);
router.get('/proposal', controller.proposal);
router.get('/', controller.home);

module.exports = router;
