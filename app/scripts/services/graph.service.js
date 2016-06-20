'use strict';

angular.module('icestudio')
    .service('graph', ['joint', 'common',
      function(joint, common) {

        // Variables

        this.paper = null;
        this.selectedCell = null;

        this.graph = new joint.dia.Graph();

        // Functions

        this.createPaper = function(element) {
          this.paper = new joint.dia.Paper({
            el: element,
            width: 900,
            height: 443,
            model: this.graph,
            gridSize: 1,
            snapLinks: { radius: 30 },
            defaultLink: new joint.shapes.ice.Wire(),
            validateConnection: function(cellViewS, magnetS,
                                         cellViewT, magnetT,
                                         end, linkView) {
              // Prevent loop linking
              return (magnetS !== magnetT);
            }
          });

          // Events
          this.paper.on('cell:pointerclick',
            function(cellView, evt, x, y) {
              if (this.paper.options.interactive) {
                if (this.selectedCell) {
                  V(paper.findViewByModel(this.selectedCell).el).removeClass('highlighted');
                }
                this.selectedCell = cellView.model;
                V(paper.findViewByModel(this.selectedCell).el).addClass('highlighted');
              }
            }
          );

          this.paper.on('cell:pointerdblclick',
            function(cellView, evt, x, y) {
              var data = cellView.model.attributes;
              if (data.blockType == 'basic.input' || data.blockType == 'basic.output') {
                if (paper.options.interactive) {
                  alertify.prompt('Insert the block label', '',
                    function(evt, label) {
                      if (label) {
                        data.attrs['.block-label'].text = label;
                        cellView.update();
                        alertify.success('Label updated');
                      }
                  });
                }
              }
              else {
                if (data.block.code.type == 'graph') {
                  common.breadcrumb.push({ type: data.blockType, name: data.block.name });
                  if (common.breadcrumb.length == 2) {
                    refreshProject(function() {
                      loadGraph(data.block, false, false);
                    }, true);
                  }
                  else {
                    loadGraph(data.block, false, false);
                  }
                }
                else if (data.block.code.type == 'verilog') {
                  var code = hljs.highlightAuto(data.block.code.data).value;
                  alertify.alert('<pre><code class="verilog">' + code + '</code></pre>');
                }
              }
            }
          );

          this.paper.on('blank:pointerclick',
            function() {
              if (paper.options.interactive) {
                if (this.selectedCell) {
                  V(paper.findViewByModel(this.selectedCell).el).removeClass('highlighted');
                }
              }
            }
          );
        }

        this.clearAll = function() {
          this.graph.clear();
          delete this.selectedCell;
          paperEnable(true);
          //refreshProject();
        }

        function paperEnable(value) {
          if (paper && paper.options) {
            paper.options.interactive = value;
            if (value) {
              angular.element('#paper').css('opacity', '1.0');
            }
            else {
              angular.element('#paper').css('opacity', '0.5');
            }
          }
        }

    }]);
