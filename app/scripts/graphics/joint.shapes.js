'use strict';

var os = require('os');
var sha1 = require('sha1');
var marked = require('marked');
var openurl = require('openurl');
var emoji = require('node-emoji');

const WIRE_WIDTH = 1.5;
const DARWIN = Boolean(os.platform().indexOf('darwin') > -1);

if (DARWIN) {
  var aceFontSize = '12';
}
else {
  var aceFontSize = '14';
}

// Model element

joint.shapes.ice = {};
joint.shapes.ice.Model = joint.shapes.basic.Generic.extend({

  markup: '<g class="rotatable">\
             <g class="scalable">\
               <rect class="body"/>\
             </g>\
             <g class="leftPorts disable-port"/>\
             <g class="rightPorts"/>\
             <g class="topPorts disable-port"/>\
             <g class="bottomPorts"/>\
           </g>',
  portMarkup: '<g class="port port<%= index %>">\
                 <g class="port-default" id="port-default-<%= id %>-<%= port.id %>">\
                    <path/><rect/>\
                 </g>\
                 <path class="port-wire" id="port-wire-<%= id %>-<%= port.id %>"/>\
                 <text class="port-label"/>\
                 <circle class="port-body"/>\
               </g>',

  defaults: joint.util.deepSupplement({
    type: 'ice.Model',
    size: {
      width: 1,
      height: 1
    },
    leftPorts: [],
    rightPorts: [],
    topPorts: [],
    bottomPorts: [],
    attrs: {
      '.': {
        magnet: false
      },
      '.body': {
        width: 1,
        height: 1,
        stroke: 'none'
      },
      '.port-body': {
        r: 16,
        opacity: 0
      },
      '.leftPorts .port-body': {
        pos: 'left',
        type: 'input',
        magnet: false
      },
      '.rightPorts .port-body': {
        pos: 'right',
        type: 'output',
        magnet: true
      },
      '.topPorts .port-body': {
        pos: 'top',
        type: 'input',
        magnet: false
      },
      '.bottomPorts .port-body': {
        pos: 'bottom',
        type: 'output',
        magnet: true
      },
      '.port-label': {
        fill: '#777'
      },
      '.port-wire': {
        stroke: '#777',
        'stroke-width': WIRE_WIDTH
      },
      '.port-default': {
        display: 'none'
      },
      '.port-default rect': {
        x: '-32',
        y: '-8',
        width: '16',
        height: '16',
        rx: '3',
        ry: '3',
        stroke: '#777',
        'stroke-width': 1,
        fill: '#FBFBC9'
      },
      '.port-default path': {
        d: 'M 0 0 L -20 0',
        stroke: '#777',
        'stroke-width': WIRE_WIDTH
      }

    }
  }, joint.shapes.basic.Generic.prototype.defaults),


  initialize: function () {
    this.updatePortsAttrs();
    this.processPorts();
    this.trigger('process:ports');
    this.on('change:size change:leftPorts change:rightPorts change:topPorts change:bottomPorts', this.updatePortsAttrs, this);
    this.constructor.__super__.constructor.__super__.initialize.apply(this, arguments);
  },

  updatePortsAttrs: function (/*eventName*/) {
    if (this._portSelectors) {
      var newAttrs = _.omit(this.get('attrs'), this._portSelectors);
      this.set('attrs', newAttrs, { silent: true });
    }

    var attrs = {};
    this._portSelectors = [];

    _.each(['left', 'right'], function (type) {
      var port = type + 'Ports';
      _.each(this.get(port), function (portName, index, ports) {
        var portAttributes = this.getPortAttrs(portName, index, ports.length, '.' + port, type, this.get('size').height);
        this._portSelectors = this._portSelectors.concat(_.keys(portAttributes));
        _.extend(attrs, portAttributes);
      }, this);
    }, this);

    _.each(['top', 'bottom'], function (type) {
      var port = type + 'Ports';
      _.each(this.get(port), function (portName, index, ports) {
        var portAttributes = this.getPortAttrs(portName, index, ports.length, '.' + port, type, this.get('size').width);
        this._portSelectors = this._portSelectors.concat(_.keys(portAttributes));
        _.extend(attrs, portAttributes);
      }, this);
    }, this);

    this.attr(attrs, { silent: true });
  },

  getPortAttrs: function (port, index, total, selector, type, length) {

    var attrs = {};
    var gridsize = 8;
    var gridunits = length / gridsize;

    var portClass = 'port' + index;
    var portSelector = selector + '>.' + portClass;
    var portLabelSelector = portSelector + '>.port-label';
    var portWireSelector = portSelector + '>.port-wire';
    var portBodySelector = portSelector + '>.port-body';
    var portDefaultSelector = portSelector + '>.port-default';

    var portColor = (typeof this.attributes.data.blockColor !== 'undefined') ? this.attributes.data.blockColor : 'lime';

    attrs[portSelector] = {
      ref: '.body'
    };

    attrs[portLabelSelector] = {
      text: port.label
    };

    attrs[portWireSelector] = {};

    attrs[portBodySelector] = {
      port: {
        id: port.id,
        type: type,
        fill: portColor
      }
    };



    attrs[portDefaultSelector] = {
      display: (port.default && port.default.apply) ? 'inline' : 'none'
    };

    if ((type === 'leftPorts') || (type === 'topPorts')) {
      attrs[portSelector]['pointer-events'] = 'none';
      attrs[portWireSelector]['pointer-events'] = 'none';
    }

    var offset = (port.size && port.size > 1) ? 4 : 1;
    var position = Math.round((index + 0.5) / total * gridunits) / gridunits;

    switch (type) {
      case 'left':

        attrs[portSelector]['ref-x'] = -8;
        attrs[portSelector]['ref-y'] = position;
        attrs[portLabelSelector]['dx'] = 4;
        attrs[portLabelSelector]['y'] = -5 - offset;
        attrs[portLabelSelector]['text-anchor'] = 'end';
        attrs[portWireSelector]['y'] = position;
        attrs[portWireSelector]['d'] = 'M 0 0 L 8 0';
        break;
      case 'right':
        attrs[portSelector]['ref-dx'] = 8;
        attrs[portSelector]['ref-y'] = position;
        attrs[portLabelSelector]['dx'] = -4;
        attrs[portLabelSelector]['y'] = -5 - offset;
        attrs[portLabelSelector]['text-anchor'] = 'start';
        attrs[portWireSelector]['y'] = position;
        attrs[portWireSelector]['d'] = 'M 0 0 L -8 0';
        break;
      case 'top':
        attrs[portSelector]['ref-y'] = -8;
        attrs[portSelector]['ref-x'] = position;
        attrs[portLabelSelector]['dx'] = -4;
        attrs[portLabelSelector]['y'] = -5 - offset;
        attrs[portLabelSelector]['text-anchor'] = 'start';
        attrs[portLabelSelector]['transform'] = 'rotate(-90)';
        attrs[portWireSelector]['x'] = position;
        attrs[portWireSelector]['d'] = 'M 0 0 L 0 8';
        break;
      case 'bottom':
        attrs[portSelector]['ref-dy'] = 8;
        attrs[portSelector]['ref-x'] = position;
        attrs[portLabelSelector]['dx'] = 4;
        attrs[portLabelSelector]['y'] = -5 - offset;
        attrs[portLabelSelector]['text-anchor'] = 'end';
        attrs[portLabelSelector]['transform'] = 'rotate(-90)';
        attrs[portWireSelector]['x'] = position;
        attrs[portWireSelector]['d'] = 'M 0 0 L 0 -8';
        break;
    }

    return attrs;
  }
});

joint.shapes.ice.ModelView = joint.dia.ElementView.extend({

  template: '',

  initialize: function () {
    _.bindAll(this, 'updateBox');
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    this.$box = $(joint.util.template(this.template)());

    this.model.on('change', this.updateBox, this);
    this.model.on('remove', this.removeBox, this);

    this.updateBox();

    this.listenTo(this.model, 'process:ports', this.update);
  },

  setupResizer: function () {
    // Resizer
    if (!this.model.get('disabled')) {
      this.resizing = false;
      this.resizer = this.$box.find('.resizer');
      this.resizer.css('cursor', 'se-resize');
      this.resizer.on('mousedown', { self: this }, this.startResizing);
      $(document).on('mousemove', { self: this }, this.performResizing);
      $(document).on('mouseup', { self: this }, this.stopResizing);
    }
  },

  enableResizer: function () {
    if (!this.model.get('disabled')) {
      this.resizerDisabled = false;
      this.resizer.css('cursor', 'se-resize');
    }
  },

  disableResizer: function () {
    if (!this.model.get('disabled')) {
      this.resizerDisabled = true;
      this.resizer.css('cursor', 'move');
    }
  },

  apply: function () {
  },

  startResizing: function (event) {
    var self = event.data.self;

    if (self.resizerDisabled) {
      return;
    }

    self.model.graph.trigger('batch:start');

    self.resizing = true;
    self._clientX = event.clientX;
    self._clientY = event.clientY;
  },

  performResizing: function (event) {
    var self = event.data.self;

    if (!self.resizing || self.resizerDisabled) {
      return;
    }

    var type = self.model.get('type');
    var size = self.model.get('size');
    var state = self.model.get('state');
    var gridstep = 8;
    var minSize = { width: 64, height: 32 };
    if (type === 'ice.Code' || type === 'ice.Memory') {
      minSize = { width: 96, height: 64 };
    }

    var clientCoords = snapToGrid({ x: event.clientX, y: event.clientY });
    var oldClientCoords = snapToGrid({ x: self._clientX, y: self._clientY });

    var dx = clientCoords.x - oldClientCoords.x;
    var dy = clientCoords.y - oldClientCoords.y;

    var width = Math.max(size.width + dx, minSize.width);
    var height = Math.max(size.height + dy, minSize.height);

    if (width > minSize.width) {
      self._clientX = event.clientX;
    }

    if (height > minSize.height) {
      self._clientY = event.clientY;
    }

    self.model.resize(width, height);

    function snapToGrid(coords) {
      return {
        x: Math.round(coords.x / state.zoom / gridstep) * gridstep,
        y: Math.round(coords.y / state.zoom / gridstep) * gridstep
      };
    }
  },

  stopResizing: function (event) {
    var self = event.data.self;

    if (!self.resizing || self.resizerDisabled) {
      return;
    }

    self.resizing = false;
    self.model.graph.trigger('batch:stop');
  },

  render: function () {
    joint.dia.ElementView.prototype.render.apply(this, arguments);
    this.paper.$el.append(this.$box);
    this.updateBox();
    return this;
  },

  renderPorts: function () {
    var $leftPorts = this.$('.leftPorts').empty();
    var $rightPorts = this.$('.rightPorts').empty();
    var $topPorts = this.$('.topPorts').empty();
    var $bottomPorts = this.$('.bottomPorts').empty();
    var portTemplate = _.template(this.model.portMarkup);
    var modelId = this.model.id;

    _.each(_.filter(this.model.ports, function (p) { return p.type === 'left'; }), function (port, index) {
      $leftPorts.append(V(portTemplate({ id: modelId, index: index, port: port })).node);
    });
    _.each(_.filter(this.model.ports, function (p) { return p.type === 'right'; }), function (port, index) {
      $rightPorts.append(V(portTemplate({ id: modelId, index: index, port: port })).node);
    });
    _.each(_.filter(this.model.ports, function (p) { return p.type === 'top'; }), function (port, index) {
      $topPorts.append(V(portTemplate({ id: modelId, index: index, port: port })).node);
    });
    _.each(_.filter(this.model.ports, function (p) { return p.type === 'bottom'; }), function (port, index) {
      $bottomPorts.append(V(portTemplate({ id: modelId, index: index, port: port })).node);
    });
  },

  update: function () {
    this.renderPorts();
    joint.dia.ElementView.prototype.update.apply(this, arguments);
  },

  updateBox: function () {
  },

  removeBox: function (/*event*/) {
    this.$box.remove();
  },

  updateScrollStatus: function (status) {
    if (this.editor) {
      this.editor.renderer.scrollBarV.element.style.visibility = status ? '' : 'hidden';
      this.editor.renderer.scrollBarH.element.style.visibility = status ? '' : 'hidden';
      this.editor.renderer.scroller.style.right = 0;
      this.editor.renderer.scroller.style.bottom = 0;
    }
  }
});


