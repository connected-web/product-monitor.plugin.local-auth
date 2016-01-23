var expect = require('chai').expect;
var plugin = require('../local-auth/plugin.js');

describe('Plugin API', function() {

    var instance;

    beforeEach(function() {
        instance = plugin();
    });

    it('should provide info about the plugin', function() {
        var actual = instance.info();
        expect(actual).to.have.property('name');
        expect(actual).to.have.property('description');
        expect(actual).to.have.property('keywords');
    });

    it('should apply methods to the supplied application', function(done) {
        var expectedTasks = {
            "addContentPage": false,
            "serverPost:/auth/local/login": false,
            "serverPost:/auth/local/sha1sum": false,
            "enableAuthentication:local:/docs/local-login": false
        };

        function complete(task) {
            if (expectedTasks.hasOwnProperty(task)) {
                expectedTasks[task] = true;
                var completed = Object.keys(expectedTasks)
                    .map((task) => expectedTasks[task])
                    .reduce((previousValue, currentValue, currentIndex, array) => previousValue && currentValue);
                if (completed) {
                    done();
                }
            } else {
                console.log('Unexpected task:', task);
            }
        }

        var app = {
            addContentPage: () => complete('addContentPage'),
            server: {
                get: (path, req, res) => complete('serverGet:' + path),
                post: (path, req, res) => complete('serverPost:' + path)
            },
            enableAuthentication: (options) => complete('enableAuthentication:' + options.name + ':' + options.url)
        };
        instance.apply(app);
    });

    it('should provide a default config', function() {
        var actual = instance.getConfig();
        expect(actual).to.deep.equal({});
    });

    it('should allow the default config to be changed', function() {
        var expected = {
            validation: true
        };
        expect(instance.getConfig()).to.not.deep.equal(expected);

        instance.setConfig(expected);
        expect(instance.getConfig()).to.deep.equal(expected);
    });
});