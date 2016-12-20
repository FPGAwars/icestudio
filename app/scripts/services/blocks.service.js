'use strict';

angular.module('icestudio')
  .service('blocks', function(joint,
                              boards,
                              utils,
                              gettextCatalog) {
    var gridsize = 8;

    this.newBasic = function(type, block, addCellCallback) {
      switch(type) {
        case 'basic.input':
        case 'basic.output':
          newBasicIO(type, addCellCallback);
          break;
        case 'basic.constant':
          newBasicConstant(addCellCallback);
          break;
        case 'basic.code':
          newBasicCode(block, addCellCallback); // block
          break;
        case 'basic.info':
          newBasicInfo(addCellCallback);
          break;
        default:
          break;
      }
    };
    this.newGeneric = newGeneric;

    this.loadBasic = loadBasic;
    this.loadGeneric = loadGeneric;
    this.loadWire = loadWire;


    this.editBasicIO = editBasicIO;


    //-- New

    function newBasicIO(type, addCellCallback) {
      var config = null;
      if (type === 'basic.input') {
        config = { type: type, _default: 'in', x: 4 };
      }
      else if (type === 'basic.output') {
        config = { type: type, _default: 'out', x: 95 };
      }
      if (config) {
        var blockInstance = {
          id: null,
          data: {},
          type: config.type,
          position: { x: config.x * gridsize, y: 4 * gridsize }
        };
        alertify.prompt(gettextCatalog.getString('Enter the ports'), config._default,
        function(evt, input) {
          if (input) {
            var labels = input.replace(/ /g, '').split(',');
            var portInfo, portInfos = [];
            // Validate input
            for (var l in labels) {
              portInfo = utils.parsePortLabel(labels[l]);
              if (portInfo) {
                evt.cancel = false;
                portInfos.push(portInfo);
              }
              else {
                evt.cancel = true;
                alertify.notify(gettextCatalog.getString('Wrong port name {{name}}', { name: labels[l] }), 'warning', 3);
                return;
              }
            }
            // Create blocks
            for (var p in portInfos) {
              portInfo = portInfos[p];
              blockInstance.data = {
                label: portInfo.input,
                name: portInfo.name,
                range: portInfo.rangestr ? portInfo.rangestr : '',
                pins: getPins(portInfo),
                virtual: true
              };
              if (addCellCallback) {
                addCellCallback(loadBasic(blockInstance));
              }
              // Next block position
              blockInstance.position.y += 10 * gridsize;
            }
          }
        });
      }
    }

    function getPins(portInfo) {
      var pins = [];
      if (portInfo.range) {
        for (var r in portInfo.range) {
          pins.push({ index: portInfo.range[r].toString(), name: '', value: 0 });
        }
      }
      else {
        pins.push({ index: '0', name: '', value: 0 });
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
      alertify.prompt(gettextCatalog.getString('Enter the constant blocks'), 'C',
        function(evt, name) {
          if (name) {
            var names = name.replace(/ /g, '').split(',');
            for (var n in names) {
              if (names[n]) {
                blockInstance.data = {
                  label: names[n],
                  local: false,
                  value: ''
                };
                if (addCellCallback) {
                  addCellCallback(loadBasicConstant(blockInstance));
                }
                blockInstance.position.x += 15 * gridsize;
              }
            }
          }
      });
    }

    function newBasicCode(block, addCellCallback) {
      var blockInstance = {
        id: null,
        data: {},
        type: 'basic.code',
        position: { x: 4 * gridsize, y: 4 * gridsize }
      };
      var defaultValues = [
        'a , b',
        'c , d',
        ''
      ];
      if (block && block.data) {
        if (block.data.ports) {
          defaultValues[0] = block.data.ports.in.join(' , ');
          defaultValues[1] = block.data.ports.out.join(' , ');
        }
        if (block.data.params) {
          defaultValues[2] = block.data.params.join(' , ');
        }
      }
      utils.multiprompt(
        [ gettextCatalog.getString('Enter the input ports'),
          gettextCatalog.getString('Enter the output ports'),
          gettextCatalog.getString('Enter the parameters') ],
        defaultValues,
        function(evt, ports) {
          if (ports && (ports[0].length || ports[1].length)) {
            blockInstance.data = {
              code: '',
              params: [],
              ports: { in: [], out: [] }
            };
            // Parse ports
            var inPorts = [];
            var outPorts = [];
            var params = [];
            if (ports.length > 0) {
              inPorts = ports[0].replace(/ /g, '').split(',');
            }
            if (ports.length > 1) {
              outPorts = ports[1].replace(/ /g, '').split(',');
            }
            if (ports.length > 2) {
              params = ports[2].replace(/ /g, '').split(',');
            }

            for (var i in inPorts) {
              if (inPorts[i]) {
                blockInstance.data.ports.in.push(inPorts[i]);
              }
            }
            for (var o in outPorts) {
              if (outPorts[o]) {
                blockInstance.data.ports.out.push(outPorts[o]);
              }
            }
            for (var p in params) {
              if (params[p]) {
                blockInstance.data.params.push(params[p]);
              }
            }
            blockInstance.position.x = 31 * gridsize;
            blockInstance.position.y = 24 * gridsize;

            var allAttrs= inPorts.concat(outPorts, params);
            var numAttrs = allAttrs.length;

            // Check duplicated attributes
            if (numAttrs === $.unique(allAttrs).length) {
              evt.cancel = false;
              if (block) {
                blockInstance.data.code = block.data.code;
                blockInstance.position = block.position;
              }
              if (addCellCallback) {
                addCellCallback(loadBasicCode(blockInstance));
              }
            }
            else {
              evt.cancel = true;
              alertify.notify(gettextCatalog.getString('Duplicated block attributes'), 'warning', 3);
            }
          }
      });
    }

    function newBasicInfo(addCellCallback) {
      var blockInstance = {
        id: null,
        data: { info: '' },
        type: 'basic.info',
        position: { x: 4 * gridsize, y: 30 * gridsize }
      };
      if (addCellCallback) {
        addCellCallback(loadBasicInfo(blockInstance));
      }
    }

    function newGeneric(type, block, addCellCallback) {
      var blockInstance = {
        id: null,
        type: type,
        position: { x: 6 * gridsize, y: 16 * gridsize }
      };
      if (block &&
          block.design &&
          block.design.graph &&
          block.design.graph.blocks &&
          block.design.graph.wires &&
          block.design.deps) {
        if (addCellCallback) {
          addCellCallback(loadGeneric(blockInstance, block));
        }
      }
      else {
        alertify.notify(gettextCatalog.getString('Wrong block format: {{type}}', { type: type }), 'error', 30);
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
      var cell = new joint.shapes.ice.Input({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        disabled: disabled,
        choices: boards.getPinoutHTML()
      });
      return cell;
    }

    function loadBasicOutput(instance, disabled) {
      var cell = new joint.shapes.ice.Output({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        disabled: disabled,
        choices: boards.getPinoutHTML()
      });
      return cell;
    }

    function loadBasicConstant(instance, disabled) {
      var cell = new joint.shapes.ice.Constant({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        disabled: disabled
      });
      return cell;
    }

    function loadBasicCode(instance, disabled) {
      var leftPorts = [];
      var rightPorts = [];
      var topPorts = [];

      for (var i in instance.data.ports.in) {
        leftPorts.push({
          id: instance.data.ports.in[i],
          label: instance.data.ports.in[i],
          gridUnits: 32
        });
      }

      for (var o in instance.data.ports.out) {
        rightPorts.push({
          id: instance.data.ports.out[o],
          label: instance.data.ports.out[o],
          gridUnits: 32
        });
      }

      for (var p in instance.data.params) {
        topPorts.push({
          id: instance.data.params[p],
          label: instance.data.params[p],
          gridUnits: 48
        });
      }

      var cell = new joint.shapes.ice.Code({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
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
        disabled: disabled
      });
      return cell;
    }

    function loadGeneric(instance, block) {
      var i;
      var leftPorts = [];
      var rightPorts = [];
      var topPorts = [];
      var bottomPorts = [];
      var gridsize = 8;

      for (i in block.design.graph.blocks) {
        var item = block.design.graph.blocks[i];
        if (item.type === 'basic.input') {
          leftPorts.push({
            id: item.id,
            label: item.data.label
          });
        }
        else if (item.type === 'basic.output') {
          rightPorts.push({
            id: item.id,
            label: item.data.label
          });
        }
        else if (item.type === 'basic.constant') {
          if (!item.data.local) {
            topPorts.push({
              id: item.id,
              label: item.data.label
            });
          }
        }
      }

      var numPortsHeight = Math.max(leftPorts.length, rightPorts.length);
      var numPortsWidth = Math.max(topPorts.length, bottomPorts.length);

      var height = 8 * gridsize;
      height = Math.max(4 * gridsize * numPortsHeight, height);
      var blockLabel = instance.type.toUpperCase();
      var blockLabels = instance.type.split('.');
      var maxBlockLabel = '';
      var width = 12 * gridsize;

      for (var l in blockLabels) {
        if (blockLabels[l].length > maxBlockLabel.length) {
          maxBlockLabel = blockLabels[l];
        }
      }
      if (maxBlockLabel.length > 4) {
        width = Math.min((maxBlockLabel.length + 8) * gridsize, 24 * gridsize);
      }
      width = Math.max(4 * gridsize * numPortsWidth, width);

      var gridUnitsHeight = height / gridsize;
      var gridUnitsWidth = width / gridsize;

      for (i in leftPorts) {
        leftPorts[i].gridUnits = gridUnitsHeight;
      }
      for (i in rightPorts) {
        rightPorts[i].gridUnits = gridUnitsHeight;
      }
      for (i in topPorts) {
        topPorts[i].gridUnits = gridUnitsWidth;
      }
      for (i in bottomPorts) {
        bottomPorts[i].gridUnits = gridUnitsWidth;
      }

      if (blockLabels.length > 1) {
        blockLabel = blockLabels.join('<br>').toUpperCase();
      }

      var blockImage = '';
      if (block.package.image) {
        width = 12 * gridsize;
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
        data: {},
        image: blockImage,
        label: blockLabel,
        position: instance.position,
        leftPorts: leftPorts,
        rightPorts: rightPorts,
        topPorts: topPorts,
        size: {
          width: width,
          height: height
        }
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

    function editBasicIO(cellView, addCellCallback) {
      var block = cellView.model.attributes;
      utils.inputcheckboxprompt([
        gettextCatalog.getString('Update the port'),
        gettextCatalog.getString('Virtual port')
      ], [
        block.data.label,
        block.data.virtual
      ],
        function(evt, values) {
          var label = values[0].replace(/ /g, '');
          var virtual = values[1];
          // Validate input
          var portInfo = utils.parsePortLabel(label);
          if (portInfo) {
            evt.cancel = false;
            if (!block.data.range) {
              block.data.range = '';
            }
            if (!portInfo.rangestr) {
              portInfo.rangestr = '';
            }
            if (block.data.range !== portInfo.rangestr) {
              // Create new block
              var blockInstance = {
                id: null,
                data: {
                  label: portInfo.input,
                  name: portInfo.name,
                  range: portInfo.rangestr ? portInfo.rangestr : '',
                  pins: getPins(portInfo),
                  virtual: virtual
                },
                type: block.blockType,
                position: block.position
              };
              if (addCellCallback) {
                addCellCallback(loadBasic(blockInstance));
                cellView.model.remove();
                alertify.success(gettextCatalog.getString('Block updated: create'));
              }
            }
            else if (block.data.name !== portInfo.name ||
                     block.data.virtual !== virtual) {
              // Edit block
              block.data.label = portInfo.input;
              block.data.name = portInfo.name;
              block.data.pins = getPins(portInfo);
              block.data.virtual = virtual;
              cellView.render();
              alertify.success(gettextCatalog.getString('Block updated: edit'));
            }
          }
          else {
            evt.cancel = true;
            alertify.notify(gettextCatalog.getString('Wrong port name {{name}}', { name: label }), 'warning', 3);
          }
      });
    }

  });