// Generic block

joint.shapes.ice.Generic = joint.shapes.ice.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'ice.Generic'
  }, joint.shapes.ice.Model.prototype.defaults)
});

joint.shapes.ice.GenericView = joint.shapes.ice.ModelView.extend({

  // Image comments:
  // - img: fast load, no interactive
  // - object: slow load, interactive
  // - inline SVG: fast load, interactive, but...
  //               old SVG files have no viewBox, therefore no properly resize
  //               Inkscape adds this field saving as "Optimize SVG" ("Enable viewboxing")

  template: '\
  <div class="generic-block">\
    <div class="generic-content">\
      <div class="img-container"><img></div>\
      <label></label>\
      <span class="tooltiptext"></span>\
    </div>\
  </div>\
  ',

  events: {
    'mouseover': 'mouseovercard',
    'mouseout': 'mouseoutcard',
    'mouseup': 'mouseupcard',
    'mousedown': 'mousedowncard'
  },

  enter: false,

  mouseovercard: function (event/*, x, y*/) {
    if (event && event.which === 0) {
      // Mouse button not pressed
      this.showTooltip();
    }
  },

  mouseoutcard: function (/*event, x, y*/) {
    this.hideTooltip();
  },

  mouseupcard: function (/*event, x, y*/) {
  },

  mousedowncard: function (/*event, x, y*/) {
    this.hideTooltip();
  },

  showTooltip: function () {
    if (this.tooltip) {
      if (!this.openTimeout) {
        this.openTimeout = setTimeout(function () {
          this.tooltiptext.css('visibility', 'visible');
        }.bind(this), 2000);
      }
    }
  },

  hideTooltip: function () {
    if (this.tooltip) {
      if (this.openTimeout) {
        clearTimeout(this.openTimeout);
        this.openTimeout = null;
      }
      this.tooltiptext.css('visibility', 'hidden');
    }
  },

  initialize: function () {
    joint.shapes.ice.ModelView.prototype.initialize.apply(this, arguments);

    this.tooltip = this.model.get('tooltip');
    this.tooltiptext = this.$box.find('.tooltiptext');

    this.tooltiptext.text(this.tooltip);

    if (this.tooltip.length > 13) {
      this.tooltiptext.addClass('tooltip-medium');
      this.tooltiptext.removeClass('tooltip-large');
    }
    else if (this.tooltip.length > 20) {
      this.tooltiptext.addClass('tooltip-large');
      this.tooltiptext.removeClass('tooltip-medium');
    }
    else {
      this.tooltiptext.removeClass('tooltip-medium');
      this.tooltiptext.removeClass('tooltip-large');
    }

    if (this.model.get('config')) {
      this.$box.find('.generic-content').addClass('config-block');
    }

    // Initialize content
    this.initializeContent();
  },

  initializeContent: function () {
    var image = this.model.get('image');
    var label = this.model.get('label');
    var ports = this.model.get('leftPorts');

    var imageSelector = this.$box.find('img');
    var labelSelector = this.$box.find('label');

    if (image) {
      // Render img
      imageSelector.attr('src', 'data:image/svg+xml,' + image);

      // Render SVG
      //imageSelector.append(decodeURI(image));

      imageSelector.removeClass('hidden');
      labelSelector.addClass('hidden');
    }
    else {
      // Render label
      labelSelector.html(label);
      labelSelector.removeClass('hidden');
      imageSelector.addClass('hidden');
    }

    // Render clocks
    this.$box.find('.clock').remove();
    var n = ports.length;
    var gridsize = 8;
    var height = this.model.get('size').height;
    var contentSelector = this.$box.find('.generic-content');
    for (var i in ports) {
      var port = ports[i];
      if (port.clock) {
        var top = Math.round((parseInt(i) + 0.5) * height / n / gridsize) * gridsize - 9;
        contentSelector.append('\
          <div class="clock" style="top: ' + top + 'px;">\
            <svg width="12" height="18"><path d="M-1 0 l10 8-10 8" fill="none" stroke="#555" stroke-width="1.2" stroke-linejoin="round"/>\
          </div>');
      }
    }
  },
  updateBox: function () {
    var pendingTasks = [];
    var i, port;
    var bbox = this.model.getBBox();
    var data = this.model.get('data');
    var state = this.model.get('state');
    var rules = this.model.get('rules');
    var leftPorts = this.model.get('leftPorts');
    var rightPorts = this.model.get('rightPorts');
    var modelId = this.model.id;

    // Render ports width
    var width = WIRE_WIDTH * state.zoom;
    var pwires = this.$el[0].getElementsByClassName('port-wire');
    for (i = 0; i < pwires.length; i++) {
      pendingTasks.push({ e: pwires[i], property: 'stroke-width', value: width + 'px' });
    }
    var nwidth = width * 3;
    var tokId = 'port-wire-' + modelId + '-';
    var dome;
    for (i = 0; i < leftPorts.length; i++) {
      port = leftPorts[i];
      if (port.size > 1) {

        dome = document.getElementById(tokId + port.id);

        pendingTasks.push({ e: dome, property: 'stroke-width', value: nwidth + 'px' });

      }
    }

    for (i = 0; i < rightPorts.length; i++) {
      port = rightPorts[i];
      if (port.size > 1) {

        dome = document.getElementById(tokId + port.id);

        pendingTasks.push({ e: dome, property: 'stroke-width', value: nwidth + 'px' });


      }
    }

    // Render rules
    var portDefault, paths, rects, j;

    if (data && data.ports && data.ports.in) {
      tokId = 'port-default-' + modelId + '-';
      for (i = 0; i < data.ports.in.length; i++) {
        port = data.ports.in[i];
        portDefault = document.getElementById(tokId + port.name);
        if (portDefault !== null && rules && port.default && port.default.apply) {

          pendingTasks.push({ e: portDefault, property: 'display', value: 'inline' });

          paths = portDefault.querySelectorAll('path');
          for (j = 0; j < paths.length; j++) {
            pendingTasks.push({ e: paths[j], property: 'stroke-width', value: width + 'px' });
          }

          rects = portDefault.querySelectorAll('rect');
          for (j = 0; j < rects.length; j++) {
            pendingTasks.push({ e: rects[j], property: 'stroke-width', value: state.zoom + 'px' });
          }


        }
        else {

          pendingTasks.push({ e: portDefault, property: 'display', value: 'none' });
        }
      }
    }

    var gcontent = this.$box[0].querySelectorAll('.generic-content');


    for (i = 0; i < gcontent.length; i++) {
      pendingTasks.push({ e: gcontent[i], property: 'left', value: Math.round(bbox.width / 2.0 * (state.zoom - 1)) + 'px' });
      pendingTasks.push({ e: gcontent[i], property: 'top', value: Math.round(bbox.height / 2.0 * (state.zoom - 1)) + 'px' });
      pendingTasks.push({ e: gcontent[i], property: 'width', value: Math.round(bbox.width) + 'px' });
      pendingTasks.push({ e: gcontent[i], property: 'height', value: Math.round(bbox.height) + 'px' });
      pendingTasks.push({ e: gcontent[i], property: 'transform', value: 'scale(' + state.zoom + ')' });
    }


    pendingTasks.push({ e: this.$box[0], property: 'left', value: Math.round(bbox.x * state.zoom + state.pan.x) + 'px' });
    pendingTasks.push({ e: this.$box[0], property: 'top', value: Math.round(bbox.y * state.zoom + state.pan.y) + 'px' });
    pendingTasks.push({ e: this.$box[0], property: 'width', value: Math.round(bbox.width * state.zoom) + 'px' });
    pendingTasks.push({ e: this.$box[0], property: 'height', value: Math.round(bbox.height * state.zoom) + 'px' });

    i = pendingTasks.length;
    for (i = 0; i < pendingTasks.length; i++) {

      if (pendingTasks[i].e !== null) {

        pendingTasks[i].e.style[pendingTasks[i].property] = pendingTasks[i].value;
      }
    }
    return pendingTasks;

  }
});

// I/O blocks

joint.shapes.ice.Input = joint.shapes.ice.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'ice.Input',
    size: {
      width: 96,
      height: 64
    }
  }, joint.shapes.ice.Model.prototype.defaults)
});

joint.shapes.ice.Output = joint.shapes.ice.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'ice.Output',
    size: {
      width: 96,
      height: 64
    }
  }, joint.shapes.ice.Model.prototype.defaults)
});

