'use strict';

angular.module('icestudio')
  .controller('DesignCtrl', function ($rootScope,
                                      $scope,
                                      project,
                                      boards,
                                      graph,
                                      gettextCatalog) {

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
        // TODO: back compat
        graph.loadDesign(project.project.design);
        graph.appEnable(true);
      }
      else {
        var disabled = true;
        var p = project.project;
        for (var i = 1; i < graph.breadcrumbs.length; i++) {
          if (p.design && p.design.deps) {
            p = p.design.deps[graph.breadcrumbs[i].name];
          }
          else if (p.deps) {
            p = p.deps[graph.breadcrumbs[i].name];
          }
        }
        if (p.design) {
          graph.loadDesign(p.design, disabled);
        }
        else if (p.deps) {
          graph.loadDesign(p.deps, disabled);
        }
        graph.appEnable(false);
      }
    }

    $rootScope.$on('refreshProject', function(event, callback) {
      project.update(callback);
    });

  });
