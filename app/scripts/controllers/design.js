'use strict';

angular.module('icestudio')
  .controller('DesignCtrl', function ($rootScope,
                                      $scope,
                                      project,
                                      graph,
                                      utils,
                                      common) {

    $scope.common = common;
    $scope.graph = graph;
    $scope.information = {};

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
        var type = graph.breadcrumbs[n-1].type;
        var dependency = common.allDependencies[type];
        graph.loadDesign(dependency.design, true);
        $scope.information = dependency.package;
      }
    }

    $rootScope.$on('navigateProject', function(event, args) {
      if (args.update) {
        // Update the main project
        project.update({ deps: false }, function() {
          graph.loadDesign(args.project.design, true);
        });
      }
      else {
        graph.loadDesign(args.project.design, true);
      }
      $scope.information = args.project.package;
      utils.rootScopeSafeApply();
    });

    $rootScope.$on('breadcrumbsBack', function(/*event*/) {
      $scope.breadcrumbsBack();
      utils.rootScopeSafeApply();
    });

  });
