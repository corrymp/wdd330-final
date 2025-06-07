const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const router = require('./router.js');
const app = express();
require('dotenv').config();
//const utils = require('./util.js');
const port = process.env.PORT;
const host = process.env.HOST;

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', './layouts/layout');
app.use(router);
app.get('/',);
app.use(async (req, res, next) => next({status: 404, message: 'Page Not Found'}));
app.use(async (err, req, res, next) => {
    console.error(`=== ERROR ===\nat: "${req.originalUrl}"\nmsg: ${err.message}\n=== ENDERROR ===`);

    res.status(err.status || 500).render('error', {
        title: err.status || 500,
        desc: `Error page from CorryMP's final project in WDD330`,
        message: err.status === 404 ? err.message : 'Internal Server Error'
    });
});

app.listen(port, () => console.log(`app started - listening on ${host}:${port}`));
