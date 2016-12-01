'use strict';

angular.module('icestudio')
  .controller('ProjectCtrl', function ($rootScope,
                                       $scope,
                                       common,
                                       boards,
                                       graph,
                                       gettextCatalog) {

    $scope.common = common;
    $scope.boards = boards;
    $scope.graph = graph;

    // Intialization

    graph.createPaper($('#paper'));


    // Breadcrumbs

    $scope.breadcrumbsNavitate = function(selectedItem) {
      var item;
      do {
        graph.breadcrumbs.pop();
        item = graph.breadcrumbs.slice(-1)[0];
      }
      while (selectedItem != item);
      loadSelectedGraph();
    }

    $scope.breadcrumbsBack = function() {
      graph.breadcrumbs.pop();
      loadSelectedGraph();
    }

    function loadSelectedGraph() {
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
