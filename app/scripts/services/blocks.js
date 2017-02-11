'use strict';

angular.module('icestudio')
  .service('blocks', function(joint,
                              utils,
                              common,
                              gettextCatalog) {
    var gridsize = 8;

    this.newBasic = newBasic;
    this.newGeneric = newGeneric;

    this.loadBasic = loadBasic;
    this.loadGeneric = loadGeneric;
    this.loadWire = loadWire;

    this.editBasic = editBasic;


    //-- New

    function newBasic(type, addCellCallback) {
      switch(type) {
        case 'basic.input':
          newBasicInput(addCellCallback);
          break;
        case 'basic.output':
          newBasicOutput(addCellCallback);
          break;
        case 'basic.constant':
          newBasicConstant(addCellCallback);
          break;
        case 'basic.code':
          newBasicCode(addCellCallback);
          break;
        case 'basic.info':
          newBasicInfo(addCellCallback);
          break;
        default:
          break;
      }
    }

    function newBasicInput(addCellCallback) {
      var blockInstance = {
        id: null,
        data: {},
        type: 'basic.input',
        position: { x: 4 * gridsize, y: 4 * gridsize }
      };
      utils.inputcheckbox2prompt([
        gettextCatalog.getString('Enter the input blocks'),
        gettextCatalog.getString('FPGA pin'),
        gettextCatalog.getString('Show clock')
      ], [
        'in',
        true,
        false
      ],
        function(evt, values) {
          var labels = values[0].replace(/ /g, '').split(',');
          var virtual = !values[1];
          var clock = values[2];
          // Validate values
          var portInfo, portInfos = [];
          for (var l in labels) {
            if (labels[l]) {
              portInfo = utils.parsePortLabel(labels[l]);
              if (portInfo) {
                evt.cancel = false;
                portInfos.push(portInfo);
              }
              else {
                evt.cancel = true;
                alertify.warning(gettextCatalog.getString('Wrong block name {{name}}', { name: labels[l] }));
                return;
              }
            }
            else {
              evt.cancel = true;
              //return;
            }
          }
          // Create blocks
          for (var p in portInfos) {
            portInfo = portInfos[p];
            var pins = getPins(portInfo);
            blockInstance.data = {
              name: portInfo.name,
              range: portInfo.rangestr,
              pins: pins,
              virtual: virtual,
              clock: clock
            };
            if (addCellCallback) {
              addCellCallback(loadBasic(blockInstance));
            }
            // Next block position
            blockInstance.position.y += (virtual ? 10 : (6 + 4 * pins.length)) * gridsize;
          }
      });
    }

    function newBasicOutput(addCellCallback) {
      var blockInstance = {
        id: null,
        data: {},
        type: 'basic.output',
        position: { x: 95 * gridsize, y: 4 * gridsize }
      };
      utils.inputcheckboxprompt([
        gettextCatalog.getString('Enter the output blocks'),
        gettextCatalog.getString('FPGA pin')
      ], [
        'out',
        true
      ],
        function(evt, values) {
          var labels = values[0].replace(/ /g, '').split(',');
          var virtual = !values[1];
          // Validate values
          var portInfo, portInfos = [];
          for (var l in labels) {
            if (labels[l]) {
              portInfo = utils.parsePortLabel(labels[l]);
              if (portInfo) {
                evt.cancel = false;
                portInfos.push(portInfo);
              }
              else {
                evt.cancel = true;
                alertify.warning(gettextCatalog.getString('Wrong block name {{name}}', { name: labels[l] }));
                return;
              }
            }
            else {
              evt.cancel = true;
              //return;
            }
          }
          // Create blocks
          for (var p in portInfos) {
            portInfo = portInfos[p];
            var pins = getPins(portInfo);
            blockInstance.data = {
              name: portInfo.name,
              range: portInfo.rangestr,
              pins: pins,
              virtual: virtual
            };
            if (addCellCallback) {
              addCellCallback(loadBasic(blockInstance));
            }
            // Next block position
            blockInstance.position.y += (virtual ? 10 : (6 + 4 * pins.length)) * gridsize;
          }
      });
    }

    function getPins(portInfo) {
      var pins = [];
      if (portInfo.range) {
        for (var r in portInfo.range) {
          pins.push({ index: portInfo.range[r].toString(), name: '', value: '0' });
        }
      }
      else {
        pins.push({ index: '0', name: '', value: '0' });
      }
      return pins;
    }

    function newBasicConstant(addCellCallback) {
      var blockInstance = {
        id: null,
        data: {},
        type: 'basic.constant',
        position: { x: 20 * gridsize, y: 4 * gridsize }
      };
      utils.inputcheckboxprompt([
        gettextCatalog.getString('Enter the constant blocks'),
        gettextCatalog.getString('Local parameter')
      ], [
        'C',
        false
      ],
        function(evt, values) {
          var labels = values[0].replace(/ /g, '').split(',');
          var local = values[1];
          // Validate values
          var paramInfo, paramInfos = [];
          for (var l in labels) {
            if (labels[l]) {
              paramInfo = utils.parseParamLabel(labels[l]);
              if (paramInfo) {
                evt.cancel = false;
                paramInfos.push(paramInfo);
              }
              else {
                evt.cancel = true;
                alertify.warning(gettextCatalog.getString('Wrong block name {{name}}', { name: labels[l] }));
                return;
              }
            }
            else {
              evt.cancel = true;
              //return;
            }
          }
          // Create blocks
          for (var p in paramInfos) {
            paramInfo = paramInfos[p];
            blockInstance.data = {
              name: paramInfo.name,
              value: '',
              local: local
            };
            if (addCellCallback) {
              addCellCallback(loadBasicConstant(blockInstance));
            }
            blockInstance.position.x += 15 * gridsize;
          }
      });
    }

    function newBasicCode(addCellCallback, block) {
      var blockInstance = {
        id: null,
        data: {
          code: '',
          params: [],
          ports: { in: [], out: [] }
        },
        type: 'basic.code',
        position: { x: 40 * gridsize, y: 16 * gridsize },
        size: { width: 192, height: 128 }
      };
      var defaultValues = [
        'a , b',
        'c , d',
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
      utils.multiprompt(
        [ gettextCatalog.getString('Enter the input ports'),
          gettextCatalog.getString('Enter the output ports'),
          gettextCatalog.getString('Enter the parameters') ],
        defaultValues,
        function(evt, values) {
          var inPorts = values[0].replace(/ /g, '').split(',');
          var outPorts = values[1].replace(/ /g, '').split(',');
          var params = values[2].replace(/ /g, '').split(',');
          var allNames = [];
          // Validate values
          var i, inPortInfo, inPortInfos = [];
          for (i in inPorts) {
            if (inPorts[i]) {
              inPortInfo = utils.parsePortLabel(inPorts[i]);
              if (inPortInfo && inPortInfo.name) {
                evt.cancel = false;
                inPortInfos.push(inPortInfo);
              }
              else {
                evt.cancel = true;
                alertify.warning(gettextCatalog.getString('Wrong port name {{name}}', { name: inPorts[i] }));
                return;
              }
            }
          }
          var o, outPortInfo, outPortInfos = [];
          for (o in outPorts) {
            if (outPorts[o]) {
              outPortInfo = utils.parsePortLabel(outPorts[o]);
              if (outPortInfo && outPortInfo.name) {
                evt.cancel = false;
                outPortInfos.push(outPortInfo);
              }
              else {
                evt.cancel = true;
                alertify.warning(gettextCatalog.getString('Wrong port name {{name}}', { name: outPorts[o] }));
                return;
              }
            }
          }
          var p, paramInfo, paramInfos = [];
          for (p in params) {
            if (params[p]) {
              paramInfo = utils.parseParamLabel(params[p]);
              if (paramInfo) {
                evt.cancel = false;
                paramInfos.push(paramInfo);
              }
              else {
                evt.cancel = true;
                alertify.warning(gettextCatalog.getString('Wrong parameter name {{name}}', { name: params[p] }));
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
            if (addCellCallback) {
              addCellCallback(loadBasicCode(blockInstance));
            }
          }
          else {
            evt.cancel = true;
            alertify.warning(gettextCatalog.getString('Duplicated block attributes'));
          }
      });
    }

    function newBasicInfo(addCellCallback) {
      var blockInstance = {
        id: null,
        data: { info: '' },
        type: 'basic.info',
        position: { x: 40 * gridsize, y: 36 * gridsize },
        size: { width: 192, height: 128 }
      };
      if (addCellCallback) {
        addCellCallback(loadBasicInfo(blockInstance));
      }
    }

    function newGeneric(type, block, addCellCallback) {
      var blockInstance = {
        id: null,
        type: type,
        position: { x: 10 * gridsize, y: 16 * gridsize }
      };
      if (block &&
          block.design &&
          block.design.graph &&
          block.design.graph.blocks &&
          block.design.graph.wires) {
        if (addCellCallback) {
          addCellCallback(loadGeneric(blockInstance, block));
        }
      }
      else {
        alertify.error(gettextCatalog.getString('Wrong block format: {{type}}', { type: type }), 30);
      }
    }


    //-- Load

    function loadBasic(instance, disabled) {
      switch(instance.type) {
        case 'basic.input':
          return loadBasicInput(instance, disabled);
        case 'basic.output':
          return loadBasicOutput(instance, disabled);
        case 'basic.constant':
          return loadBasicConstant(instance, disabled);
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

    function loadBasicOutput(instance, disabled) {
      var data = instance.data;
      var leftPorts = [{
        id: 'in',
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

    function loadBasicConstant(instance, disabled) {
      var bottomPorts = [{
        id: 'constant-out',
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

    function loadBasicCode(instance, disabled) {
      var port;
      var leftPorts = [];
      var rightPorts = [];
      var topPorts = [];

      for (var i in instance.data.ports.in) {
        port = instance.data.ports.in[i];
        if (!port.range) {
          port.default = hasInputRule(port.name);
        }
        leftPorts.push({
          id: port.name,
          label: port.name + (port.range || ''),
          size: port.size || 1
        });
      }

      for (var o in instance.data.ports.out) {
        port = instance.data.ports.out[o];
        rightPorts.push({
          id: port.name,
          label: port.name + (port.range || ''),
          size: port.size || 1
        });
      }

      for (var p in instance.data.params) {
        port = instance.data.params[p];
        topPorts.push({
          id: port.name,
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

    function hasInputRule(port) {
      var _default;
      var rules = common.selectedBoard.rules;
      if (rules) {
        var allInitPorts = rules.input;
        if (allInitPorts) {
          for (var i in allInitPorts) {
            if (port === allInitPorts[i].port){
              _default = allInitPorts[i];
              _default.apply = true;
              break;
            }
          }
        }
      }
      return _.clone(_default);
    }

    function loadGeneric(instance, block, disabled) {
      var i;
      var leftPorts = [];
      var rightPorts = [];
      var topPorts = [];
      var bottomPorts = [];

      instance.data = { ports: { in: [] }};

      for (i in block.design.graph.blocks) {
        var item = block.design.graph.blocks[i];
        if (item.type === 'basic.input') {
          if (!item.data.range) {
            instance.data.ports.in.push({
              name: item.id,
              default: hasInputRule((item.data.clock ? 'clk' : '') || item.data.name)
            });
          }
          leftPorts.push({
            id: item.id,
            label: item.data.name + (item.data.range || ''),
            size: item.data.pins ? item.data.pins.length : (item.data.size || 1),
            clock: item.data.clock
          });
        }
        else if (item.type === 'basic.output') {
          rightPorts.push({
            id: item.id,
            label: item.data.name + (item.data.range || ''),
            size: item.data.pins ? item.data.pins.length : (item.data.size || 1)
          });
        }
        else if (item.type === 'basic.constant') {
          if (!item.data.local) {
            topPorts.push({
              id: item.id,
              label: item.data.name
            });
          }
        }
      }

      var size = instance.size;

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
        tooltip: block.package.description,
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
      for (var _out = 0; _out < source.attributes.rightPorts.length; _out++) {
        if (source.attributes.rightPorts[_out] === instance.source.port) {
          sourceSelector = _out;
          break;
        }
      }
      for (var _in = 0; _in < source.attributes.leftPorts.length; _in++) {
        if (target.attributes.leftPorts[_in] === instance.target.port) {
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

    function editBasic(type, cellView, addCellCallback) {
      switch(type) {
        case 'basic.input':
          editBasicInput(cellView, addCellCallback);
          break;
        case 'basic.output':
          editBasicOutput(cellView, addCellCallback);
          break;
        case 'basic.constant':
          editBasicConstant(cellView, addCellCallback);
          break;
        case 'basic.code':
          editBasicCode(cellView, addCellCallback);
          break;
        default:
          break;
      }
    }

    function editBasicInput(cellView, addCellCallback) {
      var graph = cellView.paper.model;
      var block = cellView.model.attributes;
      utils.inputcheckbox2prompt([
        gettextCatalog.getString('Update the block name'),
        gettextCatalog.getString('FPGA pin'),
        gettextCatalog.getString('Show clock'),
      ], [
        block.data.name + (block.data.range || ''),
        !block.data.virtual,
        block.data.clock
      ],
        function(evt, values) {
          var oldSize, newSize, offset = 0;
          var label = values[0].replace(/ /g, '');
          var virtual = !values[1];
          var clock = values[2];
          // Validate values
          var portInfo = utils.parsePortLabel(label);
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
                  virtual: virtual,
                  clock: clock
                },
                type: block.blockType,
                position: {
                  x: block.position.x,
                  y: block.position.y + offset
                }
              };
              if (addCellCallback) {
                graph.startBatch('change');
                addCellCallback(loadBasic(blockInstance));
                cellView.model.remove();
                graph.stopBatch('change');
                alertify.success(gettextCatalog.getString('Block updated'));
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
              alertify.success(gettextCatalog.getString('Block updated'));
            }
          }
          else {
            evt.cancel = true;
            alertify.warning(gettextCatalog.getString('Wrong block name {{name}}', { name: label }));
          }
      });
    }

    function editBasicOutput(cellView, addCellCallback) {
      var graph = cellView.paper.model;
      var block = cellView.model.attributes;
      utils.inputcheckboxprompt([
        gettextCatalog.getString('Update the block name'),
        gettextCatalog.getString('FPGA pin')
      ], [
        block.data.name + (block.data.range || ''),
        !block.data.virtual
      ],
        function(evt, values) {
          var oldSize, newSize, offset = 0;
          var label = values[0].replace(/ /g, '');
          var virtual = !values[1];
          // Validate values
          var portInfo = utils.parsePortLabel(label);
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
              if (addCellCallback) {
                graph.startBatch('change');
                addCellCallback(loadBasic(blockInstance));
                cellView.model.remove();
                graph.stopBatch('change');
                alertify.success(gettextCatalog.getString('Block updated'));
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
              alertify.success(gettextCatalog.getString('Block updated'));
            }
          }
          else {
            evt.cancel = true;
            alertify.warning(gettextCatalog.getString('Wrong block name {{name}}', { name: label }));
          }
      });
    }

    function editBasicConstant(cellView) {
      var block = cellView.model.attributes;
      utils.inputcheckboxprompt([
        gettextCatalog.getString('Update the block name'),
        gettextCatalog.getString('Local parameter')
      ], [
        block.data.name,
        block.data.local
      ],
        function(evt, values) {
          var label = values[0].replace(/ /g, '');
          var local = values[1];
          // Validate values
          var paramInfo = utils.parseParamLabel(label);
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
              alertify.success(gettextCatalog.getString('Block updated'));
            }
          }
          else {
            evt.cancel = true;
            alertify.warning(gettextCatalog.getString('Wrong block name {{name}}', { name: label }));
            return;
          }
      });
    }

    function editBasicCode(cellView, addCellCallback) {
      var graph = cellView.paper.model;
      var block = cellView.model.attributes;
      var blockInstance = {
        id: block.id,
        data: utils.clone(block.data),
        type: 'basic.code',
        position: block.position,
        size: block.size
      };
      newBasicCode(function(cell) {
        if (addCellCallback) {
          var connectedWires = graph.getConnectedLinks(cellView.model);
          graph.startBatch('change');
          cellView.model.remove();
          addCellCallback(cell);
          // Restore previous connections
          for (var w in connectedWires) {
            var wire = connectedWires[w];
            var source = wire.get('source');
            var target = wire.get('target');
            if ((source.id === cell.id && containsPort(source.port, cell.get('rightPorts'))) ||
                (target.id === cell.id && containsPort(target.port, cell.get('leftPorts')) && source.port !== 'constant-out') ||
                (target.id === cell.id && containsPort(target.port, cell.get('topPorts')) && source.port === 'constant-out')) {
              graph.addCell(wire);
            }
          }
          graph.stopBatch('change');
          alertify.success(gettextCatalog.getString('Block updated'));
        }
      }, blockInstance);
    }

    function containsPort(port, ports) {
      var found = false;
      for (var i in ports) {
        if (port === ports[i].label) {
          found = true;
          break;
        }
      }
      return found;
    }

  });
