'use strict';

angular.module('icestudio')
  .directive('menuboard', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        type: '=',
        board: '='
      },
      template: '<a href ng-click="selectBoard(board)" ng-if="board.type == type">\
                   {{ board.info.label }}&ensp;\
                   <span ng-show="common.selectedBoard.name == board.name" class="glyphicon glyphicon-ok-circle"></span>\
                 </a>'
    };
  });
