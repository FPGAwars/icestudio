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
let iceRok = function (port) {

  this.tcps = {
    port: 9999,
    connected: false,
    server:false
  };

  this.serial ={
    sm:false,
    connected:false,
  };

//  this.bus= false;

  this.networkInterfaces = [];

  this.__CONSTRUCTOR__ = function () {
    this.getNetworkInterfaces();

/*    if (this.tcps.server) {
      this.tcps.server.disconnect();
    }
    this.tcps.server = new TcpServer(addr, port);
    tcpServer.listen(onAcceptCallback);

      this.tcps.supported = true;
  }*/

    this.serial.sm=new SerialManager();
  };

  this.getUARTs = function(_callback){

    if(this.serial.sm !==false){

      this.serial.sm.refreshDevices(_callback);
    }
  };
  //-- Using webRTC api we can obtain our ip in all modern browser
  this.getNetworkInterfaces = function (callback) {
    let ips = [];
    let RTCPeerConnection =
      window.RTCPeerConnection ||
      window.webkitRTCPeerConnection ||
      window.mozRTCPeerConnection;

    let pc = new RTCPeerConnection({
      // Don't specify any stun/turn servers, otherwise you will
      // also find your public IP addresses.
      iceServers: []
    });
    // Add a media line, this is needed to activate candidate gathering.
    pc.createDataChannel("");
    let _this = this;
    // onicecandidate is triggered whenever a candidate has been found.
    pc.onicecandidate = function (e) {
      if (!e.candidate) {
        // Candidate gathering completed.
        pc.close();
        _this.networkInterfaces = ips;
        if (typeof callback !== "undefined") callback(ips);
        return;
      }
      let ip = /^candidate:.+ (\S+) \d+ typ/.exec(e.candidate.candidate)[1];
      if (ips.indexOf(ip) == -1)
        // avoid duplicate entries (tcp/udp)
        ips.push(ip);
    };

    pc.createOffer(
      function (sdp) {
        pc.setLocalDescription(sdp);
      },
      function onerror() {}
    );
  };

  this.isConnected = function () {

    return this.tcps.connected;
  }

  this.isUARTConnected = function () {
    console.log('isUARTConnected', this.serial);
    return this.serial.connected;
  }

  this.stopTCPS = function () {

    if (this.tcps.supported === false) return false;
    this.tcps.connected = false;
    this.tcps.server.disconnect();
    this.tcps.server=null;

  };

  this.stopUART = function(){

    if(this.serial.connected){
      
      this.serial.sm.unplug();
      this.serial.connected=false;
    }

  }


  this.startUART=function(id,_onConnect, _onReceive,options={}){

    let _this=this;

    function connectUART(info){
        if(typeof _onConnect !== 'undefined' && _onConnect !== false) _onConnect(info);
    }
    function receiveFromUART(data){
      //  _this.bus.send(data);
      console.log(data);
        if(typeof _onReceive !== 'undefined' && _onReceive !== false) _onReceive(data);


    }
    this.serial.sm.plug(id,options,connectUART,receiveFromUART);
    if(this.serial.sm.info.conn === true){
      this.serial.connected=true;
    }
  }

  this.sigrok = function (cmd){
    console.log('SIGROK',cmd);
      switch (cmd.trim()){

        case 'version':
        //  return "Icestudio sigrok v1.0\n\r";
          return "BeagleLogic 1.0\r\n";
        case 'samplerate':
          return '12000000';
        default:
          return "OK\n\r";

      }
  }

  //-- Start WebSocket Server
  this.startTCPS = function (port, _onStart) {
    console.log('startTCPS');
    if ( this.tcps.connected === true) return false;
    console.log('Open Server at port '+ port);
    this.tcps.port = parseInt(port);
    this.tcps.server = new TcpServer('127.0.0.1', parseInt(port));
    console.log(this.tcps.server);

   let _this=this;
    this.tcps.server.listen(function(tcpConnection, socketInfo) {
      var info="["+socketInfo.peerAddress+":"+socketInfo.peerPort+"] Connection accepted!";
      console.log(socketInfo);
      tcpConnection.addDataReceivedListener(function(data) {

    /*    var lines = data.split(/[\n\r]+/);
        for (var i=0; i<lines.length; i++) {
          var line=lines[i];
          if (line.length>0) {
            var info="["+socketInfo.peerAddress+":"+socketInfo.peerPort+"] "+line;
            log.output(info);
    
            var cmd=line.split(/\s+/);
            try {
              tcpConnection.sendMessage(Commands.run(cmd[0], cmd.slice(1)));
            } catch (ex) {
              tcpConnection.sendMessage(ex);
            }
          }
        }*/
        let response = _this.sigrok(data);

        console.log('DATA',data,response);
        tcpConnection.sendMessage(response);

      });

      console.log('Listen');
    
    });

    this.tcps.connected = true;

    if (typeof _onStart !== 'undefined') {
      setTimeout(function () {
        _onStart(this.networkInterfaces, this.tcps.port);
      }.bind(this), 250);
    }
  };

  this.__CONSTRUCTOR__(port);
};