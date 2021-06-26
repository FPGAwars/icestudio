/*
Copyright (c) 2016-2019 FPGAwars
Copyright (c) 2013 client IO
*/


'use strict';

joint.ui.SelectionView = Backbone.View.extend({

  className: 'selection',

  events: {

    'click .selection-box': 'click',
    'dblclick': 'dblclick',
    'mousedown .selection-box': 'startTranslatingSelection',
    'mouseover': 'mouseover',
    'mouseout': 'mouseout',
    'mouseup': 'mouseup',
    'mousedown': 'mousedown'
  },

  showtooltip: true,
  $selectionArea: null,

  initialize: function (options) {

    _.bindAll(this, 'click', 'startSelecting', 'stopSelecting', 'adjustSelection');

    $(document.body).on('mouseup touchend', function (evt) {
      if (evt.which === 1) {
        // Mouse left button
        this.stopSelecting(evt);

      }
    }.bind(this));
    $(document.body).on('mousemove touchmove', this.adjustSelection);

    this.options = options;

    this.options.paper.$el.append(this.$el);
    this.$el.addClass('selected').show();
  },

  click: function (evt) {

    if (evt.which === 1) {
      // Mouse left button
      this.trigger('selection-box:pointerclick', evt);
    }
  },

  dblclick: function (evt) {


    var id = evt.target.getAttribute('data-model');
    if (id) {
      var view = this.options.paper.findViewByModel(id);
      if (view) {
        // Trigger dblclick in selection to the Cell View
        view.notify('cell:pointerdblclick', evt);
      }
    }
  },


  mouseover: function (evt) {

    this.mouseManager(evt, 'mouseovercard');
  },

  mouseout: function (evt) {

    this.mouseManager(evt, 'mouseoutcard');
  },

  mouseup: function (evt) {

    this.mouseManager(evt, 'mouseupcard');
  },

  mousedown: function (evt) {

    if (!this.showtooltip && evt.which === 1) {
      // Mouse left button: block fixed
      this.showtooltip = true;
    }

    this.mouseManager(evt, 'mousedowncard');
  },

  mouseManager: function (evt, fnc) {

    evt.preventDefault();

    if (this.showtooltip) {
      var id = evt.target.getAttribute('data-model');
      if (id) {
        var view = this.options.paper.findViewByModel(id);
        if (view && view[fnc]) {
          view[fnc].apply(view, [evt]);
        }
      }
    }
  },

  startTranslatingSelection: function (evt) {

    if (this._action !== 'adding' && evt.which === 1) {
      // Mouse left button

      if (!evt.shiftKey) {
        this._action = 'translating';

        this.options.graph.trigger('batch:stop');
        this.options.graph.trigger('batch:start');

        var snappedClientCoords = this.options.paper.snapToGrid(g.point(evt.clientX, evt.clientY));
        this._snappedClientX = snappedClientCoords.x;
        this._snappedClientY = snappedClientCoords.y;

        this.trigger('selection-box:pointerdown', evt);
      }
    }
  },

  startAddingSelection: function (evt) {

    this._action = 'adding';

    var snappedClientCoords = this.options.paper.snapToGrid(g.point(evt.clientX, evt.clientY));
    this._snappedClientX = snappedClientCoords.x;
    this._snappedClientY = snappedClientCoords.y;

    this.trigger('selection-box:pointerdown', evt);
  },

  startSelecting: function (evt/*, x, y*/) {

    this.createSelectionArea();

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

    this.$selectionArea.css({
      width: 1,
      height: 1,
      left: this._offsetX,
      top: this._offsetY
    });
  },

  adjustSelection: function (evt) {

    var dx;
    var dy;

    switch (this._action) {

      case 'selecting':

        dx = evt.clientX - this._clientX;
        dy = evt.clientY - this._clientY;

        var left = parseInt(this.$selectionArea.css('left'), 10);
        var top = parseInt(this.$selectionArea.css('top'), 10);

        this.$selectionArea.css({
          left: dx < 0 ? this._offsetX + dx : left,
          top: dy < 0 ? this._offsetY + dy : top,
          width: Math.abs(dx),
          height: Math.abs(dy)
        });
        break;

      case 'adding':
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

        this.model.each(function (element) {

          // Translate the element itself.
          element.translate(dx, dy);

          // Translate also the `selection-box` of the element.
          this.updateBox(element);

          // Translate link vertices as well.
          var connectedLinks = this.options.graph.getConnectedLinks(element);

          _.each(connectedLinks, function (link) {

            if (processedLinks[link.id]) {
              return;
            }

            var vertices = link.get('vertices');
            if (vertices && vertices.length) {

              var newVertices = [];
              _.each(vertices, function (vertex) {

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

        this.trigger('selection-box:pointermove', evt);

        break;
    }
  },

  stopSelecting: function (evt) {

    switch (this._action) {

      case 'selecting':

        if (!evt.shiftKey) {
          // Reset previous selection
          this.cancelSelection();
        }

        var offset = this.$selectionArea.offset();
        var width = this.$selectionArea.width();
        var height = this.$selectionArea.height();

        // Convert offset coordinates to the local point of the <svg> root element.
        var localPoint = V(this.options.paper.svg).toLocalPoint(offset.left, offset.top);

        // Take page scroll into consideration.
        localPoint.x -= window.pageXOffset;
        localPoint.y -= window.pageYOffset;

        var elementViews = this.findBlocksInArea(
          g.rect(localPoint.x, localPoint.y, width, height),
          { strict: false });

        this.model.add(_.pluck(elementViews, 'model'));

        _.each(this.model.models, this.createSelectionBox, this);

        this.destroySelectionArea();

        break;

      case 'translating':

        this.options.graph.trigger('batch:stop');
        // Everything else is done during the translation.
        break;

      case 'adding':
        break;

      case 'cherry-picking':
        // noop;  All is done in the `createSelectionBox()` function.
        // This is here to avoid removing selection boxes as a reaction on mouseup event and
        // propagating to the `default` branch in this switch.
        break;

      default:
        break;
    }

    delete this._action;
  },

  findBlocksInArea: function (rect, opt) {

    opt = _.defaults(opt || {}, { strict: false });
    rect = g.rect(rect);

    var paper = this.options.paper;
    var views = _.map(paper.model.getElements(), paper.findViewByModel, paper);
    var method = opt.strict ? 'containsRect' : 'intersect';

    return _.filter(views, function (view) {
      var $box = $(view.$box[0]);
      var position = $box.position();
      var rbox = g.rect(position.left, position.top, $box.width(), $box.height());
      return view && rect[method](rbox);
    }, this);
  },

  cancelSelection: function () {

    this.$('.selection-box').remove();
    this.model.reset([]);
  },

  destroySelectionArea: function () {

    this.$selectionArea.remove();
    this.$selectionArea = this.$('.selection-area');
    this.$el.addClass('selected');
  },

  createSelectionArea: function () {

    var $selectionArea = $('<div/>', {
      'class': 'selection-area'
    });
    this.$el.append($selectionArea);
    this.$selectionArea = this.$('.selection-area');
    this.$el.removeClass('selected');
  },

  destroySelectionBox: function (element) {

    this.$('[data-model="' + element.get('id') + '"]').remove();
  },

  createSelectionBox: function (element, opt) {

    opt = opt || {};

    if (!element.isLink()) {

      var $selectionBox = $('<div/>', {
        'class': 'selection-box',
        'data-model': element.get('id')
      });
      if (this.$('[data-model="' + element.get('id') + '"]').length === 0) {
        this.$el.append($selectionBox);
      }
      this.showtooltip = (opt.initooltip !== undefined) ? opt.initooltip : true;
      $selectionBox.css({ opacity: (opt.transparent ? 0 : 1) });

      this.updateBox(element);

      this._action = 'cherry-picking';
    }
  },

  updateBox: function (element) {


    var bbox = element.getBBox();
    var state = this.options.state;



    var i, pendingTasks = [];
    var sels = document.querySelectorAll('div[data-model="' + element.get('id') + '"]');
    for (i = 0; i < sels.length; i++) {
      pendingTasks.push({
        e: sels[i], property: 'left', value: Math.round(
          ((bbox.x) * state.zoom + state.pan.x) +
          (bbox.width / 2.0 * (state.zoom - 1))
        ) + 'px'
      });
      pendingTasks.push({
        e: sels[i], property: 'top', value: Math.round(
          (bbox.y * state.zoom + state.pan.y) +
          (bbox.height / 2.0 * (state.zoom - 1))

        ) + 'px'
      });
      pendingTasks.push({ e: sels[i], property: 'width', value: Math.round(bbox.width) + 'px' });
      pendingTasks.push({ e: sels[i], property: 'height', value: Math.round(bbox.height) + 'px' });
      pendingTasks.push({ e: sels[i], property: 'transform', value: 'scale(' + state.zoom + ')' });


    }
    i = pendingTasks.length;
    for (i = 0; i < pendingTasks.length; i++) {
      if (pendingTasks[i].e !== null) {

        pendingTasks[i].e.style[pendingTasks[i].property] = pendingTasks[i].value;
      }
    }

  }

});
