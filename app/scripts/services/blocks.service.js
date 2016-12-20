'use strict';

angular.module('icestudio')
  .service('blocks', function(joint,
                              boards,
                              utils,
                              gettextCatalog) {
    var gridsize = 8;

    this.new = function(type, block, addCellcallback) {
      switch(type) {
        case 'basic.input':
        case 'basic.output':
          return newBasicIO(type, addCellcallback);
      }
    };

    this.loadBasicInput = loadBasicInput;
    this.loadBasicOutput = loadBasicOutput;

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

    this.basicConstant = function(instance, disabled) {
      var cell = new joint.shapes.ice.Constant({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        disabled: disabled
      });
      return cell;
    };

    this.basicCode = function(instance, disabled) {
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
    };

    this.basicInfo = function(instance, disabled) {
      var cell = new joint.shapes.ice.Info({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        disabled: disabled
      });
      return cell;
    };

    this.generic = function(instance, block) {
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
    };

    this.wire = function(instance, source, target) {

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
    };

    function newBasicIO(type, addCellCallback) {
      var config = null;
      if (type === 'basic.input') {
        config = { type: type, _default: 'in', loadFunction: loadBasicInput, x: 4 };
      }
      else if (type === 'basic.output') {
        config = { type: type, _default: 'out',loadFunction: loadBasicOutput, x: 95 };
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
            for (var l in labels) {
              var portInfo = utils.parsePortLabel(labels[l]);
              if (portInfo) {
                evt.cancel = false;
                blockInstance.data = {
                  label: portInfo.input,
                  name: portInfo.name,
                  range: portInfo.rangestr ? portInfo.rangestr : '',
                  pins: getPins(portInfo),
                  virtual: true
                };
                if (addCellCallback) {
                  addCellCallback(config.loadFunction(blockInstance));
                }
                // Next block position
                blockInstance.position.y += 10 * gridsize;
              }
              else {
                evt.cancel = true;
                alertify.notify(gettextCatalog.getString('Wrong port name {{name}}', {name: labels[l]}), 'warning', 3);
                break;
              }
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

  });
