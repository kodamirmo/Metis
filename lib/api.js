var fs      = require('fs'),
    colors  = require('colors'),
    Satan   = require('pm2/lib/Satan'),
    pm2cst  = require('pm2/constants'),
    mkdirp  = require('mkdirp'),
    Emitter = require('events').EventEmitter,
    shell   = require('shelljs'),
    under   = require('underscore'),
    async   = require('async');

var config  = require('./config'),
    ERRORS  = require('./errors');

var globalConfigPath = config.path,
    globalConfig     = readJSON(globalConfigPath);


// If env var is present, overwrite root dir
// mostly for testing.
if (process.env.METIS_ROOT_DIR) globalConfig.root = process.env.METIS_ROOT_DIR;

// create default folders
if (!fs.existsSync(globalConfig.root)) mkdirp.sync(globalConfig.root);
if (!fs.existsSync(globalConfig.root + '/apps')) fs.mkdirSync(globalConfig.root + '/apps');
if (!fs.existsSync(globalConfig.root + '/repos')) fs.mkdirSync(globalConfig.root + '/repos');

// also do this for pm2
if (!fs.existsSync(pm2cst.DEFAULT_FILE_PATH)) {
    fs.mkdirSync(pm2cst.DEFAULT_FILE_PATH);
    fs.mkdirSync(pm2cst.DEFAULT_LOG_PATH);
    fs.mkdirSync(pm2cst.DEFAULT_PID_PATH);
}

var api = new Emitter();
Satan.start();
process.once('satan:client:ready', function () {
    api.emit('ready');
});

////////////////////////////////  API ///////////////////////////////////

api.version = require('../package.json').version;

api.test = function(){

}

api.deploy = function(repoURL, options, callback){

	//Check if callback is present
	if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    var regex = /((git|ssh|http(s)?)|(git@[\w\.]+))(:(\/\/)?)([\w\.@\:/\-~]+)(\.git)(\/)?/;

    if(regex.test(repoURL)){

        if (!shell.which('git')) {
            abort(ERRORS.NOT_GIT,callback);
        }else{
            var data = {
                repoURL       : repoURL,
                repoDirectory : globalConfig.root + '/repos/' + getFolderName(repoURL),
                appDirectory  : globalConfig.root + '/apps/'
            };

            var rawTemplate = '#!/bin/bash \n'  +
                              'git clone <%= repoURL %>  <%= repoDirectory %>; \n' + 
                              'cd <%= repoDirectory %>; \n' + 
                              'meteor build --directory <%= appDirectory %>; ',

                template    = under.template(rawTemplate);
                templateFile = template(data);

            var scriptPath = globalConfig.root + '/script';

            fs.writeFile(scriptPath, templateFile, function(err) {
                if(err) {
                    console.log(err);
                    return abort(ERRORS.URL_NOT_VALID , callback);
                } else {
                    shell.chmod('+x', scriptPath);
                    shell.exec(scriptPath, function(code, output){
                        console.log('Exit code:', code);
                        console.log('Program output:', output);
                        callback(null,'OK');
                    }); 
                }                
            });  
                
        }

    }else{
        return abort(ERRORS.URL_NOT_VALID , callback);
    }
};

/////////////////////////////////////////////////////////////////////////

function readJSON (file) {
    if (!fs.existsSync(file)) {
        return null;
    } else {
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
}

function getFolderName(repoURL) {
    return repoURL.substring(repoURL.lastIndexOf('/')+1,repoURL.lastIndexOf('.git'));
}

function abort (e, callback, data) {

    var msg = e.msg;
    if (data) {
        msg = msg.replace(/{{(.+?)}}/g, function (m, p1) {
            return data[p1] || '';
        });
    }
    var err = new Error(msg);
    err.code = e.code;

    callback(err);
}

module.exports = api;