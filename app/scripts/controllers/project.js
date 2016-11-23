'use strict';

angular.module('icestudio')
  .controller('ProjectCtrl', function ($rootScope,
                                       $scope,
                                       common,
                                       graph,
                                       gettextCatalog) {

    $scope.common = common;
    $scope.graph = graph;

    // Intialization

    graph.createPaper($('#paper'));
    setTimeout(function() {
      common.updateProjectName(gettextCatalog.getString('untitled'));
    }, 80);

    // Breadcrumbs

    $scope.breadcrumbsNavitate = function(selectedItem) {
      var item;
      do {
        graph.breadcrumbs.pop();
        item = graph.breadcrumbs.slice(-1)[0];
      }
      while (selectedItem != item);

      if (graph.breadcrumbs.length == 1) {
        graph.loadGraph(common.project);
        graph.appEnable(true);
      }
      else {
        var disabled = true;
        var project = common.project;
        for (var i = 1; i < graph.breadcrumbs.length; i++) {
          project = project.deps[graph.breadcrumbs[i].name];
        }
        graph.loadGraph(project, disabled);
        graph.appEnable(false);
      }
    }

    $rootScope.$on('refreshProject', function(event, callback) {
      common.refreshProject(callback);
    });

  });
