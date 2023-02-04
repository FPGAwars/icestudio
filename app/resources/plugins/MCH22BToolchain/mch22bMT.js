
let env = false;

function setEnvironment(data) {
    env = data;
}

function upload(data) {
    if (env === false || env.selectedBoard.name !== "MCH2022_badge") {
        return;
    }
    let nodeChildProcess = require('child_process');
    let hd = new IceHD();
    let bitstream = data.bitstream;
    console.log('BS::', bitstream);
    let endmsg = data.msg.end;
    let cstatus = -1;

    let uploader = hd.joinPath(env.DEFAULT_PLUGIN_DIR, 'MCH22BToolchain/mch2022-tools');
    uploader = hd.joinPath(uploader, 'webusb_fpga.py');

    let python = 'python3';//  hd.joinPath(env.ENV_BIN_DIR,'python3');

    if (!hd.isFile(bitstream)) {
        cstatus = -1;
        endmsg = 'Bitstream not found. Build your project first';
    }

    cstatus = 1;
    let command = '';
    try {
        let commands = hd.shellEscape([uploader]);

        command = [python]
            .concat(hd.coverPath(commands))
            .concat(hd.coverPath(bitstream))
            .join(" ");
    } catch (e) {
        console.log(e);
        // TODO: Handle error  
        if (e.code == 'ENOENT') {

        } else {

        }
    }

    console.log('CMD', command);


    nodeChildProcess.exec(
        command,
        {
            maxBuffer: 5000 * 1024
        },
        function (error, stdout, stderr) {
            let commandOutput = command + "\n\n" + stdout + stderr;
            iceStudio.bus.events.publish('toolchain.upload.resolve',
                {
                    endMessage: endmsg,
                    status: cstatus,
                    commandOutput: commandOutput,
                    error: error,
                    stdout: stdout,
                    stderr: stderr
                });


        }
    );




}



iceStudio.bus.events.subscribe('pluginManager.env', setEnvironment);
iceStudio.bus.events.subscribe('pluginManager.updateEnv', setEnvironment);
iceStudio.bus.events.subscribe('toolchain.upload', upload); 
