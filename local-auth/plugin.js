var crypto = require('crypto');
var passport = require('passport');
var passportLocal = require('passport-local');
var bodyParser = require('body-parser');

var defaultConfig = {};

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

    var sha1sum = function(input) {
        return crypto.createHash('sha1').update(JSON.stringify(input)).digest('hex')
    }

    function registerStrategy(app) {
        var users = app.users;
        passport.use(new passportLocal.Strategy(
            function(username, password, done) {
                const matcher = (user) => (user.username + '').toLowerCase() === (username + '').toLowerCase();
                users.findUsersBy(matcher)
                    .then(function(users) {
                        const user = users[0] || false;
                        if (!user) {
                            console.log('[Local Auth] Invalid username', username);
                            return done(null, false, {
                                message: 'Incorrect username.'
                            });
                        }
                        if (user.passwordHash !== sha1sum(password)) {
                            console.log('[Local Auth] Invalid password provided for', username);
                            return done(null, false, {
                                message: 'Incorrect password.'
                            });
                        }
                        console.log('[Local Auth] Authenticated user', username);
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

        server.post('/auth/local/sha1sum', function(req, res) {
            var value = req.body.value;
            res.jsonp({
                sha1sum: sha1sum(value)
            });
        });

        app.enableAuthentication({
            name: 'local',
            url: '/docs/local-login'
        });
    }

    function apply(app) {
        registerStrategy(app);
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