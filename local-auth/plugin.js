var passport = require('passport');
var passportLocal = require('passport-local');

var defaultConfig = require('./defaultConfig.json');

function create() {
    var pluginConfig = defaultConfig;

    var User = {
        findOne: function(username) {
            var user = pluginConfig.users[username] || false;
            return Promise.accept(user);
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
                            console.log('X', user);
                            return done(null, false, {
                                message: 'Incorrect username.'
                            });
                        }
                        if (user.password !== password) {
                            console.log('Y', user);
                            return done(null, false, {
                                message: 'Incorrect password.'
                            });
                        }
                        console.log('Z', user);
                        return done(null, user);
                    })
                    .catch(done);
            }));
    }

    function registerContentRoutes(app) {
        app.addContentPage(__dirname + '/pages/local-login.fragment.html');
        app.addContentPage(__dirname + '/pages/logout.fragment.html');
    }

    function registerAuthRoutes(app) {
        var server = app.server;

        server.post('/auth/local/login',
            passport.authenticate('local', {
                successRedirect: '/',
                failureRedirect: '/docs/local-login'
            })
        );

        app.enableAuthentication({
            name: 'local',
            url: '/docs/local-login'
        });
    }

    function apply(app) {
        registerStrategy();
        registerContentRoutes(app);
        registerAuthRoutes(app);
    }

    return {
        info,
        apply,
        getConfig,
        setConfig
    };
}

module.exports = create;