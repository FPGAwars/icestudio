'use strict';

angular.module('icestudio')
  .service('blocks', function (joint,
    utils,
    common,
    gettextCatalog) {
    var gridsize = 8;
    var resultAlert = null;

    this.newBasic = newBasic;
    this.newGeneric = newGeneric;

    this.loadBasic = loadBasic;
    this.loadGeneric = loadGeneric;
    this.loadWire = loadWire;

    this.editBasic = editBasic;


    //-- New

    function newBasic(type, callback) {
      switch (type) {
        case 'basic.input':
          newBasicInput(callback);
          break;
        case 'basic.output':
          newBasicOutput(callback);
          break;
        case 'basic.outputLabel':
          newBasicOutputLabel(callback);
          break;
        case 'basic.inputLabel':
          newBasicInputLabel(callback);
          break;


        case 'basic.constant':
          newBasicConstant(callback);
          break;
        case 'basic.memory':
          newBasicMemory(callback);
          break;
        case 'basic.code':
          newBasicCode(callback);
          break;
        case 'basic.info':
          newBasicInfo(callback);
          break;
        default:
          break;
      }
    }

    function newBasicOutputLabel(callback) {
      var blockInstance = {
        id: null,
        data: {},
        type: 'basic.outputLabel',
        position: { x: 0, y: 0 }
      };
      var formSpecs = [
        {
          type: 'text',
          title: gettextCatalog.getString('Enter the input blocks'),
          value: ''
        },
        {
          type: 'combobox',
          label: gettextCatalog.getString('Choose a color'),
          value: 'fuchsia',
          options: [
            { value: 'indianred', label: gettextCatalog.getString('IndianRed') },
            { value: 'red', label: gettextCatalog.getString('Red') },
            { value: 'deeppink', label: gettextCatalog.getString('DeepPink') },
            { value: 'mediumVioletRed', label: gettextCatalog.getString('MediumVioletRed') },
            { value: 'coral', label: gettextCatalog.getString('Coral') },
            { value: 'orangered', label: gettextCatalog.getString('OrangeRed') },
            { value: 'darkorange', label: gettextCatalog.getString('DarkOrange') },
            { value: 'gold', label: gettextCatalog.getString('Gold') },
            { value: 'yellow', label: gettextCatalog.getString('Yellow') },
            { value: 'fuchsia', label: gettextCatalog.getString('Fuchsia') },
            { value: 'slateblue', label: gettextCatalog.getString('SlateBlue') },
            { value: 'greenyellow', label: gettextCatalog.getString('GreenYellow') },
            { value: 'springgreen', label: gettextCatalog.getString('SpringGreen') },
            { value: 'darkgreen', label: gettextCatalog.getString('DarkGreen') },
            { value: 'olivedrab', label: gettextCatalog.getString('OliveDrab') },
            { value: 'lightseagreen', label: gettextCatalog.getString('LightSeaGreen') },
            { value: 'turquoise', label: gettextCatalog.getString('Turquoise') },
            { value: 'steelblue', label: gettextCatalog.getString('SteelBlue') },
            { value: 'deepskyblue', label: gettextCatalog.getString('DeepSkyBlue') },
            { value: 'royalblue', label: gettextCatalog.getString('RoyalBlue') },
            { value: 'navy', label: gettextCatalog.getString('Navy') }

          ]

        }

      ];
      utils.renderForm(formSpecs, function (evt, values) {
        var labels = values[0].replace(/\s*,\s*/g, ',').split(',');
        var color = values[1];
        var virtual = !values[2];
        var clock = values[2];
        if (resultAlert) {
          resultAlert.dismiss(false);
        }
        // Validate values
        var portInfo, portInfos = [];
        for (var l in labels) {
          portInfo = utils.parsePortLabel(labels[l], common.PATTERN_GLOBAL_PORT_LABEL);
          if (portInfo) {
            evt.cancel = false;
            portInfos.push(portInfo);
          }
          else {
            evt.cancel = true;
            resultAlert = alertify.warning(gettextCatalog.getString('Wrong block name {{name}}', { name: labels[l] }));
            return;
          }
        }
        // Create blocks
        var cells = [];
        for (var p in portInfos) {
          portInfo = portInfos[p];
          if (portInfo.rangestr && clock) {
            evt.cancel = true;
            resultAlert = alertify.warning(gettextCatalog.getString('Clock not allowed for data buses'));
            return;
          }
          var pins = getPins(portInfo);
          blockInstance.data = {
            blockColor: color,
            name: portInfo.name,
            range: portInfo.rangestr,
            pins: pins,
            virtual: virtual,
            clock: clock
          };
          cells.push(loadBasic(blockInstance));
          // Next block position
          blockInstance.position.y += (virtual ? 10 : (6 + 4 * pins.length)) * gridsize;
        }
        if (callback) {
          callback(cells);
        }
      });
    }


    function newBasicInput(callback) {
      var blockInstance = {
        id: null,
        data: {},
        type: 'basic.input',
        position: { x: 0, y: 0 }
      };
      var formSpecs = [
        {
          type: 'text',
          title: gettextCatalog.getString('Enter the input blocks'),
          value: ''
        },
        {
          type: 'checkbox',
          label: gettextCatalog.getString('FPGA pin'),
          value: true
        },
        {
          type: 'checkbox',
          label: gettextCatalog.getString('Show clock'),
          value: false
        }
      ];
      utils.renderForm(formSpecs, function (evt, values) {
        var labels = values[0].replace(/\s*,\s*/g, ',').split(',');
        var virtual = !values[1];
        var clock = values[2];
        if (resultAlert) {
          resultAlert.dismiss(false);
        }
        // Validate values
        var portInfo, portInfos = [];
        for (var l in labels) {
          portInfo = utils.parsePortLabel(labels[l], common.PATTERN_GLOBAL_PORT_LABEL);
          if (portInfo) {
            evt.cancel = false;
            portInfos.push(portInfo);
          }
          else {
            evt.cancel = true;
            resultAlert = alertify.warning(gettextCatalog.getString('Wrong block name {{name}}', { name: labels[l] }));
            return;
          }
        }
        // Create blocks
        var cells = [];
        for (var p in portInfos) {
          portInfo = portInfos[p];
          if (portInfo.rangestr && clock) {
            evt.cancel = true;
            resultAlert = alertify.warning(gettextCatalog.getString('Clock not allowed for data buses'));
            return;
          }
          var pins = getPins(portInfo);
          blockInstance.data = {
            name: portInfo.name,
            range: portInfo.rangestr,
            pins: pins,
            virtual: virtual,
            clock: clock
          };
          cells.push(loadBasic(blockInstance));
          // Next block position
          blockInstance.position.y += (virtual ? 10 : (6 + 4 * pins.length)) * gridsize;
        }
        if (callback) {
          callback(cells);
        }
      });
    }

    function newBasicOutput(callback) {
      var blockInstance = {
        id: null,
        data: {},
        type: 'basic.output',
        position: { x: 0, y: 0 }
      };
      var formSpecs = [
        {
          type: 'text',
          title: gettextCatalog.getString('Enter the output blocks'),
          value: ''
        },
        {
          type: 'checkbox',
          label: gettextCatalog.getString('FPGA pin'),
          value: true
        }
      ];
      utils.renderForm(formSpecs, function (evt, values) {
        var labels = values[0].replace(/\s*,\s*/g, ',').split(',');
        var virtual = !values[1];
        if (resultAlert) {
          resultAlert.dismiss(false);
        }
        // Validate values
        var portInfo, portInfos = [];
        for (var l in labels) {
          portInfo = utils.parsePortLabel(labels[l], common.PATTERN_GLOBAL_PORT_LABEL);
          if (portInfo) {
            evt.cancel = false;
            portInfos.push(portInfo);
          }
          else {
            evt.cancel = true;
            resultAlert = alertify.warning(gettextCatalog.getString('Wrong block name {{name}}', { name: labels[l] }));
            return;
          }
        }
        // Create blocks
        var cells = [];
        for (var p in portInfos) {
          portInfo = portInfos[p];
          var pins = getPins(portInfo);
          blockInstance.data = {
            name: portInfo.name,
            range: portInfo.rangestr,
            pins: pins,
            virtual: virtual
          };
          cells.push(loadBasic(blockInstance));
          // Next block position
          blockInstance.position.y += (virtual ? 10 : (6 + 4 * pins.length)) * gridsize;
        }
        if (callback) {
          callback(cells);
        }
      });
    }

    function newBasicInputLabel(callback) {
      var blockInstance = {
        id: null,
        data: {},
        type: 'basic.inputLabel',
        position: { x: 0, y: 0 }

      };
      var formSpecs = [
        {
          type: 'text',
          title: gettextCatalog.getString('Enter the output blocks'),
          value: ''

        },
        {
          type: 'combobox',
          label: gettextCatalog.getString('Choose a color'),
          value: 'fuchsia',
          options: [
            { value: 'indianred', label: gettextCatalog.getString('IndianRed') },
            { value: 'red', label: gettextCatalog.getString('Red') },
            { value: 'deeppink', label: gettextCatalog.getString('DeepPink') },
            { value: 'mediumvioletred', label: gettextCatalog.getString('MediumVioletRed') },
            { value: 'coral', label: gettextCatalog.getString('Coral') },
            { value: 'orangered', label: gettextCatalog.getString('OrangeRed') },
            { value: 'darkorange', label: gettextCatalog.getString('DarkOrange') },
            { value: 'gold', label: gettextCatalog.getString('Gold') },
            { value: 'yellow', label: gettextCatalog.getString('Yellow') },
            { value: 'fuchsia', label: gettextCatalog.getString('Fuchsia') },
            { value: 'slateblue', label: gettextCatalog.getString('SlateBlue') },
            { value: 'greenyellow', label: gettextCatalog.getString('GreenYellow') },
            { value: 'springgreen', label: gettextCatalog.getString('SpringGreen') },
            { value: 'darkgreen', label: gettextCatalog.getString('DarkGreen') },
            { value: 'olivedrab', label: gettextCatalog.getString('OliveDrab') },
            { value: 'lightseagreen', label: gettextCatalog.getString('LightSeaGreen') },
            { value: 'turquoise', label: gettextCatalog.getString('Turquoise') },
            { value: 'steelblue', label: gettextCatalog.getString('SteelBlue') },
            { value: 'deepskyblue', label: gettextCatalog.getString('DeepSkyBlue') },
            { value: 'royalblue', label: gettextCatalog.getString('RoyalBlue') },
            { value: 'navy', label: gettextCatalog.getString('Navy') }

          ]

        }
      ];
      utils.renderForm(formSpecs, function (evt, values) {
        var labels = values[0].replace(/\s*,\s*/g, ',').split(',');
        var color = values[1];
        var virtual = !values[2];
        if (resultAlert) {
          resultAlert.dismiss(false);
        }
        // Validate values
        var portInfo, portInfos = [];
        for (var l in labels) {
          portInfo = utils.parsePortLabel(labels[l], common.PATTERN_GLOBAL_PORT_LABEL);
          if (portInfo) {
            evt.cancel = false;
            portInfos.push(portInfo);
          }
          else {
            evt.cancel = true;
            resultAlert = alertify.warning(gettextCatalog.getString('Wrong block name {{name}}', { name: labels[l] }));
            return;
          }
        }
        // Create blocks
        var cells = [];
        for (var p in portInfos) {
          portInfo = portInfos[p];
          var pins = getPins(portInfo);
          blockInstance.data = {
            blockColor: color,
            name: portInfo.name,
            range: portInfo.rangestr,
            pins: pins,
            virtual: virtual
          };
          cells.push(loadBasic(blockInstance));
          // Next block position
          blockInstance.position.y += (virtual ? 10 : (6 + 4 * pins.length)) * gridsize;
        }
        if (callback) {
          callback(cells);
        }
      });
    }

    function getPins(portInfo) {
      var pins = [];
      if (portInfo.range) {
        for (var r in portInfo.range) {
          pins.push({ index: portInfo.range[r].toString(), name: '', value: '' });
        }
      }
      else {
        pins.push({ index: '0', name: 'NULL', value: 'NULL' });
      }
      return pins;
    }

    function newBasicConstant(callback) {
      var blockInstance = {
        id: null,
        data: {},
        type: 'basic.constant',
        position: { x: 0, y: 0 }
      };
      var formSpecs = [
        {
          type: 'text',
          title: gettextCatalog.getString('Enter the constant blocks'),
          value: ''
        },
        {
          type: 'checkbox',
          label: gettextCatalog.getString('Local parameter'),
          value: false
        }
      ];
      utils.renderForm(formSpecs, function (evt, values) {
        var labels = values[0].replace(/\s*,\s*/g, ',').split(',');
        var local = values[1];
        if (resultAlert) {
          resultAlert.dismiss(false);
        }
        // Validate values
        var paramInfo, paramInfos = [];
        for (var l in labels) {
          paramInfo = utils.parseParamLabel(labels[l], common.PATTERN_GLOBAL_PARAM_LABEL);
          if (paramInfo) {
            evt.cancel = false;
            paramInfos.push(paramInfo);
          }
          else {
            evt.cancel = true;
            resultAlert = alertify.warning(gettextCatalog.getString('Wrong block name {{name}}', { name: labels[l] }));
            return;
          }
        }
        // Create blocks
        var cells = [];
        for (var p in paramInfos) {
          paramInfo = paramInfos[p];
          blockInstance.data = {
            name: paramInfo.name,
            value: '',
            local: local
          };
          cells.push(loadBasicConstant(blockInstance));
          blockInstance.position.x += 15 * gridsize;
        }
        if (callback) {
          callback(cells);
        }
      });
    }

    function newBasicMemory(callback) {
      var blockInstance = {
        id: null,
        data: {},
        type: 'basic.memory',
        position: { x: 0, y: 0 },
        size: { width: 96, height: 104 }
      };
      var formSpecs = [
        {
          type: 'text',
          title: gettextCatalog.getString('Enter the memory blocks'),
          value: ''
        },
        {
          type: 'combobox',
          label: gettextCatalog.getString('Address format'),
          value: 10,
          options: [
            { value: 2, label: gettextCatalog.getString('Binary') },
            { value: 10, label: gettextCatalog.getString('Decimal') },
            { value: 16, label: gettextCatalog.getString('Hexadecimal') }
          ]
        },
        {
          type: 'checkbox',
          label: gettextCatalog.getString('Local parameter'),
          value: false
        }
      ];
      utils.renderForm(formSpecs, function (evt, values) {
        var labels = values[0].replace(/\s*,\s*/g, ',').split(',');
        var local = values[2];
        var format = parseInt(values[1]);
        if (resultAlert) {
          resultAlert.dismiss(false);
        }
        // Validate values
        var paramInfo, paramInfos = [];
        for (var l in labels) {
          paramInfo = utils.parseParamLabel(labels[l], common.PATTERN_GLOBAL_PARAM_LABEL);
          if (paramInfo) {
            evt.cancel = false;
            paramInfos.push(paramInfo);
          }
          else {
            evt.cancel = true;
            resultAlert = alertify.warning(gettextCatalog.getString('Wrong block name {{name}}', { name: labels[l] }));
            return;
          }
        }
        // Create blocks
        var cells = [];
        for (var p in paramInfos) {
          paramInfo = paramInfos[p];
          blockInstance.data = {
            name: paramInfo.name,
            list: '',
            local: local,
            format: format
          };
          cells.push(loadBasicMemory(blockInstance));
          blockInstance.position.x += 15 * gridsize;
        }
        if (callback) {
          callback(cells);
        }
      });
    }

    function newBasicCode(callback, block) {
      var blockInstance = {
        id: null,
        data: {
          code: '',
          params: [],
          ports: { in: [], out: [] }
        },
        type: 'basic.code',
        position: { x: 0, y: 0 },
        size: { width: 192, height: 128 }
      };
      var defaultValues = [
        '',
        '',
        ''
      ];
      if (block) {
        blockInstance = block;
        var index, port;
        if (block.data.ports) {
          var inPorts = [];
          for (index in block.data.ports.in) {
            port = block.data.ports.in[index];
            inPorts.push(port.name + (port.range || ''));
          }
          defaultValues[0] = inPorts.join(' , ');
          var outPorts = [];
          for (index in block.data.ports.out) {
            port = block.data.ports.out[index];
            outPorts.push(port.name + (port.range || ''));
          }
          defaultValues[1] = outPorts.join(' , ');
        }
        if (block.data.params) {
          var params = [];
          for (index in block.data.params) {
            params.push(block.data.params[index].name);
          }
          defaultValues[2] = params.join(' , ');
        }
      }
      var formSpecs = [
        {
          type: 'text',
          title: gettextCatalog.getString('Enter the input ports'),
          value: defaultValues[0]
        },
        {
          type: 'text',
          title: gettextCatalog.getString('Enter the output ports'),
          value: defaultValues[1]
        },
        {
          type: 'text',
          title: gettextCatalog.getString('Enter the parameters'),
          value: defaultValues[2]
        }
      ];
      utils.renderForm(formSpecs, function (evt, values) {
        var inPorts = values[0].replace(/\s*,\s*/g, ',').split(',');
        var outPorts = values[1].replace(/\s*,\s*/g, ',').split(',');
        var params = values[2].replace(/\s*,\s*/g, ',').split(',');
        var allNames = [];
        if (resultAlert) {
          resultAlert.dismiss(false);
        }
        // Validate values
        var i, inPortInfo, inPortInfos = [];

        let nib=0, nob=0;
        for (i in inPorts) {
          if (inPorts[i]) {
            inPortInfo = utils.parsePortLabel(inPorts[i], common.PATTERN_PORT_LABEL);
            if (inPortInfo && inPortInfo.name) {
              evt.cancel = false;
              inPortInfos.push(inPortInfo);
            }
            else {
              evt.cancel = true;
              resultAlert = alertify.warning(gettextCatalog.getString('Wrong port name {{name}}', { name: inPorts[i] }));
              return;
            }
          }else{
            nib++;
          }
        }

        var o, outPortInfo, outPortInfos = [];
        for (o in outPorts) {
          if (outPorts[o]) {
            outPortInfo = utils.parsePortLabel(outPorts[o], common.PATTERN_PORT_LABEL);
            if (outPortInfo && outPortInfo.name) {
              evt.cancel = false;
              outPortInfos.push(outPortInfo);
            }
            else {
              evt.cancel = true;
              resultAlert = alertify.warning(gettextCatalog.getString('Wrong port name {{name}}', { name: outPorts[o] }));
              return;
            }
          }else{
            nob++;
          }
        }
        if(nib>=inPorts.length && nob >= outPorts.length){
               evt.cancel = true;
              resultAlert = alertify.warning(gettextCatalog.getString('Code block needs at least one input or one output'));
              return;


        }

        var p, paramInfo, paramInfos = [];
        for (p in params) {
          if (params[p]) {
            paramInfo = utils.parseParamLabel(params[p], common.PATTERN_PARAM_LABEL);
            if (paramInfo) {
              evt.cancel = false;
              paramInfos.push(paramInfo);
            }
            else {
              evt.cancel = true;
              resultAlert = alertify.warning(gettextCatalog.getString('Wrong parameter name {{name}}', { name: params[p] }));
              return;
            }
          }
        }
        // Create ports
        var pins;
        blockInstance.data.ports.in = [];
        for (i in inPortInfos) {
          if (inPortInfos[i]) {
            pins = getPins(inPortInfos[i]);
            blockInstance.data.ports.in.push({
              name: inPortInfos[i].name,
              range: inPortInfos[i].rangestr,
              size: (pins.length > 1) ? pins.length : undefined
            });
            allNames.push(inPortInfos[i].name);
          }
        }
        blockInstance.data.ports.out = [];
        for (o in outPortInfos) {
          if (outPortInfos[o]) {
            pins = getPins(outPortInfos[o]);
            blockInstance.data.ports.out.push({
              name: outPortInfos[o].name,
              range: outPortInfos[o].rangestr,
              size: (pins.length > 1) ? pins.length : undefined
            });
            allNames.push(outPortInfos[o].name);
          }
        }
        blockInstance.data.params = [];
        for (p in paramInfos) {
          if (paramInfos[p]) {
            blockInstance.data.params.push({
              name: paramInfos[p].name
            });
            allNames.push(paramInfos[p].name);
          }
        }
        // Check duplicated attributes
        var numNames = allNames.length;
        if (numNames === $.unique(allNames).length) {
          evt.cancel = false;
          // Create block
          if (callback) {
            callback([loadBasicCode(blockInstance)]);
          }
        }
        else {
          evt.cancel = true;
          resultAlert = alertify.warning(gettextCatalog.getString('Duplicated block attributes'));
        }
      });
    }

    function newBasicInfo(callback) {
      var blockInstance = {
        id: null,
        data: { info: '', readonly: false },
        type: 'basic.info',
        position: { x: 0, y: 0 },
        size: { width: 192, height: 128 }
      };
      if (callback) {
        callback([loadBasicInfo(blockInstance)]);
      }
    }

    function newGeneric(type, block, callback) {

      var blockInstance = {
        id: null,
        type: type,
        position: { x: 0, y: 0 }
      };
      if (resultAlert) {
        resultAlert.dismiss(false);
      }
      if (block &&
        block.design &&
        block.design.graph &&
        block.design.graph.blocks &&
        block.design.graph.wires) {
        if (callback) {
          callback(loadGeneric(blockInstance, block));
        }
      }
      else {
        resultAlert = alertify.error(gettextCatalog.getString('Wrong block format: {{type}}', { type: type }), 30);
      }
    }


    //-- Load

    function loadBasic(instance, disabled) {
      switch (instance.type) {
        case 'basic.input':
          return loadBasicInput(instance, disabled);
        case 'basic.output':
          return loadBasicOutput(instance, disabled);
        case 'basic.outputLabel':
          return loadBasicOutputLabel(instance, disabled);
        case 'basic.inputLabel':
          return loadBasicInputLabel(instance, disabled);

        case 'basic.constant':
          return loadBasicConstant(instance, disabled);
        case 'basic.memory':
          return loadBasicMemory(instance, disabled);
        case 'basic.code':
          return loadBasicCode(instance, disabled);
        case 'basic.info':
          return loadBasicInfo(instance, disabled);
        default:
          break;
      }
    }

    function loadBasicInput(instance, disabled) {
      var data = instance.data;
      var rightPorts = [{
        id: 'out',
        name: '',
        label: '',
        size: data.pins ? data.pins.length : (data.size || 1)
      }];

      var cell = new joint.shapes.ice.Input({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        disabled: disabled,
        rightPorts: rightPorts,
        choices: common.pinoutInputHTML
      });



      return cell;
    }

    function loadBasicOutputLabel(instance, disabled) {
      var data = instance.data;
      var rightPorts = [{
        id: 'outlabel',
        name: '',
        label: '',
        size: data.pins ? data.pins.length : (data.size || 1)
      }];

      var cell = new joint.shapes.ice.OutputLabel({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        disabled: disabled,
        rightPorts: rightPorts,
        choices: common.pinoutInputHTML
      });
      return cell;
    }


    function loadBasicOutput(instance, disabled) {
      var data = instance.data;
      var leftPorts = [{
        id: 'in',
        name: '',
        label: '',
        size: data.pins ? data.pins.length : (data.size || 1)
      }];
      var cell = new joint.shapes.ice.Output({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        disabled: disabled,
        leftPorts: leftPorts,
        choices: common.pinoutOutputHTML
      });
      return cell;
    }
    function loadBasicInputLabel(instance, disabled) {
      var data = instance.data;
      var leftPorts = [{
        id: 'inlabel',
        name: '',
        label: '',
        size: data.pins ? data.pins.length : (data.size || 1)
      }];

      //var cell = new joint.shapes.ice.Output({
      var cell = new joint.shapes.ice.InputLabel({
        id: instance.id,
        blockColor: instance.blockColor,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        disabled: disabled,
        leftPorts: leftPorts,
        choices: common.pinoutOutputHTML
      });
      return cell;
    }


    function loadBasicConstant(instance, disabled) {
      var bottomPorts = [{
        id: 'constant-out',
        name: '',
        label: ''
      }];
      var cell = new joint.shapes.ice.Constant({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        disabled: disabled,
        bottomPorts: bottomPorts
      });
      return cell;
    }

    function loadBasicMemory(instance, disabled) {
      var bottomPorts = [{
        id: 'memory-out',
        name: '',
        label: ''
      }];
      var cell = new joint.shapes.ice.Memory({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        size: instance.size,
        disabled: disabled,
        bottomPorts: bottomPorts
      });
      return cell;
    }

    function loadBasicCode(instance, disabled) {
      var port;
      var leftPorts = [];
      var rightPorts = [];
      var topPorts = [];

      for (var i in instance.data.ports.in) {
        port = instance.data.ports.in[i];
        if (!port.range) {
          port.default = utils.hasInputRule(port.name);
        }
        leftPorts.push({
          id: port.name,
          name: port.name,
          label: port.name + (port.range || ''),
          size: port.size || 1
        });
      }

      for (var o in instance.data.ports.out) {
        port = instance.data.ports.out[o];
        rightPorts.push({
          id: port.name,
          name: port.name,
          label: port.name + (port.range || ''),
          size: port.size || 1
        });
      }

      for (var p in instance.data.params) {
        port = instance.data.params[p];
        topPorts.push({
          id: port.name,
          name: port.name,
          label: port.name
        });
      }

      var cell = new joint.shapes.ice.Code({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        size: instance.size,
        disabled: disabled,
        leftPorts: leftPorts,
        rightPorts: rightPorts,
        topPorts: topPorts
      });

      return cell;
    }

    function loadBasicInfo(instance, disabled) {
      // Translate info content
      if (instance.data.info && instance.data.readonly) {
        instance.data.text = gettextCatalog.getString(instance.data.info);
      }
      var cell = new joint.shapes.ice.Info({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        size: instance.size,
        disabled: disabled
      });
      return cell;
    }

    function loadGeneric(instance, block, disabled) {


      var i;
      var leftPorts = [];
      var rightPorts = [];
      var topPorts = [];
      var bottomPorts = [];

      instance.data = { ports: { in: [] } };

      for (i in block.design.graph.blocks) {
        var item = block.design.graph.blocks[i];
        if (item.type === 'basic.input') {
          if (!item.data.range) {
            instance.data.ports.in.push({
              name: item.id,
              default: utils.hasInputRule((item.data.clock ? 'clk' : '') || item.data.name)
            });
          }
          leftPorts.push({
            id: item.id,
            name: item.data.name,
            label: item.data.name + (item.data.range || ''),
            size: item.data.pins ? item.data.pins.length : (item.data.size || 1),
            clock: item.data.clock
          });
        }

        else if (item.type === 'basic.output') {
          rightPorts.push({
            id: item.id,
            name: item.data.name,
            label: item.data.name + (item.data.range || ''),
            size: item.data.pins ? item.data.pins.length : (item.data.size || 1)
          });
        }
        else if (item.type === 'basic.constant' || item.type === 'basic.memory') {
          if (!item.data.local) {
            topPorts.push({
              id: item.id,
              name: item.data.name,
              label: item.data.name
            });
          }
        }
      }

      //      var size = instance.size;
      var size = false;
      if (!size) {
        var numPortsHeight = Math.max(leftPorts.length, rightPorts.length);
        var numPortsWidth = Math.max(topPorts.length, bottomPorts.length);

        size = {
          width: Math.max(4 * gridsize * numPortsWidth, 12 * gridsize),
          height: Math.max(4 * gridsize * numPortsHeight, 8 * gridsize)
        };
      }

      var blockLabel = block.package.name;
      var blockImage = '';
      if (block.package.image) {
        if (block.package.image.startsWith('%3Csvg')) {
          blockImage = block.package.image;
        }
        else if (block.package.image.startsWith('<svg')) {
          blockImage = encodeURI(block.package.image);
        }
      }

      var cell = new joint.shapes.ice.Generic({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        config: block.design.config,
        pullup: block.design.pullup,
        image: blockImage,
        label: blockLabel,
        tooltip: gettextCatalog.getString(block.package.description),
        position: instance.position,
        size: size,
        disabled: disabled,
        leftPorts: leftPorts,
        rightPorts: rightPorts,
        topPorts: topPorts
      });
      return cell;
    }

    function loadWire(instance, source, target) {

      // Find selectors
      var sourceSelector, targetSelector;
      var leftPorts = target.get('leftPorts');
      var rightPorts = source.get('rightPorts');

      for (var _out = 0; _out < rightPorts.length; _out++) {
        if (rightPorts[_out] === instance.source.port) {
          sourceSelector = _out;
          break;
        }
      }
      for (var _in = 0; _in < leftPorts.length; _in++) {
        if (leftPorts[_in] === instance.target.port) {
          targetSelector = _in;
          break;
        }
      }

      var _wire = new joint.shapes.ice.Wire({
        source: {
          id: source.id,
          selector: sourceSelector,
          port: instance.source.port
        },
        target: {
          id: target.id,
          selector: targetSelector,
          port: instance.target.port
        },
        vertices: instance.vertices
      });
      return _wire;
    }


    //-- Edit

    function editBasic(type, cellView, callback) {
      switch (type) {
        case 'basic.input':
          editBasicInput(cellView, callback);
          break;
        case 'basic.output':
          editBasicOutput(cellView, callback);
          break;
        case 'basic.outputLabel':
          editBasicOutputLabel(cellView, callback);
          break;
        case 'basic.inputLabel':
          editBasicInputLabel(cellView, callback);
          break;


        case 'basic.constant':
          editBasicConstant(cellView);
          break;
        case 'basic.memory':
          editBasicMemory(cellView);
          break;
        case 'basic.code':
          editBasicCode(cellView, callback);
          break;
        case 'basic.info':
          editBasicInfo(cellView);
          break;
        default:
          break;
      }
    }


    function editBasicOutputLabel(cellView, callback) {
      var graph = cellView.paper.model;
      var block = cellView.model.attributes;
      var formSpecs = [
        {
          type: 'text',
          title: gettextCatalog.getString('Update the label name'),
          value: block.data.name + (block.data.range || '')
        },
        {
          type: 'combobox',
          label: gettextCatalog.getString('Choose a color'),
          value: (typeof block.data.blockColor !== 'undefined') ? block.data.blockColor : 'fuchsia',
          options: [
            { value: 'indianred', label: gettextCatalog.getString('IndianRed') },
            { value: 'red', label: gettextCatalog.getString('Red') },
            { value: 'deeppink', label: gettextCatalog.getString('DeepPink') },
            { value: 'mediumvioletred', label: gettextCatalog.getString('MediumVioletRed') },
            { value: 'coral', label: gettextCatalog.getString('Coral') },
            { value: 'orangered', label: gettextCatalog.getString('OrangeRed') },
            { value: 'darkorange', label: gettextCatalog.getString('DarkOrange') },
            { value: 'gold', label: gettextCatalog.getString('Gold') },
            { value: 'yellow', label: gettextCatalog.getString('Yellow') },
            { value: 'fuchsia', label: gettextCatalog.getString('Fuchsia') },
            { value: 'slateblue', label: gettextCatalog.getString('SlateBlue') },
            { value: 'greenyellow', label: gettextCatalog.getString('GreenYellow') },
            { value: 'springgreen', label: gettextCatalog.getString('SpringGreen') },
            { value: 'darkgreen', label: gettextCatalog.getString('DarkGreen') },
            { value: 'olivedrab', label: gettextCatalog.getString('OliveDrab') },
            { value: 'lightseagreen', label: gettextCatalog.getString('LightSeaGreen') },
            { value: 'turquoise', label: gettextCatalog.getString('Turquoise') },
            { value: 'steelblue', label: gettextCatalog.getString('SteelBlue') },
            { value: 'deepskyblue', label: gettextCatalog.getString('DeepSkyBlue') },
            { value: 'royalblue', label: gettextCatalog.getString('RoyalBlue') },
            { value: 'navy', label: gettextCatalog.getString('Navy') }

          ]

        }

      ];
      utils.renderForm(formSpecs, function (evt, values) {
        var oldSize, newSize, offset = 0;
        var label = values[0];
        var color = values[1];
        var virtual = !values[2];
        var clock = values[2];
        if (resultAlert) {
          resultAlert.dismiss(false);
        }
        // Validate values
        var portInfo = utils.parsePortLabel(label, common.PATTERN_GLOBAL_PORT_LABEL);
        if (portInfo) {
          evt.cancel = false;
          if (portInfo.rangestr && clock) {
            evt.cancel = true;
            resultAlert = alertify.warning(gettextCatalog.getString('Clock not allowed for data buses'));
            return;
          }
          if ((block.data.range || '') !==
            (portInfo.rangestr || '')) {
            var pins = getPins(portInfo);
            oldSize = block.data.virtual ? 1 : (block.data.pins ? block.data.pins.length : 1);
            newSize = virtual ? 1 : (pins ? pins.length : 1);
            // Update block position when size changes
            offset = 16 * (oldSize - newSize);
            // Create new block
            var blockInstance = {
              id: null,
              data: {
                name: portInfo.name,
                range: portInfo.rangestr,
                pins: pins,
                virtual: virtual,
                clock: clock
              },
              type: block.blockType,
              position: {
                x: block.position.x,
                y: block.position.y + offset
              }
            };
            if (callback) {
              graph.startBatch('change');
              callback(loadBasic(blockInstance));
              cellView.model.remove();
              graph.stopBatch('change');
              resultAlert = alertify.success(gettextCatalog.getString('Block updated'));
            }
          }
          else if (block.data.name !== portInfo.name ||
            block.data.virtual !== virtual ||
            block.data.clock !== clock ||
            block.data.blockColor !== color) {
            var size = block.data.pins ? block.data.pins.length : 1;
            oldSize = block.data.virtual ? 1 : size;
            newSize = virtual ? 1 : size;
            // Update block position when size changes
            offset = 16 * (oldSize - newSize);
            // Edit block
            graph.startBatch('change');
            var data = utils.clone(block.data);
            data.name = portInfo.name;
            data.oldBlockColor = data.blockColor;
            data.blockColor = color;
            data.virtual = virtual;
            data.clock = clock;
            cellView.model.set('data', data, { translateBy: cellView.model.id, tx: 0, ty: -offset });
            cellView.model.translate(0, offset);
            graph.stopBatch('change');
            cellView.apply();
            resultAlert = alertify.success(gettextCatalog.getString('Block updated'));
          }
        }
        else {
          evt.cancel = true;
          resultAlert = alertify.warning(gettextCatalog.getString('Wrong block name {{name}}', { name: label }));
        }
      });
    }

    function editBasicInputLabel(cellView, callback) {
      var graph = cellView.paper.model;
      var block = cellView.model.attributes;
      var formSpecs = [
        {
          type: 'text',
          title: gettextCatalog.getString('Update the label name'),
          value: block.data.name + (block.data.range || '')
        },
        {
          type: 'combobox',
          label: gettextCatalog.getString('Choose a color'),
          value: (typeof block.data.blockColor !== 'undefined') ? block.data.blockColor : 'fuchsia',
          options: [
            { value: 'indianred', label: gettextCatalog.getString('IndianRed') },
            { value: 'red', label: gettextCatalog.getString('Red') },
            { value: 'deeppink', label: gettextCatalog.getString('DeepPink') },
            { value: 'mediumvioletred', label: gettextCatalog.getString('MediumVioletRed') },
            { value: 'coral', label: gettextCatalog.getString('Coral') },
            { value: 'orangered', label: gettextCatalog.getString('OrangeRed') },
            { value: 'darkorange', label: gettextCatalog.getString('DarkOrange') },
            { value: 'gold', label: gettextCatalog.getString('Gold') },
            { value: 'yellow', label: gettextCatalog.getString('Yellow') },
            { value: 'fuchsia', label: gettextCatalog.getString('Fuchsia') },
            { value: 'slateblue', label: gettextCatalog.getString('SlateBlue') },
            { value: 'greenyellow', label: gettextCatalog.getString('GreenYellow') },
            { value: 'springgreen', label: gettextCatalog.getString('SpringGreen') },
            { value: 'darkgreen', label: gettextCatalog.getString('DarkGreen') },
            { value: 'olivedrab', label: gettextCatalog.getString('OliveDrab') },
            { value: 'lightseagreen', label: gettextCatalog.getString('LightSeaGreen') },
            { value: 'turquoise', label: gettextCatalog.getString('Turquoise') },
            { value: 'steelblue', label: gettextCatalog.getString('SteelBlue') },
            { value: 'deepskyblue', label: gettextCatalog.getString('DeepSkyBlue') },
            { value: 'royalblue', label: gettextCatalog.getString('RoyalBlue') },
            { value: 'navy', label: gettextCatalog.getString('Navy') }

          ]

        }

      ];
      utils.renderForm(formSpecs, function (evt, values) {
        var oldSize, newSize, offset = 0;
        var label = values[0];
        var color = values[1];
        var virtual = !values[2];
        if (resultAlert) {
          resultAlert.dismiss(false);
        }
        // Validate values
        var portInfo = utils.parsePortLabel(label, common.PATTERN_GLOBAL_PORT_LABEL);
        if (portInfo) {
          evt.cancel = false;
          if ((block.data.range || '') !==
            (portInfo.rangestr || '')) {
            var pins = getPins(portInfo);
            oldSize = block.data.virtual ? 1 : (block.data.pins ? block.data.pins.length : 1);
            newSize = virtual ? 1 : (pins ? pins.length : 1);
            // Update block position when size changes
            offset = 16 * (oldSize - newSize);
            // Create new block
            var blockInstance = {
              id: null,
              data: {
                name: portInfo.name,
                range: portInfo.rangestr,
                pins: pins,
                virtual: virtual
              },
              type: block.blockType,
              position: {
                x: block.position.x,
                y: block.position.y + offset
              }
            };
            if (callback) {
              graph.startBatch('change');
              callback(loadBasic(blockInstance));
              cellView.model.remove();
              graph.stopBatch('change');
              resultAlert = alertify.success(gettextCatalog.getString('Block updated'));
            }
          }
          else if (block.data.name !== portInfo.name ||
            block.data.virtual !== virtual ||
            block.data.blockColor !== color) {
            var size = block.data.pins ? block.data.pins.length : 1;
            oldSize = block.data.virtual ? 1 : size;
            newSize = virtual ? 1 : size;
            // Update block position when size changes
            offset = 16 * (oldSize - newSize);
            // Edit block
            graph.startBatch('change');
            var data = utils.clone(block.data);
            data.name = portInfo.name;
            data.oldBlockColor = data.blockColor;
            data.blockColor = color;
            data.virtual = virtual;
            cellView.model.set('data', data, { translateBy: cellView.model.id, tx: 0, ty: -offset });
            cellView.model.translate(0, offset);
            graph.stopBatch('change');
            cellView.apply();
            resultAlert = alertify.success(gettextCatalog.getString('Block updated'));
          }
        }
        else {
          evt.cancel = true;
          resultAlert = alertify.warning(gettextCatalog.getString('Wrong block name {{name}}', { name: label }));
        }
      });
    }

    function editBasicInput(cellView, callback) {
      var graph = cellView.paper.model;
      var block = cellView.model.attributes;
      var formSpecs = [
        {
          type: 'text',
          title: gettextCatalog.getString('Update the block name'),
          value: block.data.name + (block.data.range || '')
        },
        {
          type: 'checkbox',
          label: gettextCatalog.getString('FPGA pin'),
          value: !block.data.virtual
        },
        {
          type: 'checkbox',
          label: gettextCatalog.getString('Show clock'),
          value: block.data.clock
        }
      ];
      utils.renderForm(formSpecs, function (evt, values) {
        var oldSize, newSize, offset = 0;
        var label = values[0];
        var virtual = !values[1];
        var clock = values[2];
        if (resultAlert) {
          resultAlert.dismiss(false);
        }
        // Validate values
        var portInfo = utils.parsePortLabel(label, common.PATTERN_GLOBAL_PORT_LABEL);
        if (portInfo) {
          evt.cancel = false;
          if (portInfo.rangestr && clock) {
            evt.cancel = true;
            resultAlert = alertify.warning(gettextCatalog.getString('Clock not allowed for data buses'));
            return;
          }
          if ((block.data.range || '') !==
            (portInfo.rangestr || '')) {
            var pins = getPins(portInfo);
            oldSize = block.data.virtual ? 1 : (block.data.pins ? block.data.pins.length : 1);
            newSize = virtual ? 1 : (pins ? pins.length : 1);
            // Update block position when size changes
            offset = 16 * (oldSize - newSize);
            // Create new block
            var blockInstance = {
              id: null,
              data: {
                name: portInfo.name,
                range: portInfo.rangestr,
                pins: pins,
                virtual: virtual,
                clock: clock
              },
              type: block.blockType,
              position: {
                x: block.position.x,
                y: block.position.y + offset
              }
            };
            if (callback) {
              graph.startBatch('change');
              callback(loadBasic(blockInstance));
              cellView.model.remove();
              graph.stopBatch('change');
              resultAlert = alertify.success(gettextCatalog.getString('Block updated'));
            }
          }
          else if (block.data.name !== portInfo.name ||
            block.data.virtual !== virtual ||
            block.data.clock !== clock) {
            var size = block.data.pins ? block.data.pins.length : 1;
            oldSize = block.data.virtual ? 1 : size;
            newSize = virtual ? 1 : size;
            // Update block position when size changes
            offset = 16 * (oldSize - newSize);
            // Edit block
            graph.startBatch('change');
            var data = utils.clone(block.data);
            data.name = portInfo.name;
            data.virtual = virtual;
            data.clock = clock;
            cellView.model.set('data', data, { translateBy: cellView.model.id, tx: 0, ty: -offset });
            cellView.model.translate(0, offset);
            graph.stopBatch('change');
            cellView.apply();
            resultAlert = alertify.success(gettextCatalog.getString('Block updated'));
          }
        }
        else {
          evt.cancel = true;
          resultAlert = alertify.warning(gettextCatalog.getString('Wrong block name {{name}}', { name: label }));
        }
      });
    }

    function editBasicOutput(cellView, callback) {
      var graph = cellView.paper.model;
      var block = cellView.model.attributes;
      var formSpecs = [
        {
          type: 'text',
          title: gettextCatalog.getString('Update the block name'),
          value: block.data.name + (block.data.range || '')
        },
        {
          type: 'checkbox',
          label: gettextCatalog.getString('FPGA pin'),
          value: !block.data.virtual
        }
      ];
      utils.renderForm(formSpecs, function (evt, values) {
        var oldSize, newSize, offset = 0;
        var label = values[0];
        var virtual = !values[1];
        if (resultAlert) {
          resultAlert.dismiss(false);
        }
        // Validate values
        var portInfo = utils.parsePortLabel(label, common.PATTERN_GLOBAL_PORT_LABEL);
        if (portInfo) {
          evt.cancel = false;
          if ((block.data.range || '') !==
            (portInfo.rangestr || '')) {
            var pins = getPins(portInfo);
            oldSize = block.data.virtual ? 1 : (block.data.pins ? block.data.pins.length : 1);
            newSize = virtual ? 1 : (pins ? pins.length : 1);
            // Update block position when size changes
            offset = 16 * (oldSize - newSize);
            // Create new block
            var blockInstance = {
              id: null,
              data: {
                name: portInfo.name,
                range: portInfo.rangestr,
                pins: pins,
                virtual: virtual
              },
              type: block.blockType,
              position: {
                x: block.position.x,
                y: block.position.y + offset
              }
            };
            if (callback) {
              graph.startBatch('change');
              callback(loadBasic(blockInstance));
              cellView.model.remove();
              graph.stopBatch('change');
              resultAlert = alertify.success(gettextCatalog.getString('Block updated'));
            }
          }
          else if (block.data.name !== portInfo.name ||
            block.data.virtual !== virtual) {
            var size = block.data.pins ? block.data.pins.length : 1;
            oldSize = block.data.virtual ? 1 : size;
            newSize = virtual ? 1 : size;
            // Update block position when size changes
            offset = 16 * (oldSize - newSize);
            // Edit block
            graph.startBatch('change');
            var data = utils.clone(block.data);
            data.name = portInfo.name;
            data.virtual = virtual;
            cellView.model.set('data', data, { translateBy: cellView.model.id, tx: 0, ty: -offset });
            cellView.model.translate(0, offset);
            graph.stopBatch('change');
            cellView.apply();
            resultAlert = alertify.success(gettextCatalog.getString('Block updated'));
          }
        }
        else {
          evt.cancel = true;
          resultAlert = alertify.warning(gettextCatalog.getString('Wrong block name {{name}}', { name: label }));
        }
      });
    }

    function editBasicConstant(cellView) {
      var block = cellView.model.attributes;
      var formSpecs = [
        {
          type: 'text',
          title: gettextCatalog.getString('Update the block name'),
          value: block.data.name
        },
        {
          type: 'checkbox',
          label: gettextCatalog.getString('Local parameter'),
          value: block.data.local
        }
      ];
      utils.renderForm(formSpecs, function (evt, values) {
        var label = values[0];
        var local = values[1];
        if (resultAlert) {
          resultAlert.dismiss(false);
        }
        // Validate values
        var paramInfo = utils.parseParamLabel(label, common.PATTERN_GLOBAL_PARAM_LABEL);
        if (paramInfo) {
          var name = paramInfo.name;
          evt.cancel = false;
          if (block.data.name !== name ||
            block.data.local !== local) {
            // Edit block
            var data = utils.clone(block.data);
            data.name = name;
            data.local = local;
            cellView.model.set('data', data);
            cellView.apply();
            resultAlert = alertify.success(gettextCatalog.getString('Block updated'));
          }
        }
        else {
          evt.cancel = true;
          resultAlert = alertify.warning(gettextCatalog.getString('Wrong block name {{name}}', { name: label }));
          return;
        }
      });
    }

    function editBasicMemory(cellView) {
      var block = cellView.model.attributes;
      var formSpecs = [
        {
          type: 'text',
          title: gettextCatalog.getString('Update the block name'),
          value: block.data.name
        },
        {
          type: 'combobox',
          label: gettextCatalog.getString('Address format'),
          value: block.data.format,
          options: [
            { value: 2, label: gettextCatalog.getString('Binary') },
            { value: 10, label: gettextCatalog.getString('Decimal') },
            { value: 16, label: gettextCatalog.getString('Hexadecimal') }
          ]
        },
        {
          type: 'checkbox',
          label: gettextCatalog.getString('Local parameter'),
          value: block.data.local
        }
      ];
      utils.renderForm(formSpecs, function (evt, values) {
        var label = values[0];
        var local = values[2];
        var format = parseInt(values[1]);
        if (resultAlert) {
          resultAlert.dismiss(false);
        }
        // Validate values
        var paramInfo = utils.parseParamLabel(label, common.PATTERN_GLOBAL_PARAM_LABEL);
        if (paramInfo) {
          var name = paramInfo.name;
          evt.cancel = false;
          if (block.data.name !== name ||
            block.data.local !== local ||
            block.data.format !== format) {
            // Edit block
            var data = utils.clone(block.data);
            data.name = name;
            data.local = local;
            data.format = format;
            cellView.model.set('data', data);
            cellView.apply();
            resultAlert = alertify.success(gettextCatalog.getString('Block updated'));
          }
        }
        else {
          evt.cancel = true;
          resultAlert = alertify.warning(gettextCatalog.getString('Wrong block name {{name}}', { name: label }));
          return;
        }
      });
    }

    function editBasicCode(cellView, callback) {
      var graph = cellView.paper.model;
      var block = cellView.model.attributes;
      var blockInstance = {
        id: block.id,
        data: utils.clone(block.data),
        type: 'basic.code',
        position: block.position,
        size: block.size
      };
      if (resultAlert) {
        resultAlert.dismiss(false);
      }
      newBasicCode(function (cells) {
        if (callback) {
          var cell = cells[0];
          if (cell) {
            var connectedWires = graph.getConnectedLinks(cellView.model);
            graph.startBatch('change');
            cellView.model.remove();
            callback(cell);
            // Restore previous connections
            for (var w in connectedWires) {
              var wire = connectedWires[w];
              var size = wire.get('size');
              var source = wire.get('source');
              var target = wire.get('target');
              if ((source.id === cell.id && containsPort(source.port, size, cell.get('rightPorts'))) ||
                (target.id === cell.id && containsPort(target.port, size, cell.get('leftPorts')) && (source.port !== 'constant-out' && source.port !== 'memory-out')) ||
                (target.id === cell.id && containsPort(target.port, size, cell.get('topPorts')) && (source.port === 'constant-out' || source.port === 'memory-out'))) {
                graph.addCell(wire);
              }
            }
            graph.stopBatch('change');
            resultAlert = alertify.success(gettextCatalog.getString('Block updated'));
          }
        }
      }, blockInstance);
    }

    function containsPort(port, size, ports) {
      var found = false;
      for (var i in ports) {
        if (port === ports[i].name && size === ports[i].size) {
          found = true;
          break;
        }
      }
      return found;
    }

    function editBasicInfo(cellView) {
      var block = cellView.model.attributes;
      var data = utils.clone(block.data);
      // Toggle readonly
      data.readonly = !data.readonly;
      // Translate info content
      if (data.info && data.readonly) {
        data.text = gettextCatalog.getString(data.info);
      }
      cellView.model.set('data', data);
      cellView.apply();
    }

  });
