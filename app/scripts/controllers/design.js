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
      var n = graph.breadcrumbs.length;
      if (n === 1) {
        var design = project.get('design');
        graph.loadDesign(design, false);
      }
      else {
        var dependencies = project.get('dependencies');
        var type = graph.breadcrumbs[n-1].type;
        graph.loadDesign(dependencies[type].design, true);
      }
    }

    $rootScope.$on('updateProject', function(event, callback) {
      project.update(callback);
    });

  });
