'use strict';

angular.module('icestudio')
  .directive('menutree', function () {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        data: '=',
        callback: '&'
      },
      template: '<ul uib-dropdown-menu ng-show="data.length > 0">' +
                  '<child ng-repeat="child in data" child="child" callback="click(path)""></child>' +
                '</ul>',
      link: function (scope/*, element, attrs*/) {
        scope.click = function(path) {
          scope.callback({ path: path });
        };
      }
    };
  })
  .directive('child', function ($compile) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        child: '=',
        callback: '&'
      },
      template: '<li ng-class="child.children ? \'dropdown-submenu\' : \'\'">' +
                  '<a href ng-click="click(child.path)" ng-if="!child.children">{{ child.name }}</a>' +
                  '<a href uib-dropdown-toggle ng-if="child.children">{{ child.name }}</a>' +
                '</li>',
      link: function (scope, element/*, attrs*/) {
        scope.click = function(path) {
          scope.callback({ path: path });
        };
        if (angular.isArray(scope.child.children)) {
          element.append('<menutree data="child.children"></menutree>');
          $compile(element.contents())(scope);
        }
      }
    };
  });
