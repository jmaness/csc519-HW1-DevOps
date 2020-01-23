const chalk = require('chalk');
const fs    = require('fs');
const os    = require('os');
const path  = require('path');

const VBoxManage = require('../lib/VBoxManage');
const ssh = require('../lib/ssh');

exports.command = 'up';
exports.desc = 'Provision and configure a new development environment';
exports.builder = yargs => {
    yargs.options({
        force: {
            alias: 'f',
            describe: 'Force the old VM to be deleted when provisioning',
            default: false,
            type: 'boolean'
        }
    });
};


exports.handler = async argv => {
    const { force } = argv;

    (async () => {
    
        await up(force);

    })();

};

async function up(force)
{
    // Use current working directory to derive name of virtual machine
    let cwd = process.cwd().replace(/[/]/g,"-").replace(/\\/g,"-");
    let name = `V-${cwd}`;    
    console.log(chalk.keyword('pink')(`Bringing up machine ${name}`));

    // We will use the image we've pulled down with bakerx.
    let image = path.join(os.homedir(), '.bakerx', '.persist', 'images', 'bionic', 'box.ovf');
    if( !fs.existsSync(image) )
    {
        console.log(chalk.red(`Could not find ${image}. Please download with 'bakerx pull cloud-images.ubuntu.com bionic'.`))
    }

    // We check if we already started machine, or have a previous failed build.
    let state = await VBoxManage.show(name);
    console.log(`VM is currently: ${state}`);
    if( state == 'poweroff' || state == 'aborted' || force) {
        console.log(`Deleting powered off machine ${name}`);
        // Unlock
        await VBoxManage.execute("startvm", `${name} --type emergencystop`).catch(e => e);
        await VBoxManage.execute("controlvm", `${name} --poweroff`).catch(e => e);
        // We will delete powered off VMs, which are most likely incomplete builds.
        await VBoxManage.execute("unregistervm", `${name} --delete`);
    }
    else if( state == 'running' )
    {
        console.log(`VM ${name} is running. Use 'V up --force' to build new machine.`);
        return;
    }

    // Import the VM using the box.ovf file and register it under new name.
    await VBoxManage.execute("import", `"${image}" --vsys 0 --vmname ${name}`);
    // Set memory size in bytes and number of virtual CPUs.
    await VBoxManage.execute("modifyvm", `"${name}" --memory 1024 --cpus 1`);
    // Disconnect serial port
    await VBoxManage.execute("modifyvm", `${name}  --uart1 0x3f8 4 --uartmode1 disconnected`);

    // Run your specific customizations for the Virtual Machine.
    await customize(name);

    // Start the VM.
    // Unlock any session.
    await VBoxManage.execute("startvm", `${name} --type emergencystop`).catch(e => e);
    // Real start.
    await VBoxManage.execute("startvm", `${name} --type headless`);

    // Explicit wait for boot
    let waitTime = 60000;
    console.log(`Waiting ${waitTime}ms for machine to boot.`);        
    await sleep(waitTime);
    console.log(`VM is currently: ${state}`);
    
    // Run your post-configuration customizations for the Virtual Machine.
    await postconfiguration();

}

async function customize(name)
{
    console.log(chalk.keyword('pink')(`Running VM customizations...`));

    // Add a NIC with NAT networking
    await VBoxManage.execute("modifyvm", `${name} --nic1 nat`);
    await VBoxManage.execute("modifyvm", `${name} --nictype1 virtio`);

    // Add a port forward from 2800 => 22 for guestssh
    await VBoxManage.execute("modifyvm", `${name} --natpf1 "guestssh,tcp,,2800,,22"`);

    // Add a port forward from 8080 => 9000 for a node application
    await VBoxManage.execute("modifyvm", `${name} --natpf1 "node,tcp,,8080,,9000"`);

    // Add a NIC with bridged networking
    await VBoxManage.execute("modifyvm", `${name} --nic2 bridged --nictype2 virtio --bridgeadapter2 wlp2s0`);
}

async function postconfiguration(name)
{
    console.log(chalk.keyword('pink')(`Running post-configurations...`));
     
    ssh("\"sudo apt-get update && sudo apt-get install -y nodejs npm git && git clone https://github.com/CSC-DevOps/App.git && cd App && npm install\"");

    // Bring up nic2
    ssh("sudo ip link set enp0s8 up");
}

// Helper utility to wait.
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