joint.shapes.ice.InputLabel = joint.shapes.ice.Model.extend({
  markup: '<g class="rotatable">\
             <g class="scalable">\
               <rect class="body" />\
             </g>\
             <g class="leftPorts disable-port"/>\
             <g class="rightPorts"/>\
             <g class="topPorts disable-port"/>\
             <g class="bottomPorts"/>\
    </g>',
  portMarkup: '<g class="port port<%= index %>">\
               <g class="port-default" id="port-default-<%= id %>-<%= port.id %>">\
               <path/><rect/>\
               </g>\
               <path class="port-wire" id="port-wire-<%= id %>-<%= port.id %>"/>\
                 <text class="port-label"/>\
                 <circle class="port-body"/>\
               </g>',

  //<polygon  class="input-virtual-terminator" points="0 -5,0 34,20 16" style="fill:white;stroke:<%= port.fill %>;stroke-width:3" transform="translate(100 -15)"/>\
  defaults: joint.util.deepSupplement({
    type: 'ice.Output',
    size: {
      width: 96,
      height: 64
    }
  }, joint.shapes.ice.Model.prototype.defaults)
});


joint.shapes.ice.OutputLabel = joint.shapes.ice.Model.extend({
  markup: '<g class="rotatable">\
             <g class="scalable">\
               <rect class="body"/>\
             </g>\
             <g class="leftPorts disable-port"/>\
             <g class="rightPorts"/>\
             <g class="topPorts disable-port"/>\
             <g class="bottomPorts"/>\
    </g>',
  portMarkup: '<g class="port port<%= index %>">\
               <g class="port-default" id="port-default-<%= id %>-<%= port.id %>">\
               <path/><rect/>\
               </g>\
               <path class="port-wire" id="port-wire-<%= id %>-<%= port.id %>"/>\
                 <text class="port-label"/>\
                 <circle class="port-body"/>\
               </g>',

  //<polygon points="1 0,15 15,0 30,30 30,30 0" style="fill:lime;stroke-width:1" transform="translate(-122 -15)"/>\
  defaults: joint.util.deepSupplement({
    type: 'ice.Input',
    size: {
      width: 96,
      height: 64
    }
  }, joint.shapes.ice.Model.prototype.defaults)

});

joint.shapes.ice.IOView = joint.shapes.ice.ModelView.extend({

  initialize: function () {
    _.bindAll(this, 'updateBox');
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    this.id = sha1(this.model.get('id')).toString().substring(0, 6);
    var comboId = 'combo' + this.id;
    var virtual = this.model.get('data').virtual || this.model.get('disabled');

    var selectCode = '';
    var selectScript = '';
    var data = this.model.get('data');
    var name = data.name + (data.range || '');

    if (data.pins) {
      for (var i in data.pins) {
        selectCode += '<select id="' + comboId + data.pins[i].index + '"';
        selectCode += 'class="select2" i="' + i + '">';
        selectCode += '</select>';

        selectScript += '$("#' + comboId + data.pins[i].index + '").select2(';
        selectScript += '{placeholder: "", allowClear: true, dropdownCssClass: "bigdrop",';
        // Match only words that start with the selected search term
        // http://stackoverflow.com/questions/31571864/select2-search-match-only-words-that-start-with-search-term
        selectScript += 'matcher: function(params, data) {';
        selectScript += '  params.term = params.term || "";';
        selectScript += '  if (data.text.toUpperCase().indexOf(params.term.toUpperCase()) == 0) { return data; }';
        selectScript += '  return false; } });';
      }
    }

    this.$box = $(joint.util.template(
      '\
      <div class="io-block">\
        <div class="io-virtual-content' + (virtual ? '' : ' hidden') + '">\
          <div class="header">\
            <label>' + name + '</label>\
            <svg viewBox="0 0 12 18"><path d="M-1 0 l10 8-10 8" fill="none" stroke-width="2" stroke-linejoin="round"/>\
          </div>\
        </div>\
        <div class="io-fpga-content' + (virtual ? ' hidden' : '') + '">\
          <div class="header">\
            <label>' + name + '</label>\
            <svg viewBox="0 0 12 18"><path d="M-1 0 l10 8-10 8" fill="none" stroke-width="2" stroke-linejoin="round"/>\
          </div>\
          <div>' + selectCode + '</div>\
          <script>' + selectScript + '</script>\
        </div>\
      </div>\
      '
    )());


    this.virtualContentSelector = this.$box.find('.io-virtual-content');
    this.fpgaContentSelector = this.$box.find('.io-fpga-content');
    this.headerSelector = this.$box.find('.header');
    this.nativeDom = {
      box: this.$box[0],
      virtualContentSelector: this.$box[0].querySelectorAll('.io-virtual-content'),
      fpgaContentSelector: this.$box[0].querySelectorAll('.io-fpga-content')


    };

    this.model.on('change', this.updateBox, this);
    this.model.on('remove', this.removeBox, this);

    this.listenTo(this.model, 'process:ports', this.update);
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    // Prevent paper from handling pointerdown.
    var self = this;
    var selector = this.$box.find('.select2');
    selector.on('mousedown click', function (event) { event.stopPropagation(); });
    selector.on('change', function (event) {
      if (!self.updating) {
        var target = $(event.target);
        var i = target.attr('i');
        var name = target.find('option:selected').text();
        var value = target.val();
        var data = JSON.parse(JSON.stringify(self.model.get('data')));
        if (name !== null && value !== null) {
          data.pins[i].name = name;
          data.pins[i].value = value;
          self.model.set('data', data);
        }
      }
    });

    this.updateBox();

    this.updating = false;

    // Apply data
    if (!this.model.get('disabled')) {
      this.applyChoices();
      this.applyValues();
      this.applyShape();
    }
    this.applyClock();
  },

  applyChoices: function () {
    var data = this.model.get('data');
    if (data.pins) {
      for (var i in data.pins) {
        this.$box.find('#combo' + this.id + data.pins[i].index).empty().append(this.model.get('choices'));
      }
    }
  },

  applyValues: function () {
    this.updating = true;
    var data = this.model.get('data');
    for (var i in data.pins) {
      var index = data.pins[i].index;
      var value = data.pins[i].value;
      var name = data.pins[i].name;
      var comboId = '#combo' + this.id + index;
      var comboSelector = this.$box.find(comboId + ' option:contains(' + name + ')');
      if (comboSelector) {
        // Select by pin name
        comboSelector.attr('selected', true);
      } else {
        // If there was a pin rename use the pin value
        comboSelector = this.$box.find(comboId);
        comboSelector.val(value).change();
      }
    }
    this.updating = false;
  },

  applyShape: function () {
    var data = this.model.get('data');
    var name = data.name + (data.range || '');
    var virtual = data.virtual || this.model.get('disabled') || subModuleActive;
    var $label = this.$box.find('label');

    $label.text(name || '');

    if (virtual) {
      // Virtual port (green)
      this.fpgaContentSelector.addClass('hidden');

      this.virtualContentSelector.removeClass('hidden');
      if (typeof data.blockColor !== 'undefined') {
        if (typeof data.oldBlockColor !== 'undefined') {
          this.virtualContentSelector.removeClass('color-' + data.oldBlockColor);
        }
        this.virtualContentSelector.addClass('color-' + data.blockColor);
      }
      this.model.attributes.size.height = 64;
    }
    else {
      // FPGA I/O port (yellow)
      this.virtualContentSelector.addClass('hidden');
      this.fpgaContentSelector.removeClass('hidden');
      if (data.pins) {
        this.model.attributes.size.height = 32 + 32 * data.pins.length;
      }
    }
  },

  applyClock: function () {
    if (this.model.get('data').clock) {
      this.$box.find('svg').removeClass('hidden');
    } else {
      this.$box.find('svg').addClass('hidden');
    }
  },

  clearValues: function () {
    this.updating = true;
    var name = '';
    var value = '0';
    var data = JSON.parse(JSON.stringify(this.model.get('data')));
    for (var i in data.pins) {
      var index = data.pins[i].index;
      var comboId = '#combo' + this.id + index;
      var comboSelector = this.$box.find(comboId);
      comboSelector.val(value).change();
      data.pins[i].name = name;
      data.pins[i].value = value;
    }
    this.model.set('data', data);
    this.updating = false;
  },

  apply: function () {
    this.applyChoices();
    this.applyValues();
    this.applyShape();
    this.applyClock();
    this.render();
  },

  update: function () {
    this.renderPorts();
    joint.dia.ElementView.prototype.update.apply(this, arguments);
  },
  pendingRender: false,
  updateBox: function () {

    var pendingTasks = [];
    var i, j, port;
    var bbox = this.model.getBBox();
    var data = this.model.get('data');
    var state = this.model.get('state');
    var rules = this.model.get('rules');
    var leftPorts = this.model.get('leftPorts');
    var rightPorts = this.model.get('rightPorts');
    var modelId = this.model.id;
    var portDefault, tokId, dome;
    var paths, rects;
    var width = WIRE_WIDTH * state.zoom;

    var pwires = this.$el[0].getElementsByClassName('port-wire');
    for (i = 0; i < pwires.length; i++) {
      pendingTasks.push({ e: pwires[i], property: 'stroke-width', value: width + 'px' });
    }
    // Set buses
    var nwidth = width * 3;
    tokId = 'port-wire-' + modelId + '-';
    for (i = 0; i < leftPorts.length; i++) {
      port = leftPorts[i];
      if (port.size > 1) {

        dome = document.getElementById(tokId + port.id);

        pendingTasks.push({ e: dome, property: 'stroke-width', value: nwidth + 'px' });

      }
    }

    for (i = 0; i < rightPorts.length; i++) {
      port = rightPorts[i];
      if (port.size > 1) {

        dome = document.getElementById(tokId + port.id);

        pendingTasks.push({ e: dome, property: 'stroke-width', value: nwidth + 'px' });


      }
    }
    // Render rules
    if (data && data.ports && data.ports.in) {
      tokId = 'port-default-' + modelId + '-';
      for (i = 0; i < data.ports.in.length; i++) {
        port = data.ports.in[i];
        portDefault = document.getElementById(tokId + port.name);
        if (portDefault !== null && rules && port.default && port.default.apply) {

          pendingTasks.push({ e: portDefault, property: 'display', value: 'inline' });

          paths = portDefault.querySelectorAll('path');
          for (j = 0; j < paths.length; j++) {
            pendingTasks.push({ e: paths[j], property: 'stroke-width', value: width + 'px' });
          }

          rects = portDefault.querySelectorAll('rect');
          for (j = 0; j < rects.length; j++) {
            pendingTasks.push({ e: rects[j], property: 'stroke-width', value: state.zoom + 'px' });
          }


        }
        else {

          pendingTasks.push({ e: portDefault, property: 'display', value: 'none' });
        }
      }
    }
    var virtualtopOffset = 24;

    for (i = 0; i < this.nativeDom.virtualContentSelector.length; i++) {

      pendingTasks.push({ e: this.nativeDom.virtualContentSelector[i], property: 'left', value: Math.round(bbox.width / 2.0 * (state.zoom - 1)) + 'px' });
      pendingTasks.push({ e: this.nativeDom.virtualContentSelector[i], property: 'top', value: Math.round((bbox.height - virtualtopOffset) / 2.0 * (state.zoom - 1) + virtualtopOffset / 2.0 * state.zoom) + 'px' });
      pendingTasks.push({ e: this.nativeDom.virtualContentSelector[i], property: 'width', value: Math.round(bbox.width) + 'px' });
      pendingTasks.push({ e: this.nativeDom.virtualContentSelector[i], property: 'height', value: Math.round(bbox.height - virtualtopOffset) + 'px' });
      pendingTasks.push({ e: this.nativeDom.virtualContentSelector[i], property: 'transform', value: 'scale(' + state.zoom + ')' });

    }
    // Render io FPGA content
    var fpgaTopOffset = (data.name || data.range || data.clock) ? 0 : 24;

    for (i = 0; i < this.nativeDom.fpgaContentSelector.length; i++) {


      pendingTasks.push({ e: this.nativeDom.fpgaContentSelector[i], property: 'left', value: Math.round(bbox.width / 2.0 * (state.zoom - 1)) + 'px' });
      pendingTasks.push({ e: this.nativeDom.fpgaContentSelector[i], property: 'top', value: Math.round((bbox.height - fpgaTopOffset) / 2.0 * (state.zoom - 1) + fpgaTopOffset / 2.0 * state.zoom) + 'px' });
      pendingTasks.push({ e: this.nativeDom.fpgaContentSelector[i], property: 'width', value: Math.round(bbox.width) + 'px' });
      pendingTasks.push({ e: this.nativeDom.fpgaContentSelector[i], property: 'height', value: Math.round(bbox.height - fpgaTopOffset) + 'px' });
      pendingTasks.push({ e: this.nativeDom.fpgaContentSelector[i], property: 'transform', value: 'scale(' + state.zoom + ')' });
    }
    if (data.name || data.range || data.clock) {
      this.headerSelector.removeClass('hidden');
    } else {
      this.headerSelector.addClass('hidden');
    }

    // Render block
    pendingTasks.push({ e: this.nativeDom.box, property: 'left', value: Math.round(bbox.x * state.zoom + state.pan.x) + 'px' });
    pendingTasks.push({ e: this.nativeDom.box, property: 'top', value: Math.round(bbox.y * state.zoom + state.pan.y) + 'px' });
    pendingTasks.push({ e: this.nativeDom.box, property: 'width', value: Math.round(bbox.width * state.zoom) + 'px' });
    pendingTasks.push({ e: this.nativeDom.box, property: 'height', value: Math.round(bbox.height * state.zoom) + 'px' });


    i = pendingTasks.length;
    for (i = 0; i < pendingTasks.length; i++) {

      if (pendingTasks[i].e !== null) {
        pendingTasks[i].e.style[pendingTasks[i].property] = pendingTasks[i].value;
      }
    }
    return pendingTasks;
  },

  drawPendingTasks: function (tasks) {
    var i = tasks.length;
    for (i = 0; i < tasks.length; i++) {
      if (this.tasks[i].e !== null) {
        tasks[i].e.style[tasks[i].property] = tasks[i].value;
      }
    }

  },

  removeBox: function () {
    // Close select options on remove
    this.$box.find('select').select2('close');
    this.$box.remove();
  }
});

