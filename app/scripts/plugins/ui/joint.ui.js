/*! JointJS+ - Set of JointJS compatible plugins

Copyright (c) 2013 client IO

Adapted to Icestudio Project. 2016

This Source Code Form is subject to the terms of the JointJS+ License
, v. 1.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at http://jointjs.com/license/jointjs_plus_v1.txt
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/


'use strict';

joint.ui.SelectionView = Backbone.View.extend({

  className: 'selectionarea',

  events: {

    'mousedown .selection-box': 'startTranslatingSelection'
  },

  initialize: function(options) {

    _.bindAll(this, 'startSelecting', 'stopSelecting', 'adjustSelection');

    $(document.body).on('mouseup touchend', this.stopSelecting);
    $(document.body).on('mousemove touchmove', this.adjustSelection);

    this.options = options;

    this.options.paper.$el.append(this.$el);
  },

  startTranslatingSelection: function(evt) {

    this._action = 'translating';

    this.options.graph.trigger('batch:start');

    var snappedClientCoords = this.options.paper.snapToGrid(g.point(evt.clientX, evt.clientY));
    this._snappedClientX = snappedClientCoords.x;
    this._snappedClientY = snappedClientCoords.y;

    this.trigger('selection-box:pointerdown', evt);

    evt.stopPropagation();
  },

  isTranslating: function() {

    return this._action === 'translating';
  },

  startSelecting: function(evt/*, x, y*/) {

    this.$el.removeClass('selected');
    this.$el.empty();
    this.model.reset([]);

    this._action = 'selecting';

    this._clientX = evt.clientX;
    this._clientY = evt.clientY;

    // Normalize `evt.offsetX`/`evt.offsetY` for browsers that don't support it (Firefox).
    var paperElement = evt.target.parentElement || evt.target.parentNode;
    var paperOffset = $(paperElement).offset();
    var paperScrollLeft = paperElement.scrollLeft;
    var paperScrollTop = paperElement.scrollTop;

    this._offsetX = evt.offsetX === undefined ? evt.clientX - paperOffset.left + window.pageXOffset + paperScrollLeft : evt.offsetX;
    this._offsetY = evt.offsetY === undefined ? evt.clientY - paperOffset.top + window.pageYOffset + paperScrollTop : evt.offsetY;

    this.$el.css({
      width: 1,
      height: 1,
      left: this._offsetX,
      top: this._offsetY

    }).show();
  },

  adjustSelection: function(evt) {

    var dx;
    var dy;

    switch (this._action) {

      case 'selecting':

        dx = evt.clientX - this._clientX;
        dy = evt.clientY - this._clientY;

        var left = parseInt(this.$el.css('left'), 10);
        var top = parseInt(this.$el.css('top'), 10);

        this.$el.css({
          left: dx < 0 ? this._offsetX + dx : left,
          top: dy < 0 ? this._offsetY + dy : top,
          width: Math.abs(dx),
          height: Math.abs(dy)
        });
        break;

      case 'translating':

        var snappedClientCoords = this.options.paper.snapToGrid(g.point(evt.clientX, evt.clientY));
        var snappedClientX = snappedClientCoords.x;
        var snappedClientY = snappedClientCoords.y;

        dx = snappedClientX - this._snappedClientX;
        dy = snappedClientY - this._snappedClientY;

        // This hash of flags makes sure we're not adjusting vertices of one link twice.
        // This could happen as one link can be an inbound link of one element in the selection
        // and outbound link of another at the same time.
        var processedLinks = {};

        this.model.each(function(element) {

          // TODO: snap to grid.

          // Translate the element itself.
          element.translate(dx, dy);

          // Translate also the `selection-box` of the element.
          this.updateBox(element);

          // Translate link vertices as well.
          var connectedLinks = this.options.graph.getConnectedLinks(element);

          _.each(connectedLinks, function(link) {

            if (processedLinks[link.id]) {
              return;
            }

            var vertices = link.get('vertices');
            if (vertices && vertices.length) {

              var newVertices = [];
              _.each(vertices, function(vertex) {

                newVertices.push({ x: vertex.x + dx, y: vertex.y + dy });
              });

              link.set('vertices', newVertices);
            }

            processedLinks[link.id] = true;
          });

        }, this);

        if (dx || dy) {

      		this._snappedClientX = snappedClientX;
      		this._snappedClientY = snappedClientY;
      	}

        break;
    }
  },

  stopSelecting: function() {

    switch (this._action) {

      case 'selecting':

        var offset = this.$el.offset();
        var width = this.$el.width();
        var height = this.$el.height();

        // Convert offset coordinates to the local point of the <svg> root element.
        var localPoint = V(this.options.paper.svg).toLocalPoint(offset.left, offset.top);

        // Take page scroll into consideration.
        localPoint.x -= window.pageXOffset;
        localPoint.y -= window.pageYOffset;

        var elementViews = this.options.paper.findViewsInArea(
          g.rect(
            (localPoint.x - this.options.state.pan.x) / this.options.state.zoom,
            (localPoint.y - this.options.state.pan.y) / this.options.state.zoom,
            width / this.options.state.zoom,
            height / this.options.state.zoom
        ));

        if (elementViews.length) {

          // Create a `selection-box` `<div>` for each element covering its bounding box area.
          _.each(elementViews, this.createSelectionBox, this);

          // The root element of the selection switches `position` to `static` when `selected`. This
          // is neccessary in order for the `selection-box` coordinates to be relative to the
          // `paper` element, not the `selection` `<div>`.
          this.$el.addClass('selected');

        } else {

          // Hide the selection box if there was no element found in the area covered by the
          // selection box.
          this.$el.hide();
        }

        this.model.reset(_.pluck(elementViews, 'model'));
        break;

      case 'translating':

        this.options.graph.trigger('batch:stop');
        // Everything else is done during the translation.
        break;

      case 'cherry-picking':
        // noop;  All is done in the `createSelectionBox()` function.
        // This is here to avoid removing selection boxes as a reaction on mouseup event and
        // propagating to the `default` branch in this switch.
        break;

    default:
        // Hide selection if the user clicked somehwere else in the document.
        // this.$el.hide().empty();
        // this.model.reset([]);
        break;
    }

    delete this._action;
  },

  cancelSelection: function() {

    this.$('.selection-box').remove();
    this.$el.hide().removeClass('selected');
    this.model.reset([]);
  },

  destroySelectionBox: function(elementView) {

    this.$('[data-model="' + elementView.model.get('id') + '"]').remove();
    if (this.$('.selection-box').length === 0) {

      this.$el.hide().removeClass('selected');
    }
  },

  createSelectionBox: function(elementView) {

    var element = elementView.model;

    if (!element.isLink()) {

      var $selectionBox = $('<div/>', {
          'class': 'selection-box',
          'data-model': element.get('id')
      });
      this.$el.append($selectionBox);

      this.updateBox(element);

      this.$el.addClass('selected').show();

      this._action = 'cherry-picking';
    }
  },

  updateBox: function(element) {

    var border = 12;

    var bbox = element.getBBox();
    var state = this.options.state;

    $('div[data-model=\'' + element.get('id') + '\']').css({
      left: bbox.x * state.zoom + state.pan.x +
            bbox.width / 2.0 * (state.zoom - 1) - border / 2,
      top: bbox.y * state.zoom + state.pan.y +
           bbox.height / 2.0 * (state.zoom - 1) - border / 2,
      width: bbox.width + border,
      height: bbox.height + border,
      transform: 'scale(' + state.zoom + ')'
    });
  }

});
