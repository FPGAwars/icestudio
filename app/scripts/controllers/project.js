'use strict';

angular.module('icestudio')
  .controller('ProjectCtrl', function ($scope,
                                       $rootScope,
                                       common,
                                       graph,
                                       boards,
                                       utils) {

    $scope.project = common.project;
    $scope.breadcrumb = common.breadcrumb;

    // Intialization

    common.updateProjectName('untitled');

    graph.createPaper($('#paper'));




    // Paper events



    // Events

    $rootScope.$on('newProject', function(event, name) {
      project.updateName(name);
      clear();
      alertify.success('New project ' + name + ' created');
    });

    $rootScope.$on('openProject', function(event, filepath) {
      $.getJSON(filepath, function(p) {
        var name = utils.basename(filepath);
        project.updateName(name);
        $rootScope.project = p;
        loadGraph(p, true, true);
        alertify.success('Project ' + name + ' loaded');
      });
    });

    $rootScope.$on('saveProject', function(event, filepath) {
      var name = utils.basename(filepath);
      project.updateName(name);
      refreshProject(null, true);
      save(filepath);
    });

    // importBlock

    // exportAsBlock



    /*$rootScope.$on('loadCustomBlock', function(event, name) {
      var filepath = 'res/blocks/custom/' + name + '/' + name + '.json';
      $.getJSON(filepath, function(p) {
        project.updateName(name);
        $rootScope.project = p;
        loadGraph(project, true, true);
        alertify.success('Custom block ' + name + ' loaded');
      });
    });

    $rootScope.$on('saveCustomBlock', function(event, name) {
      var filepath = 'app/res/blocks/custom/' + name;
      try {
        nodeFs.mkdirSync(filepath);
      } catch(e) {
        if ( e.code != 'EEXIST' ) throw e;
      }
      project.updateName(name);
      save(filepath + '/' + name + '.json', false);
      blocks.loadBlocks(); // Refresh menu blocks
      alertify.success('Project ' + name + ' exported to custom blocks');
    });

    $rootScope.$on('removeCustomBlock', function(event, name) {
      var filepath = 'app/res/blocks/custom/' + name;
      nodeRmdir(filepath, function (err, dirs, files) {
        blocks.loadBlocks();
        alertify.success('Custom block ' + name + ' removed');
      });
    });*/

    $rootScope.$on('removeSelectedBlock', function(event) {
      if (paper.options.interactive) {
        if ($scope.selectedCell) {
          alertify.confirm('Do you want to remove the selected block?',
            function() {
              $scope.selectedCell.remove();
              delete $scope.selectedCell;
              refreshProject();
              alertify.success('Block removed');
          });
        }
      }
    });

    $(document).on('keydown', function(event) {
      if (event.keyCode == 46) { // Supr
        $rootScope.$emit('removeSelectedBlock');
      }
    });

    $rootScope.$on('clearGraph', function(event) {
      clear();
      alertify.success('Graph cleared');
    });

    $rootScope.$on('addBasicBlock', function(event, block) {
      if (paper.options.interactive) {
        block.id = null;
        block.position = { x: 100, y: 100 };
        if (block.type == 'basic.code') {
          alertify.prompt('Insert the block i/o', 'a,b c',
            function(evt, ports) {
              if (ports) {
                block.data = {
                  code: '',
                  ports: { in: [], out: [] }
                };
                // Parse ports
                // TODO: undefined
                var inPorts = ports.split(' ')[0].split(',');
                var outPorts = ports.split(' ')[1].split(',');
                for (var i in inPorts) {
                  if (inPorts[i])
                    block.data.ports.in.push(inPorts[i]);
                }
                for (var o in outPorts) {
                  if (outPorts[o])
                    block.data.ports.out.push(outPorts[o]);
                }
                addBasicCodeBlock(block);
              }
          });
        }
        else if (block.type == 'basic.input' || block.type == 'basic.output') {
          alertify.prompt('Insert the block name', '',
            function(evt, name) {
              if (name) {
                block.data = {
                  name: name,
                  value: '',
                  choices: boards.getPinout($rootScope.selectedBoard)
                };
                addBasicIOBlock(block);
              }
          });
        }
      }
    });

    $rootScope.$on('addBlock', function(event, blockdata) {
      if (paper.options.interactive) {
        var block = {};
        block.id = null;
        block.position = { x: 100, y: 100 };
        addBlock(block, blockdata);
      }
    });

    $rootScope.$on('boardChanged', function(event, board) {
      var cells = graph.getCells();
      // Reset choices in all i/o blocks
      for (var c in cells) {
        var type = cells[c].attributes.blockType;
        if (type == 'basic.input' && type == 'basic.output') {
          cells[c].attributes.choices = boards.getPinout(board);
          paper.findViewByModel(cells[c].id).renderChoices();
        }
      }
    });

    $scope.breadcrumbNavitate = function(selectedItem) {
      var item;
      do {
        $rootScope.breadcrumb.pop();
        item = $rootScope.breadcrumb.slice(-1)[0];
      }
      while (selectedItem.name != item.name);

      if ($rootScope.breadcrumb.length == 1) {
        loadGraph($rootScope.project, true, true);
      }
      else {
        var type = selectedItem.type.split('.')
        loadGraph($rootScope.blocks[type[0]][type[1]], false, false);
      }
    }

    // Functions

    function save(filepath) {
      var graphData = graph.toJSON();
      var name = utils.basename(filepath);

      nodeFs.writeFile(filepath, JSON.stringify($rootScope.project, null, 2),
        function(err) {
          if (!err) {
            console.log('File ' + name + ' saved');
          }
      });
    }


    function loadGraph(block, interactive, fpgaio) {

      var blocks = block.data.blocks;
      var wires = block.data.wires;

      paperEnable(interactive);

      graph.clear();
      delete $scope.selectedCell;

      // Blocks
      for (var i in blocks) {
        var block = blocks[i];
        if (block.type == 'basic.code') {
          addBasicCodeBlock(block);
        }
        else if (block.type == 'basic.input' || block.type == 'basic.output') {
          addBasicIOBlock(block);
        }
        else {
          addBlock(block);
        }
      }

      // Wires
      for (var i in wires) {
        addWire(wires[i]);
      }
    }

    function addBasicIOBlock(block) {
      var inPorts = [];
      var outPorts = [];

      if (block.type == 'basic.input') {
        outPorts.push({
          name: 'out',
          label: ''
        });
      }
      else if (block.type == 'basic.output') {
        inPorts.push({
          name: 'in',
          label: ''
        });
      }

      var block = new joint.shapes.ice.IO({
        id: block.id,
        blockType: block.type,
        data: { name: block.data.name, value: block.data.value },
        position: block.position,
        inPorts: inPorts,
        outPorts: outPorts,
        size: { width: 70, height: 50 },
        attrs: { '.block-label': { text: block.data.name } }
      });

      graph.addCell(block);
      refreshProject();
    }

    function addBasicCodeBlock(block) {
      var inPorts = [];
      var outPorts = [];

      for (var i in block.data.ports.in) {
        inPorts.push({
          name: block.data.ports.in[i],
          label: block.data.ports.in[i]
        });
      }

      for (var o in block.data.ports.out) {
        outPorts.push({
          name: block.data.ports.out[o],
          label: block.data.ports.out[o]
        });
      }

      var block = new joint.shapes.ice.Code({
        id: block.id,
        blockType: block.type,
        data: block.data,
        position: block.position,
        inPorts: inPorts,
        outPorts: outPorts,
        size: { width: 400, height: 200 }
      });

      graph.addCell(block);
      refreshProject();
    }

    function addBlock(data) {

      console.log(data);

      var inPorts = [];
      var outPorts = [];

      for (var i in data.blocks) {
        var block = data.blocks[i];
        if (block.type == 'basic.input') {
          inPorts.push({
            name: block.data.name,
            label: block.data.name
          });
        }
        else if (block.type == 'basic.output') {
          outPorts.push({
            name: block.data.name,
            label: block.data.name
          });
        }
      }

      var numPorts = Math.max(inPorts.length, outPorts.length);

      var block = new joint.shapes.ice.Block({
        id: null,
        blockType: data.type,
        data: data.data,
        position: block.position,
        inPorts: inPorts,
        outPorts: outPorts,
        size: { width: 50, height: 50 + 20 * numPorts },
        attrs: { '.block-label': { text: block.name } }
      });

      graph.addCell(block);
      refreshProject();
    }

    function addWire(wire) {
      var source = graph.getCell(wire.source.block);
      var target = graph.getCell(wire.target.block);

      // Find selectors
      var sourceSelector, targetSelector;
      for (var _out = 0; _out < source.attributes.outPorts.length; _out++) {
        if (source.attributes.outPorts[_out] == wire.source.port) {
          sourcePort = _out;
          break;
        }
      }
      for (var _in = 0; _in < source.attributes.inPorts.length; _in++) {
        if (target.attributes.inPorts[_in] == wire.target.port) {
          targetPort = _in;
          break;
        }
      }

      var _wire = new joint.shapes.ice.Wire({
        source: { id: source.id, selector: sourceSelector, port: wire.source.port },
        target: { id: target.id, selector: targetSelector, port: wire.target.port },
      });
      graph.addCell(_wire);
    }

    function refreshProject(callback, fpgaio) {
      var graphData = graph.toJSON();

      var blocks = [];
      var wires = [];

      for (var c = 0; c < graphData.cells.length; c++) {
        var cell = graphData.cells[c];

        if (cell.type == 'ice.Block' || cell.type == 'ice.IO' || cell.type == 'ice.Code') {
          var block = {};
          block.id = cell.id;
          block.type = cell.blockType;
          block.data = cell.data;
          block.position = cell.position;
          if (cell.type == 'ice.Code') {
            block.data.code = paper.findViewByModel(cell.id).$box.find('#content').val();
          }
          blocks.push(block);
        }
        else if (cell.type == 'ice.Wire') {
          var wire = {};
          wire.source = { block: cell.source.id, port: cell.source.port };
          wire.target = { block: cell.target.id, port: cell.target.port };
          wires.push(wire);
        }
      }

      $rootScope.project.data = { blocks: blocks, wires: wires };

      if (callback)
        callback();
    }

  });