joint.shapes.ice.InputView = joint.shapes.ice.IOView;
joint.shapes.ice.OutputView = joint.shapes.ice.IOView;


// Constant block

joint.shapes.ice.Constant = joint.shapes.ice.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'ice.Constant',
    size: {
      width: 96,
      height: 64
    }
  }, joint.shapes.ice.Model.prototype.defaults)
});


joint.shapes.ice.ConstantView = joint.shapes.ice.ModelView.extend({

  initialize: function () {
    _.bindAll(this, 'updateBox');
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    this.$box = $(joint.util.template(
      '\
      <div class="constant-block">\
        <div class="constant-content">\
          <div class="header">\
            <label></label>\
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 9.78"><path d="M2.22 4.44h3.56V3.11q0-.73-.52-1.26-.52-.52-1.26-.52t-1.26.52q-.52.52-.52 1.26v1.33zM8 5.11v4q0 .28-.2.47-.19.2-.47.2H.67q-.28 0-.48-.2Q0 9.38 0 9.11v-4q0-.28.2-.47.19-.2.47-.2h.22V3.11q0-1.28.92-2.2Q2.72 0 4 0q1.28 0 2.2.92.91.91.91 2.2v1.32h.22q.28 0 .48.2.19.2.19.47z"/></svg>\
          </div>\
          <input class="constant-input"></input>\
        </div>\
      </div>\
      '
    )());

    this.inputSelector = this.$box.find('.constant-input');
    this.contentSelector = this.$box.find('.constant-content');
    this.headerSelector = this.$box.find('.header');

    this.model.on('change', this.updateBox, this);
    this.model.on('remove', this.removeBox, this);

    this.listenTo(this.model, 'process:ports', this.update);
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    // Prevent paper from handling pointerdown.
    this.inputSelector.on('mousedown click', function (event) { event.stopPropagation(); });

    this.updateBox();

    this.updating = false;

    var self = this;
    this.inputSelector.on('input', function (event) {
      if (!self.updating) {
        var target = $(event.target);
        var data = JSON.parse(JSON.stringify(self.model.get('data')));
        data.value = target.val();
        self.model.set('data', data);
      }
    });
    this.inputSelector.on('paste', function (event) {
      var data = event.originalEvent.clipboardData.getData('text');
      if (data.startsWith('{"icestudio":')) {
        // Prevent paste blocks
        event.preventDefault();
      }
    });

    // Apply data
    this.apply();
  },

  apply: function () {
    this.applyName();
    this.applyLocal();
    this.applyValue();
  },

  applyName: function () {
    var name = this.model.get('data').name;
    this.$box.find('label').text(name);
  },

  applyLocal: function () {
    if (this.model.get('data').local) {
      this.$box.find('svg').removeClass('hidden');
    } else {
      this.$box.find('svg').addClass('hidden');
    }
  },

  applyValue: function () {
    this.updating = true;
    if (this.model.get('disabled')) {
      this.inputSelector.css({ 'pointer-events': 'none' });
    }
    var value = this.model.get('data').value;
    this.inputSelector.val(value);
    this.updating = false;
  },

  update: function () {
    this.renderPorts();
    joint.dia.ElementView.prototype.update.apply(this, arguments);
  },

  updateBox: function () {
    var bbox = this.model.getBBox();
    var data = this.model.get('data');
    var state = this.model.get('state');
    var pendingTasks = [];
    // Set wire width
    var width = WIRE_WIDTH * state.zoom;
    var pwires = this.$el[0].getElementsByClassName('port-wire');
    var i;
    for (i = 0; i < pwires.length; i++) {
      pendingTasks.push({ e: pwires[i], property: 'stroke-width', value: width + 'px' });
    }
    // Render content
    var topOffset = (data.name || data.local) ? 0 : 24;
    var contentSel = this.$box[0].querySelectorAll('.constant-content');
    for (i = 0; i < contentSel.length; i++) {
      pendingTasks.push({ e: contentSel[i], property: 'left', value: Math.round(bbox.width / 2.0 * (state.zoom - 1)) + 'px' });
      pendingTasks.push({ e: contentSel[i], property: 'top', value: Math.round((bbox.height + topOffset) / 2.0 * (state.zoom - 1) + topOffset) + 'px' });
      pendingTasks.push({ e: contentSel[i], property: 'width', value: Math.round(bbox.width) + 'px' });
      pendingTasks.push({ e: contentSel[i], property: 'height', value: Math.round(bbox.height - topOffset) + 'px' });
      pendingTasks.push({ e: contentSel[i], property: 'transform', value: 'scale(' + state.zoom + ')' });
    }
    if (data.name || data.local) {
      this.headerSelector.removeClass('hidden');
    } else {
      this.headerSelector.addClass('hidden');
    }

    // Render block
    pendingTasks.push({ e: this.$box[0], property: 'left', value: Math.round(bbox.x * state.zoom + state.pan.x) + 'px' });
    pendingTasks.push({ e: this.$box[0], property: 'top', value: Math.round(bbox.y * state.zoom + state.pan.y) + 'px' });
    pendingTasks.push({ e: this.$box[0], property: 'width', value: Math.round(bbox.width * state.zoom) + 'px' });
    pendingTasks.push({ e: this.$box[0], property: 'height', value: Math.round(bbox.height * state.zoom) + 'px' });


    i = pendingTasks.length;
    //  pendingTasks= pendingTasks.reverse();
    for (i = 0; i < pendingTasks.length; i++) {

      if (pendingTasks[i].e !== null) {

        pendingTasks[i].e.style[pendingTasks[i].property] = pendingTasks[i].value;
      }
    }
    return pendingTasks;

  }
});


// Memory block

joint.shapes.ice.Memory = joint.shapes.ice.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'ice.Memory',
    size: {
      width: 96,
      height: 104
    }
  }, joint.shapes.ice.Model.prototype.defaults)
});

