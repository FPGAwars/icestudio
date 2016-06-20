'use strict';

angular.module('icestudio')
  .controller('ProjectCtrl', function ($rootScope,
                                       $scope,
                                       common,
                                       graph) {

    $scope.common = common;
    $scope.graph = graph;

    // Intialization

    graph.createPaper($('#paper'));
    common.updateProjectName('untitled');


    $scope.breadcrumbNavitate = function(selectedItem) {
      var item;
      do {
        graph.breadcrumb.pop();
        item = graph.breadcrumb.slice(-1)[0];
      }
      while (selectedItem.name != item.name);

      if (graph.breadcrumb.length == 1) {
        graph.loadProject(common.project);
        graph.paperEnable(true);
      }
      else {
        graph.loadProject(common.project.deps[selectedItem.type]);
        graph.paperEnable(false);
      }
    }

    $rootScope.$on('refreshProject', function(event, callback) {
      common.refreshProject(callback);
    });

    /*
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
  });
