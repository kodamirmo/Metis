var fs      = require('fs'),
    colors  = require('colors'),
    Satan   = require('pm2/lib/Satan'),
    pm2cst  = require('pm2/constants'),
    mkdirp  = require('mkdirp'),
    Emitter = require('events').EventEmitter;

var config  = require('./config');

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

api.version = require('../package.json').version

/////////////////////////////////////////////////////////////////////////

function readJSON (file) {
    if (!fs.existsSync(file)) {
        return null
    } else {
        return JSON.parse(fs.readFileSync(file, 'utf-8'))
    }
}

module.exports = api;