joint.shapes.ice.MemoryView = joint.shapes.ice.ModelView.extend({

  initialize: function () {
    _.bindAll(this, 'updateBox');
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    var id = sha1(this.model.get('id')).toString().substring(0, 6);
    var editorLabel = 'editor' + id;
    this.$box = $(joint.util.template(
      '\
      <div class="memory-block">\
        <div class="memory-content">\
          <div class="header">\
            <label></label>\
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 9.78"><path d="M2.22 4.44h3.56V3.11q0-.73-.52-1.26-.52-.52-1.26-.52t-1.26.52q-.52.52-.52 1.26v1.33zM8 5.11v4q0 .28-.2.47-.19.2-.47.2H.67q-.28 0-.48-.2Q0 9.38 0 9.11v-4q0-.28.2-.47.19-.2.47-.2h.22V3.11q0-1.28.92-2.2Q2.72 0 4 0q1.28 0 2.2.92.91.91.91 2.2v1.32h.22q.28 0 .48.2.19.2.19.47z"/></svg>\
          </div>\
        </div>\
        <div class="memory-editor" id="' + editorLabel + '"></div>\
        <script>\
          var ' + editorLabel + ' = ace.edit("' + editorLabel + '");\
          ' + editorLabel + '.setTheme("ace/theme/chrome");\
          ' + editorLabel + '.setHighlightActiveLine(false);\
          ' + editorLabel + '.setHighlightGutterLine(false);\
          ' + editorLabel + '.setOption("firstLineNumber", 0);\
          ' + editorLabel + '.setAutoScrollEditorIntoView(true);\
          ' + editorLabel + '.renderer.setShowGutter(true);\
          ' + editorLabel + '.renderer.$cursorLayer.element.style.opacity = 0;\
          ' + editorLabel + '.renderer.$gutter.style.background = "#F0F0F0";\
          ' + editorLabel + '.session.setMode("ace/mode/verilog");\
        </script>\
        <div class="resizer"/></div>\
      </div>\
      '
    )());

    this.editorSelector = this.$box.find('.memory-editor');
    this.contentSelector = this.$box.find('.memory-content');
    this.headerSelector = this.$box.find('.header');

    this.model.on('change', this.updateBox, this);
    this.model.on('remove', this.removeBox, this);

    this.listenTo(this.model, 'process:ports', this.update);
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    // Prevent paper from handling pointerdown.
    this.editorSelector.on('mousedown click', function (event) { event.stopPropagation(); });

    this.updateBox();

    this.updating = false;
    this.prevZoom = 0;
    this.deltas = [];
    this.counter = 0;
    this.timer = null;
    var undoGroupingInterval = 200;

    var self = this;
    this.editor = ace.edit(this.editorSelector[0]);
    this.updateScrollStatus(false);
    this.editor.$blockScrolling = Infinity;
    this.editor.commands.removeCommand('undo');
    this.editor.commands.removeCommand('redo');
    this.editor.commands.removeCommand('touppercase');
    this.editor.session.on('change', function (delta) {
      if (!self.updating) {
        // Check consecutive-change interval
        if (Date.now() - self.counter < undoGroupingInterval) {
          clearTimeout(self.timer);
        }
        // Update deltas
        self.deltas = self.deltas.concat([delta]);
        // Launch timer
        self.timer = setTimeout(function () {
          var deltas = JSON.parse(JSON.stringify(self.deltas));
          // Set deltas
          self.model.set('deltas', deltas);
          // Reset deltas
          self.deltas = [];
          // Set data.list
          self.model.attributes.data.list = self.editor.session.getValue();
        }, undoGroupingInterval);
        // Reset counter
        self.counter = Date.now();
      }
    });
    this.editor.on('focus', function () {
      self.updateScrollStatus(true);
      $(document).trigger('disableSelected');
      self.editor.setHighlightActiveLine(true);
      self.editor.setHighlightGutterLine(true);
      // Show cursor
      self.editor.renderer.$cursorLayer.element.style.opacity = 1;
    });
    this.editor.on('blur', function () {
      self.updateScrollStatus(false);
      var selection = self.editor.session.selection;
      if (selection) {
        selection.clearSelection();
      }
      self.editor.setHighlightActiveLine(false);
      self.editor.setHighlightGutterLine(false);
      // Hide cursor
      self.editor.renderer.$cursorLayer.element.style.opacity = 0;
    });
    this.editor.on('paste', function (e) {
      if (e.text.startsWith('{"icestudio":')) {
        // Prevent paste blocks
        e.text = '';
      }
    });
    this.editor.on('mousewheel', function (event) {
      // Stop mousewheel event propagation when target is active
      if (document.activeElement.parentNode.id === self.editorSelector.attr('id')) {
        // Enable only scroll
        event.stopPropagation();
      }
      else {
        // Enable only zoom
        event.preventDefault();
      }
    });

    this.setupResizer();

    // Apply data
    this.apply({ ini: true });
  },

  apply: function (opt) {
    this.applyName();
    this.applyLocal();
    this.applyValue(opt);
    this.applyFormat();
    if (this.editor) {
      this.editor.resize();
    }
  },

  applyName: function () {
    var name = this.model.get('data').name;
    this.$box.find('label').text(name);
  },

  applyLocal: function () {
    if (this.model.get('data').local) {
      this.$box.find('svg').removeClass('hidden');
    } else {
      this.$box.find('svg').addClass('hidden');
    }
  },

  applyValue: function (opt) {
    this.updating = true;

    var dontselect = false;
    var data = this.model.get('data');
    var deltas = this.model.get('deltas');

    opt = opt || {};

    switch (opt.attribute) {
      case 'deltas':
        if (deltas) {
          var changes = [{
            group: 'doc',
            deltas: deltas
          }];
          if (opt.undo) {
            this.editor.session.undoChanges(changes, dontselect);
          }
          else {
            this.editor.session.redoChanges(changes, dontselect);
          }
        }
        break;
      case 'data':
        break;
      default:
        break;
    }
    if (opt.ini) {
      this.editor.session.setValue(data.list);
    }
    else {
      // Set data.list
      this.model.attributes.data.list = this.editor.session.getValue();
    }
    setTimeout(function (self) {
      self.updating = false;
    }, 10, this);
  },

  applyFormat: function () {
    this.updating = true;

    var self = this;
    var data = this.model.get('data');
    var radix = data.format;
    this.editor.session.gutterRenderer = {
      getWidth: function (session, lastLineNumber, config) {
        return lastLineNumber.toString().length * config.characterWidth;
      },
      getText: function (session, row) {
        var text = row.toString(radix).toUpperCase();
        var config = self.editor.renderer.layerConfig;
        var size = config.lastRow.toString(radix).length;
        while (text.length < size) { text = '0' + text; }
        return (radix === 16 ? '0x' : '') + text;
      }
    };
    this.editor.renderer.setShowGutter(false);
    this.editor.renderer.setShowGutter(true);

    this.updating = false;
  },

  update: function () {
    this.renderPorts();
    this.editor.setReadOnly(this.model.get('disabled'));
    joint.dia.ElementView.prototype.update.apply(this, arguments);
  },

  updateBox: function () {
    var bbox = this.model.getBBox();
    var data = this.model.get('data');
    var state = this.model.get('state');

    // Set font size
    if (this.editor) {
      if (this.prevZoom !== state.zoom) {
        this.prevZoom = state.zoom;
        // Scale editor
        this.editorSelector.css({
          top: 24 * state.zoom,
          margin: 7 * state.zoom,
          'border-radius': 5 * state.zoom,
          'border-width': state.zoom + 0.5
        });
        // Scale padding
        this.$box.find('.ace_text-layer').css('padding', '0px ' + Math.round(4 * state.zoom) + 'px');
        // Scale gutters
        var rule = getCSSRule('.ace_folding-enabled > .ace_gutter-cell');
        if (rule) {
          rule.style.paddingLeft = Math.round(19 * state.zoom) + 'px';
          rule.style.paddingRight = Math.round(13 * state.zoom) + 'px';
        }
        // Scale font size
        this.editor.setFontSize(Math.round(aceFontSize * state.zoom));
        // Scale cursor
        this.editor.renderer.$cursorLayer.$padding = Math.round(4 * state.zoom);
      }
      this.editor.resize();
    }

    // Set wire width
    var width = WIRE_WIDTH * state.zoom;
    this.$('.port-wire').css('stroke-width', width);

    // Render content
    var topOffset = (data.name || data.local) ? 0 : 24;
    this.contentSelector.css({
      left: Math.round(bbox.width / 2.0 * (state.zoom - 1)),
      top: Math.round((bbox.height + topOffset) / 2.0 * (state.zoom - 1) + topOffset),
      width: Math.round(bbox.width),
      height: Math.round(bbox.height - topOffset),
      transform: 'scale(' + state.zoom + ')'
    });

    if (data.name || data.local) {
      this.headerSelector.removeClass('hidden');
    } else {
      this.headerSelector.addClass('hidden');
    }

    // Render block
    this.$box.css({
      left: bbox.x * state.zoom + state.pan.x,
      top: bbox.y * state.zoom + state.pan.y,
      width: bbox.width * state.zoom,
      height: bbox.height * state.zoom
    });
  }
});


// Code block

joint.shapes.ice.Code = joint.shapes.ice.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'ice.Code',
    size: {
      width: 384,
      height: 256
    }
  }, joint.shapes.ice.Model.prototype.defaults)
});

