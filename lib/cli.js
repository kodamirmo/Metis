var fs     = require('fs'),
    path   = require('path'),
    colors = require('colors'),
    mkdirp = require('mkdirp'),
    mlog   = require('./mlog')
    api    = require('./api'),
    git    = require('nodegit');

var rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var conf = require('./config'),
    globalConfigPath = conf.path;


/////////////////////////////////  CLI /////////////////////////////////

var cli = {

	help: function(){
        console.log('\n  METIS '.green + 'v' + api.version);
        process.exit(0);
    },

    deploy : function(repoURL){
    	if (!repoURL) exit();
    	api.deploy(repoURL,outputCallback);
    	process.exit(0);
    }

};

////////////////////////////////////////////////////////////////////////

// Init CLI
if (!fs.existsSync(globalConfigPath)) {
    if (process.env.METIS_ROOT_DIR) return createRootDir(process.env.METIS_ROOT_DIR);
    console.log(
    	'=============================== METIS ==============================='.green + '\n' +
        'Hello! It seems it\'s your first time running metis on this machine.\n' +
        'Please specify a directory for metis to put stuff in.\n' +
        '- makeDirectories sure your account has full access to that directory.\n' +
        '- You can use relative paths (resolved against your cwd).'
    );
    rl.question('path: ', createRootDir);
} else {
    loadAPI();
}

function createRootDir (dir) {

	//Check if 'dir' is home path
    if (dir.charAt(0) === '~') { 
        dir = process.env.HOME + dir.slice(1);
    } else {
        dir = path.resolve(process.cwd(), dir);
    }

    if (fs.existsSync(dir)) {
        if (!fs.statSync(dir).isDirectory()) {
            mlog.warn('Target path ' + dir.grey + ' is not a directory.');
            process.exit(1);
        } else {
            initConfig(dir);
            loadAPI();
        }
    } else {
        if (process.env.TEST) return makeDirectories(dir);
        rl.question('Target path ' + dir.grey + ' doesn\'t exist. create it? (y/N)', function (reply) {
            if (reply.toLowerCase() === 'y') {
                makeDirectories(dir);
            } else {
                process.exit(0);
            }
        });
    }
}

function makeDirectories (dir) {
 
    mkdirp.sync(dir)
    mlog.log('created root directory: ' + dir.grey);
    fs.mkdirSync(dir + '/repos');
    mlog.log('created repos directory: ' + (dir + '/repos').grey);
    fs.mkdirSync(dir + '/apps');
    mlog.log('created apps directory: ' + (dir + '/apps').grey);
    initConfig(dir);
    mlog.log('created config file at: ' + globalConfigPath.grey);
}

function initConfig (root) {
    var globalConfig = {
        root: root,
        node_env: 'development',
        apps: {}
    };
    mkdirp.sync(globalConfigPath.slice(0, globalConfigPath.lastIndexOf('/')));
    fs.writeFileSync(globalConfigPath, JSON.stringify(globalConfig, null, 4));
}

function loadAPI () {
    api = require('./api');
    api.once('ready', parseCommand);
}

function parseCommand () {
    var args = process.argv.slice(2),
        command = args[0] || 'help';
    if (cli[command]) {
        cli[command].apply(null, args.slice(1));
    } else {
        if (command) {
            mlog.warn('unknown command ' + command.red);
            process.exit(1);
        }
    }
}

function outputCallback(err, msg) {
    if (err) {
        mlog.warn(err);
        process.exit(1);
    } else {
        mlog.log(msg);
        process.exit(0);
    }
}

function exit () {
    mlog.warn('Invalid command arguments');
    process.exit(1);
}