const chalk = require('chalk');
const fs    = require('fs');
const os    = require('os');
const path  = require('path');

const cproc = require('child_process');
const spawn = cproc.spawn;

exports.command = 'ssh';
exports.desc = 'SSH to machine';

exports.handler = async argv => {
    (async () => {
        await ssh();
    })();
};

let identifyFile = path.join(os.homedir(), '.bakerx', 'insecure_private_key');
let sshExe = "ssh";
let sshArgs = ["-i", identifyFile, "-p", "2800", "-o", "StrictHostKeyChecking=no", "-o", "UserKnownHostsFile=/dev/null", "vagrant@127.0.0.1"];

async function ssh() {
    return new Promise((resolve, reject) => {
        spawn(sshExe, sshArgs, { stdio: 'inherit' });
        resolve();
    });
}