joint.shapes.ice.CodeView = joint.shapes.ice.ModelView.extend({

  initialize: function () {
    _.bindAll(this, 'updateBox');
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    var id = sha1(this.model.get('id')).toString().substring(0, 6);
    var editorLabel = 'editor' + id;
    this.$box = $(joint.util.template(
      '\
      <div class="code-block">\
        <div class="code-content"></div>\
        <div class="code-editor" id="' + editorLabel + '"></div>\
        <script>\
          var ' + editorLabel + ' = ace.edit("' + editorLabel + '");\
          ' + editorLabel + '.setTheme("ace/theme/chrome");\
          ' + editorLabel + '.setHighlightActiveLine(false);\
          ' + editorLabel + '.setHighlightGutterLine(false);\
          ' + editorLabel + '.setAutoScrollEditorIntoView(true);\
          ' + editorLabel + '.renderer.setShowGutter(true);\
          ' + editorLabel + '.renderer.$cursorLayer.element.style.opacity = 0;\
          ' + editorLabel + '.session.setMode("ace/mode/verilog");\
        </script>\
        <div class="resizer"/></div>\
      </div>\
      '
    )());

    this.editorSelector = this.$box.find('.code-editor');
    this.contentSelector = this.$box.find('.code-content');
    this.nativeDom = {
      box: this.$box[0],
      // rule: getCSSRule('.ace_folding-enabled > .ace_gutter-cell'),
      editorSelector: this.$box[0].querySelectorAll('.code-editor'),
      contentSelector: this.$box[0].querySelectorAll('.code-content')


    };

    this.model.on('change', this.updateBox, this);
    this.model.on('remove', this.removeBox, this);

    this.listenTo(this.model, 'process:ports', this.update);
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    // Prevent paper from handling pointerdown.
    this.editorSelector.on('mousedown click', function (event) { event.stopPropagation(); });

    this.updateBox();

    this.updating = false;
    this.prevZoom = 0;
    this.deltas = [];
    this.counter = 0;
    this.timer = null;
    var undoGroupingInterval = 200;

    var self = this;
    this.editor = ace.edit(this.editorSelector[0]);
    this.updateScrollStatus(false);
    this.editor.$blockScrolling = Infinity;
    this.editor.commands.removeCommand('undo');
    this.editor.commands.removeCommand('redo');
    this.editor.commands.removeCommand('touppercase');
    this.editor.session.on('change', function (delta) {
      if (!self.updating) {
        // Check consecutive-change interval
        if (Date.now() - self.counter < undoGroupingInterval) {
          clearTimeout(self.timer);
        }
        // Update deltas
        self.deltas = self.deltas.concat([delta]);
        // Launch timer
        self.timer = setTimeout(function () {
          var deltas = JSON.parse(JSON.stringify(self.deltas));
          // Set deltas
          self.model.set('deltas', deltas);
          // Reset deltas
          self.deltas = [];
          // Set data.code
          self.model.attributes.data.code = self.editor.session.getValue();

        }, undoGroupingInterval);
        // Reset counter
        self.counter = Date.now();
      }
    });
    this.editor.on('focus', function () {
      self.updateScrollStatus(true);
      $(document).trigger('disableSelected');
      self.editor.setHighlightActiveLine(true);
      self.editor.setHighlightGutterLine(true);
      // Show cursor
      self.editor.renderer.$cursorLayer.element.style.opacity = 1;
    });
    this.editor.on('blur', function () {
      self.updateScrollStatus(false);
      var selection = self.editor.session.selection;
      if (selection) {
        selection.clearSelection();
      }
      self.editor.setHighlightActiveLine(false);
      self.editor.setHighlightGutterLine(false);
      // Hide cursor
      self.editor.renderer.$cursorLayer.element.style.opacity = 0;
    });
    this.editor.on('paste', function (e) {
      if (e.text.startsWith('{"icestudio":')) {
        // Prevent paste blocks
        e.text = '';
      }
    });
    this.editor.on('mousewheel', function (event) {
      // Stop mousewheel event propagation when target is active
      if (document.activeElement.parentNode.id === self.editorSelector.attr('id')) {
        // Enable only scroll
        event.stopPropagation();
      }
      else {
        // Enable only zoom
        event.preventDefault();
      }
    });

    this.setupResizer();

    // Apply data
    this.apply({ ini: true });
  },

  applyValue: function (opt) {
    this.updating = true;

    var dontselect = false;
    var data = this.model.get('data');
    var deltas = this.model.get('deltas');

    opt = opt || {};

    switch (opt.attribute) {
      case 'deltas':
        if (deltas) {
          var changes = [{
            group: 'doc',
            deltas: deltas
          }];
          if (opt.undo) {
            this.editor.session.undoChanges(changes, dontselect);
          }
          else {
            this.editor.session.redoChanges(changes, dontselect);
          }
        }
        break;
      case 'data':
        break;
      default:
        break;
    }
    if (opt.ini) {
      this.editor.session.setValue(data.code);
    }
    else {
      // Set data.code
      this.model.attributes.data.code = this.editor.session.getValue();
    }
    setTimeout(function (self) {
      self.updating = false;
    }, 10, this);
  },

  apply: function (opt) {
    this.applyValue(opt);
    if (this.editor) {
      this.editor.resize();
    }
  },

  setAnnotation: function (codeError) {
    this.editor.gotoLine(codeError.line);
    var annotations = this.editor.session.getAnnotations();
    annotations.push({
      row: codeError.line - 1,
      column: 0,
      text: codeError.msg,
      type: codeError.type
    });
    this.editor.session.setAnnotations(annotations);

    var self = this;
    var state = this.model.get('state');
    var annotationSize = Math.round(15 * state.zoom) + 'px';
    setTimeout(function () {
      self.$box.find('.ace_error').css('background-size', annotationSize + ' ' + annotationSize);
      self.$box.find('.ace_warning').css('background-size', annotationSize + ' ' + annotationSize);
      self.$box.find('.ace_info').css('background-size', annotationSize + ' ' + annotationSize);
    }, 0);
  },

  clearAnnotations: function () {
    this.editor.session.clearAnnotations();
  },

  update: function () {
    this.renderPorts();
    this.editor.setReadOnly(this.model.get('disabled'));
    joint.dia.ElementView.prototype.update.apply(this, arguments);
  },

  updateBox: function () {
    var pendingTasks = [];
    var i, j, port, portDefault, tokId, paths, rects, dome, anotations;
    var bbox = this.model.getBBox();
    var data = this.model.get('data');
    var state = this.model.get('state');
    var rules = this.model.get('rules');
    var leftPorts = this.model.get('leftPorts');
    var rightPorts = this.model.get('rightPorts');
    var modelId = this.model.id;
    var editorUpdated = false;
    // Set font size
    if (this.editor) {
      if (this.prevZoom !== state.zoom) {
        editorUpdated = true;
        this.prevZoom = state.zoom;
        // Scale editor
        for (i = 0; i < this.nativeDom.editorSelector.length; i++) {
          pendingTasks.push({ e: this.nativeDom.editorSelector[i], property: 'margin', value: (7 * state.zoom) + 'px' });
          pendingTasks.push({ e: this.nativeDom.editorSelector[i], property: 'border-radius', value: (5 * state.zoom) + 'px' });
          pendingTasks.push({ e: this.nativeDom.editorSelector[i], property: 'border-width', value: (state.zoom + 0.5) });
        }

        // Scale annotations
        var annotationSize = Math.round(15 * state.zoom) + 'px';

        anotations = this.$box[0].querySelectorAll('.ace_error');
        for (i = 0; i < anotations.length; i++) {
          pendingTasks.push({ e: anotations[i], property: 'background-size', value: annotationSize + ' ' + annotationSize });
        }
        anotations = this.$box[0].querySelectorAll('.ace_warning');
        for (i = 0; i < anotations.length; i++) {
          pendingTasks.push({ e: anotations[i], property: 'background-size', value: annotationSize + ' ' + annotationSize });
        }

        anotations = this.$box[0].querySelectorAll('.ace_info');
        for (i = 0; i < anotations.length; i++) {
          pendingTasks.push({ e: anotations[i], property: 'background-size', value: annotationSize + ' ' + annotationSize });
        }


        // Scale padding
        anotations = this.$box[0].querySelectorAll('.ace_text-layer');
        for (i = 0; i < anotations.length; i++) {
          pendingTasks.push({ e: anotations[i], property: 'padding', value: '0px ' + Math.round(4 * state.zoom) + 'px' });
        }

        //var rule = getCSSRule('.ace_folding-enabled > .ace_gutter-cell');


      }
      //    this.editor.resize();
    
    }

    // Set ports width
    var width = WIRE_WIDTH * state.zoom;

    var pwires = this.$el[0].getElementsByClassName('port-wire');
    for (i = 0; i < pwires.length; i++) {
      pendingTasks.push({ e: pwires[i], property: 'stroke-width', value: width + 'px' });
    }
    // Set buses
    var nwidth = width * 3;
    tokId = 'port-wire-' + modelId + '-';
    for (i = 0; i < leftPorts.length; i++) {
      port = leftPorts[i];
      if (port.size > 1) {

        dome = document.getElementById(tokId + port.id);

        pendingTasks.push({ e: dome, property: 'stroke-width', value: nwidth + 'px' });

      }
    }

    for (i = 0; i < rightPorts.length; i++) {
      port = rightPorts[i];
      if (port.size > 1) {

        dome = document.getElementById(tokId + port.id);

        pendingTasks.push({ e: dome, property: 'stroke-width', value: nwidth + 'px' });


      }
    }

    // Render rules
    if (data && data.ports && data.ports.in) {
      tokId = 'port-default-' + modelId + '-';
      for (i = 0; i < data.ports.in.length; i++) {
        port = data.ports.in[i];
        portDefault = document.getElementById(tokId + port.name);
        if (portDefault !== null && rules && port.default && port.default.apply) {

          pendingTasks.push({ e: portDefault, property: 'display', value: 'inline' });

          paths = portDefault.querySelectorAll('path');
          for (j = 0; j < paths.length; j++) {
            pendingTasks.push({ e: paths[j], property: 'stroke-width', value: width + 'px' });
          }
          rects = portDefault.querySelectorAll('rect');
          for (j = 0; j < rects.length; j++) {
            pendingTasks.push({ e: rects[j], property: 'stroke-width', value: state.zoom + 'px' });
          }


        }
        else {

          pendingTasks.push({ e: portDefault, property: 'display', value: 'none' });
        }
      }
    }

    // Render content
    for (i = 0; i < this.nativeDom.contentSelector.length; i++) {
      pendingTasks.push({ e: this.nativeDom.contentSelector[i], property: 'left', value: Math.round(bbox.width / 2.0 * (state.zoom - 1)) + 'px' });
      pendingTasks.push({ e: this.nativeDom.contentSelector[i], property: 'top', value: Math.round(bbox.height / 2.0 * (state.zoom - 1)) + 'px' });
      pendingTasks.push({ e: this.nativeDom.contentSelector[i], property: 'width', value: Math.round(bbox.width) + 'px' });
      pendingTasks.push({ e: this.nativeDom.contentSelector[i], property: 'height', value: Math.round(bbox.height) + 'px' });
      pendingTasks.push({ e: this.nativeDom.contentSelector[i], property: 'transform', value: 'scale(' + state.zoom + ')' });
    }


    // Render block
    pendingTasks.push({ e: this.nativeDom.box, property: 'left', value: Math.round(bbox.x * state.zoom + state.pan.x) + 'px' });
    pendingTasks.push({ e: this.nativeDom.box, property: 'top', value: Math.round(bbox.y * state.zoom + state.pan.y) + 'px' });
    pendingTasks.push({ e: this.nativeDom.box, property: 'width', value: Math.round(bbox.width * state.zoom) + 'px' });
    pendingTasks.push({ e: this.nativeDom.box, property: 'height', value: Math.round(bbox.height * state.zoom) + 'px' });


    i = pendingTasks.length;
    for (i = 0; i < pendingTasks.length; i++) {

      if (pendingTasks[i].e !== null) {

        pendingTasks[i].e.style[pendingTasks[i].property] = pendingTasks[i].value;
      }
    }

    if (this.editor) {
      if (editorUpdated) {
        this.editor.setFontSize(Math.round(aceFontSize * state.zoom));
        this.editor.renderer.$cursorLayer.$padding = Math.round(4 * state.zoom);

      }
      this.editor.resize();
    }


    return pendingTasks;


  }
});


// Info block

joint.shapes.ice.Info = joint.shapes.ice.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'ice.Info',
    size: {
      width: 400,
      height: 256
    }
  }, joint.shapes.ice.Model.prototype.defaults)
});

