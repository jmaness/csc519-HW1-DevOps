# HW1-DevOps
Provisions a VM with a variety of networking and shared folder configurations.

# Screencast
 (Requires NCSU credentials)

# Steps

```
git clone git@github.ncsu.edu:jwmanes2/HW1-DevOps.git
cd HW1-DevOps/App
npm install
npm link
```

# Provisioning VM 
To provision a VM, run the following command. Optionally, you can: 

1. Specify a host network adapter name with the `--bridgeadapter <adapter>` (or `-b <adapter>`) argument to configure a second NIC configured with bridged networking.

2. Specify the path to on the host file system to share with the VM (mounted with the name `sf_hostdata`) with the `--sharedfolder <path>` (or `-s <path>`) argument.

```
v up [--bridgeadapter | -b <adapter>] [-sharedfolder | -s <path>]
v ssh
```

# Evaluation

- [x] Compete VM setup (40)
    - [x] Add a NIC with NAT networking.
    - [x] Add a port forward from 2800 => 22 for guestssh.
    - [x] Add a port forward from 8080 => 9000 for a node application.
- [x] Post-Configuration (25)
    - [x] Install nodejs, npm, git
    - [x] Clone https://github.com/CSC-DevOps/App
    - [x] Install the npm packages
- [x] SSH/APP (25)
    - [x] Implement and demonstrate running v ssh.
    - [x] Manually run node main.js start 9000.
    - [x] Demonstrate you can visit localhost:8080 to see your running App
- [x] Screencast (10)
- [x] Extra requirements (+5/+10)
    - [x] Create a second NIC with either host-only or bridged networking enabled. Demonstrate that you can use your IP address to visit <address>:9000 to see your running App. (5 points)
    - [x] Create a shared sync folder. This is fairly involved, only attempt if experienced---limited help will be provided from teaching staff. (10 points)
- [x] Answer a question (+5)
    - https://stackoverflow.com/c/ncsu/a/1280/415
    - https://stackoverflow.com/c/ncsu/questions/1265
    - PR to fix HW1 instructions: https://github.com/CSC-DevOps/Course/pull/22


