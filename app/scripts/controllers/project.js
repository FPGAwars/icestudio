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
        // graph.dependencies
        graph.loadProject(common.project.deps[selectedItem.type]);
        graph.paperEnable(false);
      }
    }

    $rootScope.$on('refreshProject', function(event, callback) {
      common.refreshProject(callback);
    });

  });