joint.shapes.ice.InfoView = joint.shapes.ice.ModelView.extend({

  initialize: function () {
    _.bindAll(this, 'updateBox');
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    var id = sha1(this.model.get('id')).toString().substring(0, 6);
    var editorLabel = 'editor' + id;
    var readonly = this.model.get('data').readonly;
    this.$box = $(joint.util.template(
      '\
      <div class="info-block">\
        <div class="info-render markdown-body' + (readonly ? '' : ' hidden') + '"></div>\
        <div class="info-content' + (readonly ? ' hidden' : '') + '"></div>\
        <div class="info-editor' + (readonly ? ' hidden' : '') + '" id="' + editorLabel + '"></div>\
        <script>\
          var ' + editorLabel + ' = ace.edit("' + editorLabel + '");\
          ' + editorLabel + '.setTheme("ace/theme/chrome");\
          ' + editorLabel + '.setHighlightActiveLine(false);\
          ' + editorLabel + '.setShowPrintMargin(false);\
          ' + editorLabel + '.setAutoScrollEditorIntoView(true);\
          ' + editorLabel + '.renderer.setShowGutter(false);\
          ' + editorLabel + '.renderer.$cursorLayer.element.style.opacity = 0;\
          ' + editorLabel + '.session.setMode("ace/mode/markdown");\
        </script>\
        <div class="resizer"/></div>\
      </div>\
      '
    )());

    this.renderSelector = this.$box.find('.info-render');
    this.editorSelector = this.$box.find('.info-editor');
    this.contentSelector = this.$box.find('.info-content');

    this.model.on('change', this.updateBox, this);
    this.model.on('remove', this.removeBox, this);

    // Prevent paper from handling pointerdown.
    this.editorSelector.on('mousedown click', function (event) { event.stopPropagation(); });

    this.updateBox();

    this.updating = false;
    this.deltas = [];
    this.counter = 0;
    this.timer = null;
    var undoGroupingInterval = 200;

    var self = this;
    this.editor = ace.edit(this.editorSelector[0]);
    this.updateScrollStatus(false);
    this.editor.$blockScrolling = Infinity;
    this.editor.commands.removeCommand('undo');
    this.editor.commands.removeCommand('redo');
    this.editor.commands.removeCommand('touppercase');
    this.editor.session.on('change', function (delta) {
      if (!self.updating) {
        // Check consecutive-change interval
        if (Date.now() - self.counter < undoGroupingInterval) {
          clearTimeout(self.timer);
        }
        // Update deltas
        self.deltas = self.deltas.concat([delta]);
        // Launch timer
        self.timer = setTimeout(function () {
          var deltas = JSON.parse(JSON.stringify(self.deltas));
          // Set deltas
          self.model.set('deltas', deltas);
          // Reset deltas
          self.deltas = [];
          // Set data.code
          self.model.attributes.data.info = self.editor.session.getValue();
        }, undoGroupingInterval);
        // Reset counter
        self.counter = Date.now();
      }
    });
    this.editor.on('focus', function () {
      self.updateScrollStatus(true);
      $(document).trigger('disableSelected');
      self.editor.setHighlightActiveLine(true);
      // Show cursor
      self.editor.renderer.$cursorLayer.element.style.opacity = 1;
    });
    this.editor.on('blur', function () {
      self.updateScrollStatus(false);
      var selection = self.editor.session.selection;
      if (selection) {
        selection.clearSelection();
      }
      self.editor.setHighlightActiveLine(false);
      // Hide cursor
      self.editor.renderer.$cursorLayer.element.style.opacity = 0;
    });
    this.editor.on('paste', function (e) {
      if (e.text.startsWith('{"icestudio":')) {
        // Prevent paste blocks
        e.text = '';
      }
    });
    this.editor.on('mousewheel', function (event) {
      // Stop mousewheel event propagation when target is active
      if (document.activeElement.parentNode.id === self.editorSelector.attr('id')) {
        // Enable only scroll
        event.stopPropagation();
      }
      else {
        // Enable only zoom
        event.preventDefault();
      }
    });

    this.setupResizer();

    // Apply data
    this.apply({ ini: true });
  },

  applyValue: function (opt) {
    this.updating = true;

    var dontselect = false;
    var data = this.model.get('data');
    var deltas = this.model.get('deltas');

    opt = opt || {};

    switch (opt.attribute) {
      case 'deltas':
        if (deltas) {
          var changes = [{
            group: 'doc',
            deltas: deltas
          }];
          if (opt.undo) {
            this.editor.session.undoChanges(changes, dontselect);
          }
          else {
            this.editor.session.redoChanges(changes, dontselect);
          }
        }
        break;
      case 'data':
        break;
      default:
        break;
    }
    if (opt.ini) {
      this.editor.session.setValue(data.info);
    }
    else {
      // Set data.info
      this.model.attributes.data.info = this.editor.session.getValue();
    }
    setTimeout(function (self) {
      self.updating = false;
    }, 10, this);
  },

  applyReadonly: function () {
    var readonly = this.model.get('data').readonly;
    if (readonly) {
      this.$box.addClass('info-block-readonly');
      this.renderSelector.removeClass('hidden');
      this.editorSelector.addClass('hidden');
      this.contentSelector.addClass('hidden');
      this.disableResizer();
      // Clear selection
      var selection = this.editor.session.selection;
      if (selection) {
        selection.clearSelection();
      }
      this.applyText();
    }
    else {
      this.$box.removeClass('info-block-readonly');
      this.renderSelector.addClass('hidden');
      this.editorSelector.removeClass('hidden');
      this.contentSelector.removeClass('hidden');
      this.enableResizer();
    }
  },

  applyText: function () {
    var data = this.model.get('data');
    var markdown = data.text || data.info || '';

    // Replace emojis
    markdown = markdown.replace(/(:.*:)/g, function (match) {
      return emoji.emojify(match, null, function (code, name) {
        var source = 'https://github.global.ssl.fastly.net/images/icons/emoji/' + name + '.png';
        return ' <object data="' + source + '" type="image/png" width="20" height="20">' + code + '</object>';
      });
    });

    // Apply Marked to convert from Markdown to HTML
    this.renderSelector.html(marked(markdown));

    // Render task list
    this.renderSelector.find('li').each(function (index, element) {
      replaceCheckboxItem(element);
    });

    function replaceCheckboxItem(element) {
      listIterator(element);
      var child = $(element).children().first()[0];
      if (child && child.localName === 'p') {
        listIterator(child);
      }
    }

    function listIterator(element) {
      var $el = $(element);
      var label = $el.clone().children().remove('il, ul').end().html();
      var detached = $el.children('il, ul');

      if (/^\[\s\]/.test(label)) {
        $el.html(renderItemCheckbox(label, '')).append(detached);
      }
      else if (/^\[x\]/.test(label)) {
        $el.html(renderItemCheckbox(label, 'checked')).append(detached);
      }
    }

    function renderItemCheckbox(label, checked) {
      label = label.substring(3);
      return '<input type="checkbox" ' + checked + '/>' + label;
    }

    this.renderSelector.find('a').each(function (index, element) {
      element.onclick = function (event) {
        event.preventDefault();
        openurl.open(element.href);
      };
    });
  },

  apply: function (opt) {
    this.applyValue(opt);
    this.applyReadonly();
    this.updateBox();
    if (this.editor) {
      this.editor.resize();
    }
  },

  render: function () {
    joint.dia.ElementView.prototype.render.apply(this, arguments);
    this.paper.$el.append(this.$box);
    this.updateBox();
    return this;
  },

  update: function () {
    this.editor.setReadOnly(this.model.get('disabled'));
    joint.dia.ElementView.prototype.update.apply(this, arguments);
  },

  updateBox: function () {
    var bbox = this.model.getBBox();
    var state = this.model.get('state');
    var data = this.model.get('data');

    if (data.readonly) {
      // Scale render
      this.renderSelector.css({
        left: Math.round(bbox.width / 2.0 * (state.zoom - 1)),
        top: Math.round(bbox.height / 2.0 * (state.zoom - 1)),
        width: Math.round(bbox.width),
        height: Math.round(bbox.height),
        transform: 'scale(' + state.zoom + ')',
        'font-size': aceFontSize + 'px'
      });
    }
    else if (this.editor) {
      // Scale editor
      this.editorSelector.css({
        margin: 7 * state.zoom,
        'border-radius': 5 * state.zoom,
        'border-width': state.zoom + 0.5
      });
      // Scale padding
      this.$box.find('.ace_text-layer').css('padding', '0px ' + Math.round(4 * state.zoom) + 'px');
      // Scale font size
      this.editor.setFontSize(Math.round(aceFontSize * state.zoom));
      // Scale cursor
      this.editor.renderer.$cursorLayer.$padding = Math.round(4 * state.zoom);
      this.editor.resize();
    }

    // Render content
    this.contentSelector.css({
      left: Math.round(bbox.width / 2.0 * (state.zoom - 1)),
      top: Math.round(bbox.height / 2.0 * (state.zoom - 1)),
      width: Math.round(bbox.width),
      height: Math.round(bbox.height),
      transform: 'scale(' + state.zoom + ')'
    });

    // Render block
    this.$box.css({
      left: bbox.x * state.zoom + state.pan.x,
      top: bbox.y * state.zoom + state.pan.y,
      width: bbox.width * state.zoom,
      height: bbox.height * state.zoom
    });
  },

  removeBox: function (/*event*/) {
    // Remove delta to allow Session Value restore
    delete this.model.attributes.data.delta;
    this.$box.remove();
  }
});


// Custom wire

