'use strict';

/**
 * Icetudio > Sigrok > Pulseview integration
 *
 * @category   icestudio Plugins
 * @package    iceRok
 * @author     Carlos Venegas (cavearr at github, @cavearr at twitter)
 * @copyright  2020 FPGAwars
 * @license    https://github.com/FPGAwars/icestudio/blob/develop/LICENSE  GPL v2
 * @version    1.0
 * @link       https://github.com/FPGAwars/icestudio/
 **/
const nodeFs = require('fs');
const gui = require('nw.gui');

function alertErrorConnection() {
  Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: 'Socket Server not connected'
  });
}

function UARTtoggleButtonState(elB) {

  elToggleClass(elB, 'running');

  let label = $('#serial-connect-label');

  if (elHasClass(elB, 'running')) {

    label.innerHTML = 'Stop Capture';

  } else {

    label.innerHTML = 'Start Capture';

  }
}

function launchPulseView(env) {
  console.log('Lanzando Pulseview');
  let spawn = false;
  let args = ['-i ' + captureFile + ' -I binary:samplerate=12000000 -c -D'];
  switch (env) {
    case 'win32':

      spawn = require('child_process').spawn;
      spawn('pulseview.exe', args, {
        detached: true,
        shell: true
      });
      break;
    case 'darwin':
      spawn = require('child_process').spawn;
      spawn('Applications/PulseView.app/Contents/MacOS/pulseview', args, {
        detached: true,
        shell: true
      });
      break;
    default:
      console.log('Pulseview en linux');
      spawn = require('child_process').spawn;
      spawn('/usr/bin/pulseview', args, {
        detached: true,
        shell: true
      });
  }
}


function renderUARTs(devs) {

  let el = $('#serial-devices');
  let html = '';

  for (let i = devs.length - 1; i >= 0; i--) {

    html += `<option value="${i}">${devs[i].displayName} => ${devs[i].path}</option>`;
  }
  el.innerHTML = html;
}

function getFilesizeInBytes(filename) {
  let stats = nodeFs.statSync(filename)
  let fileSizeInBytes = stats["size"]
  return fileSizeInBytes
}

let server = false;
let captureFileFD = false;
let workingPath = process.cwd();
let OS = require('os').platform();
let slashOS = (OS === 'win32') ? '\\' : '/';
let captureFile = workingPath + slashOS + 'icerok.raw';


function startCapture(button) {


  if (server) {

    UARTtoggleButtonState(button);

    if (server.isUARTConnected()) {

      server.stopUART();
      nodeFs.close(captureFileFD);
      captureFileFD = false;
      let size = getFilesizeInBytes(captureFile);
      if (size !== false && size > 0) {
        launchPulseView(OS);
      } else {
        alert('No capture any data');
      }
    } else {

      let ledev = $('#serial-devices');
      let dev = ledev.value.trim();

      if (dev.length > 0) {

        server.startUART(dev, false, function (data) {
          let z = Buffer.from(new Uint8Array(data));
          nodeFs.write(captureFileFD, z, 0, z.length, null, function (err) {});

        });

      } else {

        UARTtoggleButtonState(button);

      }

    }
  }
}


window.addEventListener("message", (event) => {

  if(typeof event.data !== 'undefined' && event.data !== null && event.data !== false ){

    console.log(event.data);


  }

}, false);


document.addEventListener('DOMContentLoaded', function () {

   server = new iceRok();

  server.getUARTs(renderUARTs);

  let elinks = $('.external-link');

  for (let n = 0; n < elinks.length; n++) {
    elinks[n].addEventListener('click', function (e) {
      let url = this.href;
      gui.Shell.openExternal(url);
      e.returnValue = false;
      if (e.preventDefault) e.preventDefault();
      return false;
    });
  }

  $('#serial-connect').addEventListener('click', function (e) {

    let _this = this;
    if (captureFile.length > 0) {
      if (!captureFileFD) {
        nodeFs.open(captureFile, 'w+', function (err, file) {
          if (err) {
            throw err;
          } else {
            captureFileFD = file;
            startCapture(_this);
          }

        });
      } else {
        startCapture(_this);
      }


    } else {
      alert('Capture file is needed to dump data')
    }
  });

});

function onLoad(params){

  console.log('Arrancando plugin',params);
  if(typeof params.BUILD_DIR !== 'undefined' && params.BUILD_DIR.length > 0) captureFile=`${params.BUILD_DIR}${slashOS}icerok.raw`;

}

function onClose() {

  if (typeof server !== 'undefined' && server !== false && server.isUARTConnected()) {

    server.stopUART();
  }
  if (captureFileFD !== false) {

    nodeFs.close(captureFileFD);
  }
  try {
    nodeFs.unlinkSync(captureFile);

  } catch (err) {
    console.error(err);
  }

}