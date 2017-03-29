'use strict';

angular.module('icestudio')
  .directive('menutree', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        data: '=',
        right: '=',
        callback: '&'
      },
      template: '<ul uib-dropdown-menu ng-show="data.length > 0">' +
                  '<child ng-repeat="child in data" child="child" callback="click(path)" right="right"></child>' +
                '</ul>',
      link: function(scope/*, element, attrs*/) {
        scope.click = function(path) {
          scope.callback({ path: path });
        };
      }
    };
  })
  .directive('child', function($compile) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        child: '=',
        right: '=',
        callback: '&'
      },
      template: '<li ng-class="child.children ? (right ? \'dropdown-submenu-right\' : \'dropdown-submenu\') : \'\'" uib-dropdown>' +
                  '<a href ng-click="click(child.path)" ng-if="!child.children">{{ child.name | translate }}</a>' +
                  '<a href uib-dropdown-toggle ng-if="child.children">{{ child.name | translate }}</a>' +
                '</li>',
      link: function(scope, element/*, attrs*/) {
        scope.click = function(path) {
          scope.callback({ path: path });
        };
        if (angular.isArray(scope.child.children)) {
          element.append('<menutree data="child.children" callback="click(path)" right="right"></menutree>');
          $compile(element.contents())(scope);
        }
      }
    };
  });
