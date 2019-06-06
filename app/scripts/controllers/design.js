'use strict';

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
    $scope.backup={};
    // Intialization

    graph.createPaper($('.paper'));

    // Breadcrumbs

    $scope.breadcrumbsNavitate = function(selectedItem) {
      var item;
      if(common.isEditingSubmodule){
          alert('Debes salir del modo de edición');
      }else{
      if (!$scope.isNavigating ) {
        $scope.isNavigating = true;

        do {
          graph.breadcrumbs.pop();
          item = graph.breadcrumbs.slice(-1)[0];
           console.log('BACK',selectedItem,item);
        }
        while (selectedItem !== item);
        loadSelectedGraph();
      }

    }
    };

    $scope.breadcrumbsBack = function() {
      if (!$scope.isNavigating) {
        $scope.isNavigating = true;
        graph.breadcrumbs.pop();
        loadSelectedGraph();
      }
    };
 /*   function copyObj(src) {
          return Object.assign({}, src);
    }*/
    function copyObj(src) {
  let target = {};
  for (let prop in src) {
    if (src.hasOwnProperty(prop)) {
      target[prop] = src[prop];
    }
  }
  return target;
}

    $scope.editModeToggle = function() {

      if (!$scope.isNavigating) {
          console.log('T1-------');
           var block=graph.breadcrumbs[graph.breadcrumbs.length-1];
          var tmp = false;
           var rw=true;
          if(common.isEditingSubmodule){

          console.log('T2-------');
                  common.isEditingSubmodule=false;

                  tmp = common.allDependencies[block.type];
          }else{
          //+M

          console.log('31-------');
                tmp = common.allDependencies[block.type];
                  rw=false;
                  common.isEditingSubmodule=true;
          }

          console.log('T4-------');
        $rootScope.$broadcast('navigateProject', {
                  update: false,
                  project: tmp,
                    editMode:rw
            });
        utils.rootScopeSafeApply();
      }
    };


    function loadSelectedGraph() {
      var n = graph.breadcrumbs.length;
      var opt = { disabled: true };
         if (n === 1) {
          console.log('UNO');
        var design = project.get('design');
        opt.disabled = false;
        console.log(design);
        graph.loadDesign(design, opt, function() {
          $scope.isNavigating = false;
        });
        $scope.topModule = true;
      }
      else {

          console.log('DOS');
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

                if(typeof args.editMode !== 'undefined'){;
            opt.disabled=args.editMode;
        }

        if (args.update) {
        // Update the main project
        //M+
      console.log('LOADDESIGN',args.project.design);
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

    $rootScope.$on('editModeToggle', function(/*event*/) {
        $scope.editModeToggle();
        utils.rootScopeSafeApply();
    });


  });
