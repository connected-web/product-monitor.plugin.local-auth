var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var passport = require('passport');
var passportLocal = require('passport-local');

var defaultConfig = require('./defaultConfig.json');

function create() {
    var pluginConfig = defaultConfig;

    var User = {
        findOne: function(username) {
            return Promise.accept(pluginConfig.users[username] || false);
        }
    };

    function getConfig() {
        return pluginConfig;
    }

    function setConfig(config) {
        pluginConfig = config;
    }

    function info() {
        return require('../package.json');
    }

    function registerStrategy() {
        passport.use(new passportLocal.Strategy(
            function(username, password, done) {
                User.findOne(username)
                    .then(function(user) {
                        if (!user) {
                            return done(null, false, {
                                message: 'Incorrect username.'
                            });
                        }
                        if (user.password !== password) {
                            return done(null, false, {
                                message: 'Incorrect password.'
                            });
                        }
                        return done(null, user);
                    })
                    .catch(done);
            }));

        passport.serializeUser(function(user, done) {
            done(null, user);
        });

        passport.deserializeUser(function(user, done) {
            done(null, user);
        });
    }

    function registerContentRoutes(app) {
        app.addContentPage(__dirname + '/pages/login.fragment.html');
        app.addContentPage(__dirname + '/pages/logout.fragment.html');
    }

    function registerAuthRoutes(server) {
        server.use(cookieParser());
        server.use(bodyParser.urlencoded({
            extended: true
        }));
        server.use(bodyParser.json());
        server.use(expressSession({
            secret: 'keyboard cat',
            resave: false,
            saveUninitialized: false
        }));
        server.use(passport.initialize());
        server.use(passport.session());

        server.post('/auth/login',
            passport.authenticate('local', {
                successRedirect: '/',
                failureRedirect: '/docs/login'
            })
        );

        server.get('/auth/user', function(req, res) {
            res.jsonp({
                user: req.user
            });
        });

        server.get('/auth/logout', function(req, res) {
            req.logout();
            res.redirect('/docs/logout');
        });
    }

    function apply(app) {
        registerStrategy();
        registerContentRoutes(app);
        registerAuthRoutes(app.server);
    }

    return {
        info,
        apply,
        getConfig,
        setConfig
    };
}

module.exports = create;