'use strict';

// Value of event.which on a middle click
const MIDDLE_CLICK_EVENT = 2;

angular.module('icestudio')
  .controller('DesignCtrl', function ($rootScope,
                                      $scope,
                                      project,
                                      profile,
                                      graph,
                                      utils,
                                      common) {

    $scope.graph = graph;
    $scope.common = common;
    $scope.profile = profile;
    $scope.information = {};
    $scope.topModule = true;
    $scope.isNavigating = false;

    // Intialization

    graph.createPaper($('.paper'));

    // Allow panning using middle click and drag

    // Middle click panning management
    var middleClickDown = false;
    var startX, startY;
    var startPan;

    $(document).on('mousemove', '.paper', function(event) {
      if (middleClickDown) {
        // Calculate the mouse movement since the beginning of the move
        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        // Add the deltas to the startPan to get the new pan
        const newPan = {
          x: startPan.x + deltaX,
          y: startPan.y + deltaY,
        };
        // Apply the pan.
        graph.panAndZoom.pan(newPan);
      }
    });

    $(document).on('mousedown', '.paper', function(event) {
      if (event.which === MIDDLE_CLICK_EVENT) {
        middleClickDown = true;
        // Get the current pan
        startPan = graph.getState().pan;
        // Get the mouse position
        startX = event.clientX;
        startY = event.clientY;
      }
    });
    $(document).on('mouseup', '.paper', function() {
      if (event.which === MIDDLE_CLICK_EVENT) {
        middleClickDown = false;
      }
    });

    // Breadcrumbs

    $scope.breadcrumbsNavitate = function(selectedItem) {
      var item;
      if (!$scope.isNavigating) {
        $scope.isNavigating = true;
        do {
          graph.breadcrumbs.pop();
          item = graph.breadcrumbs.slice(-1)[0];
        }
        while (selectedItem !== item);
        loadSelectedGraph();
      }
    };

    $scope.breadcrumbsBack = function() {
      if (!$scope.isNavigating) {
        $scope.isNavigating = true;
        graph.breadcrumbs.pop();
        loadSelectedGraph();
      }
    };

    function loadSelectedGraph() {
      var n = graph.breadcrumbs.length;
      var opt = { disabled: true };
      if (n === 1) {
        var design = project.get('design');
        opt.disabled = false;
        graph.loadDesign(design, opt, function() {
          $scope.isNavigating = false;
        });
        $scope.topModule = true;
      }
      else {
        var type = graph.breadcrumbs[n-1].type;
        var dependency = common.allDependencies[type];
        graph.loadDesign(dependency.design, opt, function() {
          graph.fitContent();
          $scope.isNavigating = false;
        });
        $scope.information = dependency.package;
      }
    }

    $rootScope.$on('navigateProject', function(event, args) {
      var opt = { disabled: true };
      if (args.update) {
        // Update the main project
        project.update({ deps: false }, function() {
          graph.loadDesign(args.project.design, opt, function() {
            graph.fitContent();
          });
        });
      }
      else {
        graph.loadDesign(args.project.design, opt, function() {
          graph.fitContent();
        });
      }
      $scope.topModule = false;
      $scope.information = args.project.package;
      utils.rootScopeSafeApply();
    });

    $rootScope.$on('breadcrumbsBack', function(/*event*/) {
      $scope.breadcrumbsBack();
      utils.rootScopeSafeApply();
    });

  });