joint.shapes.ice.Wire = joint.dia.Link.extend({

  markup: [
    '<path class="connection" d="M 0 0 0 0"/>',
    '<path class="connection-wrap" d="M 0 0 0 0"/>',
    '<path class="marker-source" d="M 0 0 0 0"/>',
    '<path class="marker-target" d="M 0 0 0 0"/>',
    '<g class="labels"/>',
    '<g class="marker-vertices"/>',
    '<g class="marker-bifurcations"/>',
    '<g class="marker-arrowheads"/>',
    '<g class="link-tools"/>'
  ].join(''),

  labelMarkup: [
    '<g class="label hidden">',
    '<rect x="-8" y="-6" width="16" height="12" rx="2" ry="2" fill="white" stroke="#777"/>',
    '<text fill="#555"/>',
    '</g>'
  ].join(''),

  bifurcationMarkup: [
    '<g class="marker-bifurcation-group" transform="translate(<%= x %>, <%= y %>)">',
    '<circle class="marker-bifurcation" idx="<%= idx %>" r="<%= r %>" fill="#777"/>',
    '</g>'
  ].join(''),

  arrowheadMarkup: [
    '<g class="marker-arrowhead-group marker-arrowhead-group-<%= end %>">',
    '<circle class="marker-arrowhead" end="<%= end %>" r="8"/>',
    '</g>'
  ].join(''),

  toolMarkup: [
    '<g class="link-tool">',
    '<g class="tool-remove" event="remove">',
    '<circle r="8" />',
    '<path transform="scale(.6) translate(-16, -16)" d="M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z" />',
    '<title>Remove link</title>',
    '</g>',
    '</g>'
  ].join(''),

  vertexMarkup: [
    '<g class="marker-vertex-group" transform="translate(<%= x %>, <%= y %>)">',
    '<circle class="marker-vertex" idx="<%= idx %>" r="8" />',
    '<path class="marker-vertex-remove-area" idx="<%= idx %>" transform="scale(.8) translate(5, -33)" d="M16,5.333c-7.732,0-14,4.701-14,10.5c0,1.982,0.741,3.833,2.016,5.414L2,25.667l5.613-1.441c2.339,1.317,5.237,2.107,8.387,2.107c7.732,0,14-4.701,14-10.5C30,10.034,23.732,5.333,16,5.333z"/>',
    '<path class="marker-vertex-remove" idx="<%= idx %>" transform="scale(.6) translate(11.5, -39)" d="M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z">',
    '<title>Remove vertex</title>',
    '</path>',
    '</g>'
  ].join(''),

  defaults: joint.util.deepSupplement({

    type: 'ice.Wire',

    labels: [{
      position: 0.5,
      attrs: {
        text: {
          text: '',
          y: '4px',
          'font-weight': 'bold',
          'font-size': '11px',
          'text-anchor': 'middle'
        }
      }
    }],

    attrs: {
      '.connection': {
        'stroke-width': WIRE_WIDTH,
        stroke: '#777'
      }
    },

    router: { name: 'ice' },
    connector: { name: 'ice' }

  }, joint.dia.Link.prototype.defaults)

});

joint.shapes.ice.WireView = joint.dia.LinkView.extend({

  options: {
    shortLinkLength: 64,
    longLinkLength: 160,
    linkToolsOffset: 40
  },

  initialize: function () {
    joint.dia.LinkView.prototype.initialize.apply(this, arguments);

    var self = this;
    setTimeout(function () {
      var size = self.model.get('size');

      if (!size) { // New wire
        var i, port, portName = self.model.get('source').port;
        var rightPorts = self.sourceView.model.get('rightPorts');
        // Initialize wire properties
        for (i in rightPorts) {
          port = rightPorts[i];
          if (portName === port.id) {
            size = port.size;
            // For wire size connection validation
            self.model.attributes.size = size;
            break;
          }
        }
      }

      self.updateWireProperties(size);
      self.updateBifurcations();
    }, 0);
  },

  apply: function () {
    // No operation required
  },

  render: function () {
    joint.dia.LinkView.prototype.render.apply(this, arguments);
    return this;
  },

  remove: function () {
    joint.dia.LinkView.prototype.remove.apply(this, arguments);
    this.updateBifurcations();
    return this;
  },

  update: function () {
    joint.dia.LinkView.prototype.update.apply(this, arguments);
    this.updateBifurcations();
    return this;
  },

  renderLabels: function () {
    if (!this._V.labels) {
      return this;
    }

    this._labelCache = {};
    var $labels = $(this._V.labels.node).empty();

    var labels = this.model.get('labels') || [];
    if (!labels.length) {
      return this;
    }

    var labelTemplate = joint.util.template(this.model.get('labelMarkup') || this.model.labelMarkup);
    // This is a prepared instance of a vectorized SVGDOM node for the label element resulting from
    // compilation of the labelTemplate. The purpose is that all labels will just `clone()` this
    // node to create a duplicate.
    var labelNodeInstance = V(labelTemplate());

    _.each(labels, function (label, idx) {

      var labelNode = labelNodeInstance.clone().node;
      V(labelNode).attr('label-idx', idx);
      this._labelCache[idx] = V(labelNode);

      var $text = $(labelNode).find('text');
      var textAttributes = _.extend({ 'text-anchor': 'middle', 'font-size': 13 }, joint.util.getByPath(label, 'attrs/text', '/'));

      $text.attr(_.omit(textAttributes, 'text'));

      if (label.attrs.text.text) {
        $(labelNode).removeClass('hidden');
      }

      if (!_.isUndefined(textAttributes.text)) {
        V($text[0]).text(textAttributes.text + '', { annotations: textAttributes.annotations });
      }
      $labels.append(labelNode);

    }, this);

    return this;
  },

  updateToolsPosition: function () {
    if (!this._V.linkTools) {
      return this;
    }

    var scale = '';
    var offset = this.options.linkToolsOffset;
    var connectionLength = this.getConnectionLength();

    if (!_.isNaN(connectionLength)) {
      // If the link is too short, make the tools half the size and the offset twice as low.
      if (connectionLength < this.options.shortLinkLength) {
        scale = 'scale(.5)';
        offset /= 2;
      }

      var toolPosition = this.getPointAtLength(connectionLength - offset);
      this._toolCache.attr('transform', 'translate(' + toolPosition.x + ', ' + toolPosition.y + ') ' + scale);
    }

    return this;
  },

  updateWireProperties: function (size) {
    if (size > 1) {
      this.$('.connection').css('stroke-width', WIRE_WIDTH * 3);
      this.model.label(0, { attrs: { text: { text: size } } });
      this.model.bifurcationMarkup = this.model.bifurcationMarkup.replace(/<%= r %>/g, WIRE_WIDTH * 4);
    }
    else {
      this.model.bifurcationMarkup = this.model.bifurcationMarkup.replace(/<%= r %>/g, WIRE_WIDTH * 2);
    }
  },

  updateConnection: function (opt) {
    
    opt = opt || {};

    // Necessary path finding
    var route = this.route = this.findRoute(this.model.get('vertices') || [], opt);
    // finds all the connection points taking new vertices into account

    this._findConnectionPoints(route);
    var pathData = this.getPathData(route);

    // The markup needs to contain a `.connection`
    this._V.connection.attr('d', pathData.full);
    if (this._V.connectionWrap) {
      this._V.connectionWrap.attr('d', pathData.wrap);
    }

    this._translateAndAutoOrientArrows(this._V.markerSource, this._V.markerTarget);
  },

// cacheUpdateBifurcations:{},
  updateBifurcations: function () {
    if (this._V.markerBifurcations) {
      var self = this;
      var currentWire = this.model;
      var allWires = this.paper.model.getLinks();

      // Find all the wires in the same port
      var portWires = [];
      var wireSource=false;
      var cwireSource=false;
      var wireView=false;
      var markerBifurcations=false;

      for(var i=0,n=allWires.length;i<n;i++){
     
        wireSource = allWires[i].get('source');
        cwireSource = currentWire.get('source');
        if ((wireSource.id === cwireSource.id) &&
          (wireSource.port === cwireSource.port)) {
          // Wire with the same source of currentWire
          wireView = self.paper.findViewByModel(allWires[i]);
          // Clean the wire bifurcations
          markerBifurcations=$(wireView._V.markerBifurcations.node).empty();
          portWires.push({
            id: allWires[i].get('id'),
            view: wireView,
            markers: markerBifurcations
          });
        }
     
    }

      var points = [];

      // Update all the portWires combinations
      if (portWires.length > 0) {
        var markupTemplate = joint.util.template(
          this.model.get('bifurcationMarkup') ||
          this.model.bifurcationMarkup
        );
        var A,B,nW;
          for(A=0,nW=portWires.length;A<nW;A++){
//        _.each(portWires, function (wireA) {
          for(B=0;B<nW;B++){
 //         _.each(portWires, function (wireB) {
            if (portWires[A].id !== portWires[B].id) {
              // Not the same wire
              findBifurcations(portWires[A].view, portWires[B].view, portWires[A].markers);
            }
          }
        }
      }

      /* jshint -W082 */

      function findBifurcations(wireA, wireB, markersA) {
        // Find the corners in A that intersects with any B segment
        var vA = v(wireA);
        var vB = v(wireB);

        if (vA.length > 2) {
          for (var i = 1; i < vA.length - 1; i++) {
            if ((vA[i - 1].x !== vA[i + 1].x) && (vA[i - 1].y !== vA[i + 1].y)) {
              // vA[i] is a corner
              for (var j = 0; j < vB.length - 1; j++) {
                // Eval if intersects any segment of wire vB
                if (evalIntersection(vA[i], [vB[j], vB[j + 1]])) {
                  // Bifurcation found!
                  var point = vA[i];
                  if (!contains(point, points)) {
                    points.push(point);
                    markersA.append(V(markupTemplate(point)).node);
                  }
                }
              }
            }
          }
        }
      }

      function contains(point, points) {
        var found = false;
        var np=points.length;

        for(var i=0;i<np;i++) {
          if (points[i].x === point.x && points[i].y === point.y) {
            found = true;
            return;
          }
        }
        return found;
      }

      function v(wire) {
        var v = [];
        v.push(wire.sourcePoint);
        v = v.concat(wire.route);
        v.push({
          x: wire.targetPoint.x + 9,
          y: wire.targetPoint.y
        });
        return v;
      }

      function evalIntersection(point, segment) {
        if (segment[0].x === segment[1].x) {
          // Vertical
          return ((point.x === segment[0].x) &&
            (point.y > Math.min(segment[0].y, segment[1].y)) &&
            (point.y < Math.max(segment[0].y, segment[1].y)));
        }
        else {
          // Horizontal
          return ((point.y === segment[0].y) &&
            (point.x > Math.min(segment[0].x, segment[1].x)) &&
            (point.x < Math.max(segment[0].x, segment[1].x)));
        }
      }
    }

    /* jshint +W082 */

    return this;
  }

});

function getCSSRule(ruleName) {
  if (document.styleSheets) {
    for (var i = 0; i < document.styleSheets.length; i++) {
      var styleSheet = document.styleSheets[i];
      var ii = 0;
      var cssRule = false;
      do {
        if (styleSheet.cssRules) {
          cssRule = styleSheet.cssRules[ii];
        } else {
          cssRule = styleSheet.rules[ii];
        }
        if (cssRule) {
          if (cssRule.selectorText === ruleName) {
            return cssRule;
          }
        }
        ii++;
      } while (cssRule);
    }
  }
  return false;
}
