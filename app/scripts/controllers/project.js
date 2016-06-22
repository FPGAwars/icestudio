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

    $scope.breadcrumbsNavitate = function(selectedItem) {
      var item;
      do {
        graph.breadcrumbs.pop();
        item = graph.breadcrumbs.slice(-1)[0];
      }
      while (selectedItem.name != item.name);

      if (graph.breadcrumbs.length == 1) {
        graph.loadProject(common.project);
        graph.paperEnable(true);
      }
      else {
        var disabled = true;
        var project = common.project;
        for (var i = 1; i < graph.breadcrumbs.length; i++) {
          project = project.deps[graph.breadcrumbs[i].name];
        }
        graph.loadProject(project, disabled);
        graph.paperEnable(false);
      }
    }

    $rootScope.$on('refreshProject', function(event, callback) {
      common.refreshProject(callback);
    });

  });
