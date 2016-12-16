'use strict';

angular.module('icestudio')
  .controller('DesignCtrl', function ($rootScope,
                                      $scope,
                                      project,
                                      boards,
                                      graph) {

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
      while (selectedItem !== item);
      loadSelectedGraph();
    };

    $scope.breadcrumbsBack = function() {
      graph.breadcrumbs.pop();
      loadSelectedGraph();
    };

    function loadSelectedGraph() {
      if (graph.breadcrumbs.length === 1) {
        graph.loadDesign(project.project.design, false);
      }
      else {
        var p = project.project;
        for (var i = 1; i < graph.breadcrumbs.length; i++) {
          if (p.design && p.design.deps) {
            p = p.design.deps[graph.breadcrumbs[i].name];
          }
        }
        graph.loadDesign(p.design, true);
      }
    }

    $rootScope.$on('updateProject', function(event, callback) {
      project.update(callback);
    });

  });
