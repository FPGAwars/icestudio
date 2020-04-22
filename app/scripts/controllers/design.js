'use strict';

var subModuleActive = false;

angular.module('icestudio')
        .controller('DesignCtrl', function ($rootScope,
                $scope,
                project,
                profile,
                graph,
                gettextCatalog,
                utils,
                common) {

                $scope.graph = graph;
                $scope.common = common;
                $scope.profile = profile;
                $scope.information = {};
                $scope.topModule = true;
                $scope.isNavigating = false;
                $scope.backup = {};
                $scope.toRestore = false;
                // Intialization
                graph.createPaper($('.paper'));

                // Breadcrumbs

                $scope.breadcrumbsNavitate = function (selectedItem) {
                        var item;
                        if (common.isEditingSubmodule) {
                                alertify.warning(gettextCatalog.getString('To navigate through design, you need to close "edit mode".'));
                        } else {
                                if (!$scope.isNavigating) {
                                        $scope.isNavigating = true;

                                        do {
                                                graph.breadcrumbs.pop();
                                                item = graph.breadcrumbs.slice(-1)[0];
                                        }
                                        while (selectedItem !== item);
                                        loadSelectedGraph();
                                }

                        }
                };

                $scope.breadcrumbsBack = function () {
                        if (!$scope.isNavigating) {
                                $scope.isNavigating = true;
                                graph.breadcrumbs.pop();
                                loadSelectedGraph();
                        }
                };

                $scope.editModeToggle = function ($event) {

                        var btn = $event.currentTarget;

                        if (!$scope.isNavigating) {
                                var block = graph.breadcrumbs[graph.breadcrumbs.length - 1];
                                var tmp = false;
                                var rw = true;
                                var lockImg = false;
                                var lockImgSrc = false;
                                if (common.isEditingSubmodule) {
                                        lockImg = $('img', btn);
                                        lockImgSrc = lockImg.attr('data-lock');
                                        lockImg[0].src = lockImgSrc;
                                        common.isEditingSubmodule = false;
                                        subModuleActive = false;
                                        var cells = $scope.graph.getCells();


                                        // Sort Constant/Memory cells by x-coordinate
                                        cells = _.sortBy(cells, function (cell) {
                                                if (cell.get('type') === 'ice.Constant' ||
                                                        cell.get('type') === 'ice.Memory') {
                                                        return cell.get('position').x;
                                                }
                                        });
                                        // Sort I/O cells by y-coordinate
                                        cells = _.sortBy(cells, function (cell) {
                                                if (cell.get('type') === 'ice.Input' ||
                                                        cell.get('type') === 'ice.Output') {
                                                        return cell.get('position').y;
                                                }
                                        });
                                        $scope.graph.setCells(cells);

                                        var graphData = $scope.graph.toJSON();
                                        var p = utils.cellsToProject(graphData.cells);
                                        tmp = utils.clone(common.allDependencies[block.type]);
                                        tmp.design.graph = p.design.graph;
                                        /*var hId = utils.dependencyID(tmp);*/

                                        var hId = block.type;
                                        common.allDependencies[hId] = tmp;
                                        $scope.toRestore = hId;

                                        common.forceBack = true;
                                } else {
                                        lockImg = $('img', btn);
                                        lockImgSrc = lockImg.attr('data-unlock');
                                        lockImg[0].src = lockImgSrc;
                                        tmp = common.allDependencies[block.type];
                                        $scope.toRestore = false;
                                        rw = false;
                                        common.isEditingSubmodule = true;
                                        subModuleActive = true;

                                }

                                $rootScope.$broadcast('navigateProject', {
                                        update: false,
                                        project: tmp,
                                        editMode: rw
                                });
                                utils.rootScopeSafeApply();

                        }
                };


                function loadSelectedGraph() {

                        var n = graph.breadcrumbs.length;
                        var opt = { disabled: true };
                        var design = false;
                        var i = 0;
                        if (n === 1) {

                                design = project.get('design');
                                opt.disabled = false;
                                if ($scope.toRestore !== false && common.submoduleId !== false && design.graph.blocks.length > 0) {
                                        for (i = 0; i < design.graph.blocks.length; i++) {
                                                if (common.submoduleUID === design.graph.blocks[i].id) {
                                                        design.graph.blocks[i].type = $scope.toRestore;
                                                }
                                        }

                                        $scope.toRestore = false;
                                }


                                graph.resetView();
                                graph.loadDesign(design, opt, function () {
                                        $scope.isNavigating = false;
                                        graph.fitContent();
                                });
                                $scope.topModule = true;
                        }
                        else {
                                var type = graph.breadcrumbs[n - 1].type;
                                var dependency = common.allDependencies[type];
                                design = dependency.design;
                                if ($scope.toRestore !== false && common.submoduleId !== false && design.graph.blocks.length > 0) {
                                        //toRestoreLn=$scope.toRestore;
                                        for (i = 0; i < design.graph.blocks.length; i++) {
                                                if (common.submoduleUID === design.graph.blocks[i].id) {
                                                        common.allDependencies[type].design.graph.blocks[i].type = $scope.toRestore;
                                                }
                                        }
                                        $scope.toRestore = false;
                                }

                                //                               graph.fitContent();
                                graph.resetView();
                                graph.loadDesign(dependency.design, opt, function () {
                                        graph.fitContent();
                                        $scope.isNavigating = false;

                                });
                                $scope.information = dependency.package;
                        }
                }

                $rootScope.$on('navigateProject', function (event, args) {

                        var opt = { disabled: true };
                        if (typeof args.submodule !== 'undefined') {

                                common.submoduleId = args.submodule;

                        }
                        if (typeof args.submoduleId !== 'undefined') {

                                common.submoduleUID = args.submoduleId;

                        }
                        if (typeof args.editMode !== 'undefined') {

                                opt.disabled = args.editMode;
                        }

                        if (args.update) {
                                // Update the main project
                                //        graph.fitContent();

                                graph.resetView();
                                project.update({ deps: false }, function () {
                                        graph.loadDesign(args.project.design, opt, function () {
                                                graph.fitContent();
                                        });

                                });

                        }
                        else {
                                //        graph.fitContent();
                                //  utils.rootScopeSafeApply();

                                graph.resetView();

                                graph.loadDesign(args.project.design, opt, function () {
                                        graph.fitContent();
                                });
                        }
                        $scope.topModule = false;
                        $scope.information = args.project.package;
                        //utils.rootScopeSafeApply();
                        if (typeof common.forceBack !== 'undefined' && common.forceBack === true) {
                                common.forceBack = false;
                                $scope.breadcrumbsBack();
                        }

                });

                $rootScope.$on('breadcrumbsBack', function (/*event*/) {
                        $scope.breadcrumbsBack();
                        utils.rootScopeSafeApply();
                });

                $rootScope.$on('editModeToggle', function (event) {
                        $scope.editModeToggle(event);
                        utils.rootScopeSafeApply();

                });

        });