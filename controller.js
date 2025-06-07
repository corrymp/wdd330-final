const controller = {};

controller.home = async (req, res) => res.render('index', {title: 'Home', desc: `Home page view for CorryMP's final project in WDD330`});
controller.about = async (req, res) => res.render('about', {title: 'About', desc: `About page view for CorryMP's final project in WDD330`});
controller.links = async (req, res) => res.render('links', {title: 'Links', desc: `Links page view for CorryMP's final project in WDD330`});
controller.proposal = async (req, res) => res.render('proposal', {title: 'Proposal', desc: `CorryMP's final project proposalfor their classwork in WDD330`});

module.exports = controller;
