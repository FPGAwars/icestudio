'use strict';

angular.module('icestudio')
  .controller('ProjectCtrl', function ($scope,
                                       $rootScope,
                                       common,
                                       graph) {

    $scope.common = common;

    // Intialization

    graph.createPaper($('#paper'));


    /*$scope.breadcrumbNavitate = function(selectedItem) {
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


    $rootScope.$on('loadCustomBlock', function(event, name) {
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



    $rootScope.$on('addBlock', function(event, blockdata) {
      if (paper.options.interactive) {
        var block = {};
        block.id = null;
        block.position = { x: 100, y: 100 };
        addBlock(block, blockdata);
      }
    });




    // Functions



  });
