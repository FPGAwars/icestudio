'use strict';

var os = require('os');
var sha1 = require('sha1');

const WIRE_WIDTH = 1.5;
const DARWIN = Boolean(os.platform().indexOf('darwin') > -1);

if (DARWIN) {
  var aceFontSize = '12';
}
else {
  var aceFontSize = '15';
}

// Model element

joint.shapes.ice = {};
joint.shapes.ice.Model = joint.shapes.basic.Generic.extend({

  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g class="leftPorts"/><g class="rightPorts"/><g class="topPorts"/><g class="bottomPorts"/></g>',
  portMarkup: '<g class="port port<%= id %>"> \
                 <g id="port-default-<%= port.id %>" class="port-default"><path id="port-default-wire-<%= port.id %>"/><rect id="port-default-rect-<%= port.id %>"/></g> \
                 <path id="port-wire-<%= port.id %>" class="port-wire"/> \
                 <circle class="port-body"/> \
                 <text class="port-label"/> \
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
        stroke: 'none',
        'fill-opacity': 0
      },
      '.port-body': {
        r: 8,
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
        x: '-40',
        y: '-10',
        width: '20',
        height: '20',
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


  initialize: function() {
    this.updatePortsAttrs();
    this.processPorts();
    this.trigger('process:ports');
    this.on('change:size change:leftPorts change:rightPorts change:topPorts change:bottomPorts', this.updatePortsAttrs, this);
    this.constructor.__super__.constructor.__super__.initialize.apply(this, arguments);
  },

  updatePortsAttrs: function(/*eventName*/) {
    if (this._portSelectors) {
      var newAttrs = _.omit(this.get('attrs'), this._portSelectors);
      this.set('attrs', newAttrs, { silent: true });
    }

    var attrs = {};
    this._portSelectors = [];

    _.each(['left', 'right'], function(type) {
      var port = type + 'Ports';
      _.each(this.get(port), function(portName, index, ports) {
          var portAttributes = this.getPortAttrs(portName, index, ports.length, '.' + port, type, this.get('size').height);
          this._portSelectors = this._portSelectors.concat(_.keys(portAttributes));
          _.extend(attrs, portAttributes);
      }, this);
    }, this);

    _.each(['top', 'bottom'], function(type) {
      var port = type + 'Ports';
      _.each(this.get(port), function(portName, index, ports) {
          var portAttributes = this.getPortAttrs(portName, index, ports.length, '.' + port, type, this.get('size').width);
          this._portSelectors = this._portSelectors.concat(_.keys(portAttributes));
          _.extend(attrs, portAttributes);
      }, this);
    }, this);

    this.attr(attrs, { silent: true });
  },

  getPortAttrs: function(port, index, total, selector, type, length) {

    var attrs = {};
    var gridsize = 8;
    var gridunits = length / gridsize;

    var portClass = 'port' + index;
    var portSelector = selector + '>.' + portClass;
    var portLabelSelector = portSelector + '>.port-label';
    var portWireSelector = portSelector + '>.port-wire';
    var portBodySelector = portSelector + '>.port-body';
    var portDefaultSelector = portSelector + '>.port-default';

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
        type: type
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
        attrs[portLabelSelector]['y'] = -5-offset;
        attrs[portLabelSelector]['text-anchor'] = 'end';
        attrs[portWireSelector]['y'] = position;
        attrs[portWireSelector]['d'] = 'M 0 0 L 16 0';
        break;
      case 'right':
        attrs[portSelector]['ref-dx'] = 8;
        attrs[portSelector]['ref-y'] = position;
        attrs[portLabelSelector]['dx'] = -4;
        attrs[portLabelSelector]['y'] = -5-offset;
        attrs[portLabelSelector]['text-anchor'] = 'start';
        attrs[portWireSelector]['y'] = position;
        attrs[portWireSelector]['d'] = 'M 0 0 L -16 0';
        break;
      case 'top':
        attrs[portSelector]['ref-y'] = -8;
        attrs[portSelector]['ref-x'] = position;
        attrs[portLabelSelector]['dx'] = 5+offset;
        attrs[portLabelSelector]['y'] = 2;
        attrs[portLabelSelector]['text-anchor'] = 'start';
        attrs[portWireSelector]['x'] = position;
        attrs[portWireSelector]['d'] = 'M 0 0 L 0 16';
        break;
      case 'bottom':
        attrs[portSelector]['ref-dy'] = 8;
        attrs[portSelector]['ref-x'] = position;
        attrs[portLabelSelector]['dx'] = 5+offset;
        attrs[portLabelSelector]['y'] = -2;
        attrs[portLabelSelector]['text-anchor'] = 'start';
        attrs[portWireSelector]['x'] = position;
        attrs[portWireSelector]['d'] = 'M 0 0 L 0 -16';
        break;
    }

    return attrs;
  }
});

joint.shapes.ice.ModelView = joint.dia.ElementView.extend({

  template: '',

  initialize: function() {
    _.bindAll(this, 'updateBox');
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    this.$box = $(joint.util.template(this.template)());

    this.model.on('change', this.updateBox, this);
    this.model.on('remove', this.removeBox, this);

    this.updateBox();

    this.listenTo(this.model, 'process:ports', this.update);
  },

  setupResizer: function() {
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

  enableResizer: function() {
    if (!this.model.get('disabled')) {
      this.resizerDisabled = false;
      this.resizer.css('cursor', 'se-resize');
    }
  },

  disableResizer: function() {
    if (!this.model.get('disabled')) {
      this.resizerDisabled = true;
      this.resizer.css('cursor', 'move');
    }
  },

  apply: function() {
  },

  updateContent: function() {
  },

  startResizing: function(event) {
    var self = event.data.self;

    if (self.resizerDisabled) {
      return;
    }

    self.model.graph.trigger('batch:start');

    self.resizing = true;
    self._clientX = event.clientX;
    self._clientY = event.clientY;
  },

  performResizing: function(event) {
    var self = event.data.self;

    if (!self.resizing || self.resizerDisabled) {
      return;
    }

    var size = self.model.get('size');
    var state = self.model.get('state');
    var gridstep = 8 * 2;
    var minSize = { width: 64, height: 32 };

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
    self.updateContent();

    function snapToGrid(coords) {
      return {
        x: Math.round(coords.x / state.zoom / gridstep) * gridstep,
        y: Math.round(coords.y / state.zoom / gridstep) * gridstep
      };
    }
  },

  stopResizing: function(event) {
    var self = event.data.self;

    if (!self.resizing || self.resizerDisabled) {
      return;
    }

    self.resizing = false;
    self.model.graph.trigger('batch:stop');
  },

  render: function() {
    joint.dia.ElementView.prototype.render.apply(this, arguments);
    this.paper.$el.append(this.$box);
    this.updateBox();
    return this;
  },

  renderPorts: function() {
    var $leftPorts = this.$('.leftPorts').empty();
    var $rightPorts = this.$('.rightPorts').empty();
    var $topPorts = this.$('.topPorts').empty();
    var $bottomPorts = this.$('.bottomPorts').empty();
    var portTemplate = _.template(this.model.portMarkup);

    _.each(_.filter(this.model.ports, function(p) { return p.type === 'left'; }), function(port, index) {
      $leftPorts.append(V(portTemplate({ id: index, port: port })).node);
    });
    _.each(_.filter(this.model.ports, function(p) { return p.type === 'right'; }), function(port, index) {
      $rightPorts.append(V(portTemplate({ id: index, port: port })).node);
    });
    _.each(_.filter(this.model.ports, function(p) { return p.type === 'top'; }), function(port, index) {
      $topPorts.append(V(portTemplate({ id: index, port: port })).node);
    });
    _.each(_.filter(this.model.ports, function(p) { return p.type === 'bottom'; }), function(port, index) {
      $bottomPorts.append(V(portTemplate({ id: index, port: port })).node);
    });
  },

  update: function() {
    this.renderPorts();
    joint.dia.ElementView.prototype.update.apply(this, arguments);
  },

  updateBox: function() {
    var i, port;
    var bbox = this.model.getBBox();
    var data = this.model.get('data');
    var state = this.model.get('state');
    var rules = this.model.get('rules');
    var leftPorts = this.model.get('leftPorts');
    var rightPorts = this.model.get('rightPorts');

    // Render ports width
    var width = WIRE_WIDTH * state.zoom;
    this.$('.port-wire').css('stroke-width', width);
    // Set buses
    for (i in leftPorts) {
      port = leftPorts[i];
      if (port.size > 1) {
        this.$('#port-wire-' + port.id).css('stroke-width', width * 3);
      }
    }
    for (i in rightPorts) {
      port = rightPorts[i];
      if (port.size > 1) {
        this.$('#port-wire-' + port.id).css('stroke-width', width * 3);
      }
    }
    // Render rules
    if (data && data.ports && data.ports.in) {
      for (i in data.ports.in) {
        port = data.ports.in[i];
        if (rules && port.default && port.default.apply) {
          this.$('#port-default-' + port.name).css('display', 'inline');
          this.$('#port-default-wire-' + port.name).css('stroke-width', width);
          this.$('#port-default-rect-' + port.name).css('stroke-width', state.zoom);
        }
        else {
          this.$('#port-default-' + port.name).css('display', 'none');
        }
      }
    }

    this.$box.css({
      left: bbox.x * state.zoom + state.pan.x + bbox.width / 2.0 * (state.zoom - 1),
      top: bbox.y * state.zoom + state.pan.y + bbox.height / 2.0 * (state.zoom - 1),
      width: bbox.width,
      height: bbox.height,
      transform: 'scale(' + state.zoom + ')'
    });
  },

  removeBox: function(/*event*/) {
    this.$box.remove();
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
    <div class="img-container"><img></div>\
    <label></label>\
    <span class="tooltiptext"></span>\
  </div>\
  ',

  events: {
    'mouseover': 'mouseovercard',
    'mouseout': 'mouseoutcard',
    'mouseup': 'mouseupcard',
    'mousedown': 'mousedowncard'
  },

  enter: false,
  down: false,
  timer: null,

  mouseovercard: function(/*event, x, y*/) {
    if (this.tooltip) {
      this.enter = true;
      var self = this;
      this.timer = setTimeout(function() {
        if (self.enter && !self.down) {
          self.tooltiptext.text(self.tooltip);
          self.tooltiptext.css('visibility', 'visible');
          if (self.tooltip.length > 30) {
            self.tooltiptext.addClass('tooltip-large');
          }
          else {
            self.tooltiptext.removeClass('tooltip-large');
          }
        }
      }, 1000);
    }
  },

  mouseoutcard: function(/*event, x, y*/) {
    if (this.tooltip) {
      this.enter = false;
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.tooltiptext.css('visibility', 'hidden');
    }
  },

  mouseupcard: function(/*event, x, y*/) {
    this.down = false;
    this.mouseovercard();
  },

  mousedowncard: function(/*event, x, y*/) {
    this.down = true;
    this.mouseoutcard();
  },

  initialize: function() {
    joint.shapes.ice.ModelView.prototype.initialize.apply(this, arguments);

    this.tooltip = this.model.get('tooltip');
    this.tooltiptext = this.$box.find('.tooltiptext');

    if (this.model.get('config')) {
      this.$box.addClass('config-block');
    }

    // Initialize content
    this.initializeContent();
  },

  initializeContent: function() {
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
    for (var i in ports) {
      var port = ports[i];
      if (port.clock) {
        var top = Math.round((parseInt(i) + 0.5) * height / n / gridsize) * gridsize - 10;
        this.$box.append('\
          <div class="clock" style="top: ' + top + 'px; left: -1px;">\
            <svg width="12" height="12"><path d="M.0.0l12 6-12 6" fill="none" stroke="#555" stroke-width="1.2"/>\
          </div>');
      }
    }
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


joint.shapes.ice.IOView = joint.shapes.ice.ModelView.extend({

  initialize: function() {
    joint.shapes.ice.ModelView.prototype.initialize.apply(this, arguments);

    this.id = sha1(this.model.get('id')).toString().substring(0, 6);
    var virtualPortId = 'virtualPort' + this.id;
    var fpgaPortId = 'fpgaPort' + this.id;
    var comboId = 'combo' + this.id;
    var virtual = this.model.get('data').virtual || this.model.get('disabled');

    var selectCode = '';
    var selectScript = '';
    var data = this.model.get('data');
    var name = data.name + (data.range || '');

    if (data.pins) {
      for (var i in data.pins) {
        selectCode +='<select id="' + comboId + data.pins[i].index + '"';
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
      <div class="virtual-port' + (virtual ? '' : ' hidden') + '" id="' + virtualPortId + '">\
        <p>&gt;</p>\
        <label>' + name + '</label>\
      </div>\
      <div class="fpga-port' + (virtual ? ' hidden' : '') + '" id="' + fpgaPortId + '">\
        <p>&gt;</p>\
        <label>' + name + '</label>\
        <div>' + selectCode + '</div>\
        <script>' + selectScript + '</script>\
      </div>\
      '
    )());

    this.updating = false;

    // Prevent paper from handling pointerdown.
    var self = this;
    var selector = this.$box.find('.select2');
    selector.on('mousedown click', function(event) { event.stopPropagation(); });
    selector.on('change', function(event) {
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

    // Apply data
    if (!this.model.get('disabled')) {
      this.applyChoices();
      this.applyValues();
      this.applyShape();
    }
    this.applyClock();
  },

  applyShape: function() {
    var virtualPortId = '#virtualPort' + this.id;
    var fpgaPortId = '#fpgaPort' + this.id;
    var data = this.model.get('data');
    var name = data.name + (data.range || '');
    var virtual = data.virtual || this.model.get('disabled');

    this.$box.find('label').text(name || '');

    if (virtual) {
      // Virtual port (green)
      $(fpgaPortId).addClass('hidden');
      $(virtualPortId).removeClass('hidden');
      this.model.attributes.size.height = 64;
    }
    else {
      // FPGA I/O port (yellow)
      $(virtualPortId).addClass('hidden');
      $(fpgaPortId).removeClass('hidden');
      if (data.pins) {
        this.model.attributes.size.height = 32 + 32 * data.pins.length;
      }
    }
  },

  applyChoices: function() {
    var data = this.model.get('data');
    if (data.pins) {
      for (var i in data.pins) {
        this.$box.find('#combo' + this.id + data.pins[i].index).empty().append(this.model.get('choices'));
      }
    }
  },

  applyValues: function() {
    this.updating = true;
    var data = this.model.get('data');
    for (var i in data.pins) {
      var index = data.pins[i].index;
      var comboId = '#combo' + this.id + index;
      var comboSelector = this.$box.find(comboId);
      var value = data.pins[i].value;
      comboSelector.val(value).change();
    }
    this.updating = false;
  },

  applyClock: function() {
    if (this.model.get('data').clock) {
      this.$box.find('p').removeClass('hidden');
    }
    else {
      this.$box.find('p').addClass('hidden');
    }
  },

  clearValues: function() {
    this.updating = true;
    var name = '';
    var value = 0;
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

  apply: function() {
    this.applyChoices();
    this.applyValues();
    this.applyClock();
    this.applyShape();
    this.render();
  },

  update: function() {
    this.renderPorts();
    joint.dia.ElementView.prototype.update.apply(this, arguments);
  },

  removeBox: function() {
    // Close select options on remove
    this.$box.find('select').select2('close');
    this.$box.remove();
  }

});

joint.shapes.ice.InputView = joint.shapes.ice.IOView;
joint.shapes.ice.OutputView = joint.shapes.ice.IOView;


// Constant blocks

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

  template: '\
  <div class="constant-block">\
    <p>●</p>\
    <label></label>\
    <input class="constant-input"></input>\
  </div>\
  ',

  initialize: function() {
    joint.shapes.ice.ModelView.prototype.initialize.apply(this, arguments);

    this.updating = false;

    // Prevent paper from handling pointerdown.
    var self = this;
    var selector = this.$box.find('.constant-input');
    selector.on('mousedown click', function(event) { event.stopPropagation(); });
    selector.on('input', function(event) {
      if (!self.updating) {
        var target = $(event.target);
        var data = JSON.parse(JSON.stringify(self.model.get('data')));
        data.value = target.val();
        self.model.set('data', data);
      }
    });
    selector.on('paste', function(event) {
      var data = event.originalEvent.clipboardData.getData('text');
      if (data.startsWith('{"icestudio":')) {
        // Prevent paste blocks
        event.preventDefault();
      }
    });

    // Apply data
    this.apply();
  },

  applyName: function() {
    var name = this.model.get('data').name;
    this.$box.find('label').text(name);
  },

  applyValue: function() {
    this.updating = true;
    if (this.model.get('disabled')) {
      this.$box.find('.constant-input').css({'pointer-events': 'none'});
    }
    var value = this.model.get('data').value;
    this.$box.find('.constant-input').val(value);
    this.updating = false;
  },

  applyLocal: function() {
    if (this.model.get('data').local) {
      this.$box.find('p').removeClass('hidden');
    }
    else {
      this.$box.find('p').addClass('hidden');
    }
  },

  apply: function() {
    this.applyName();
    this.applyValue();
    this.applyLocal();
  },

  update: function() {
    this.renderPorts();
    joint.dia.ElementView.prototype.update.apply(this, arguments);
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

  initialize: function() {
    _.bindAll(this, 'updateBox');
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    var id = sha1(this.model.get('id')).toString().substring(0, 6);
    var blockLabel = 'block' + id;
    var editorLabel = 'editor' + id;
    this.$box = $(joint.util.template(
      '\
      <div class="code-block" id="' + blockLabel + '">\
        <div class="code-editor" id="' + editorLabel + '"></div>\
        <script>\
          var ' + editorLabel + ' = ace.edit("' + editorLabel + '");\
          ' + editorLabel + '.setTheme("ace/theme/chrome");\
          ' + editorLabel + '.renderer.setShowGutter(true);\
          ' + editorLabel + '.setAutoScrollEditorIntoView(true);\
          ' + editorLabel + '.session.setMode("ace/mode/verilog");\
        </script>\
        <div class="resizer"/>\
      </div>\
      '
    )());

    this.model.on('change', this.updateBox, this);
    this.model.on('remove', this.removeBox, this);

    this.updateBox();
    this.updating = false;

    this.listenTo(this.model, 'process:ports', this.update);
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    var selector = this.$box.find('#' + editorLabel);

    // Prevent paper from handling pointerdown.
    selector.on('mousedown click', function(event) { event.stopPropagation(); });

    this.deltas = [];
    this.counter = 0;
    this.timer = null;
    var undoGroupingInterval = 200;

    var self = this;
    this.editor = ace.edit(selector[0]);
    this.editor.$blockScrolling = Infinity;
    this.editor.commands.removeCommand('undo');
    this.editor.commands.removeCommand('redo');
    this.editor.session.on('change', function(delta) {
      if (!self.updating) {
        // Check consecutive-change interval
        if (Date.now() - self.counter < undoGroupingInterval) {
          clearTimeout(self.timer);
        }
        // Update deltas
        self.deltas = self.deltas.concat([delta]);
        // Launch timer
        self.timer = setTimeout(function() {
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
        self.editor.resize();
      }
    });
    this.editor.on('focus', function() {
      $(document).trigger('disableSelected');
      // Show cursor
      self.editor.renderer.$cursorLayer.element.style.opacity = 1;
    });
    this.editor.on('blur', function() {
      var selection = self.editor.session.selection;
      if (selection) {
        selection.clearSelection();
      }
      // Hide cursor
      self.editor.renderer.$cursorLayer.element.style.opacity = 0;
    });
    this.editor.on('paste', function(e) {
      if (e.text.startsWith('{"icestudio":')) {
        // Prevent paste blocks
        e.text = '';
      }
    });
    this.editor.on('mousewheel', function(event) {
      // Stop mousewheel event propagation when target is active
      if (document.activeElement.className === 'ace_text-input') { // TODO: is the same code block?
        // Enable only scroll
        event.stopPropagation();
      }
      else {
        // Enable only zoom
        event.stopImmediatePropagation();
      }
    });

    this.setupResizer();

    // Apply data
    this.apply({ ini: true });
  },

  applyValue: function(opt) {
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
    setTimeout(function(self) {
      self.updating = false;
    }, 10, this);
  },

  apply: function(opt) {
    this.applyValue(opt);
  },

  setAnnotation: function(codeError) {
    this.editor.gotoLine(codeError.line);
    var annotations = this.editor.session.getAnnotations();
    annotations.push({
      row: codeError.line-1,
      column: 0,
      text: codeError.msg,
      type: codeError.type
    });
    this.editor.session.setAnnotations(annotations);
  },

  clearAnnotations: function() {
    this.editor.session.clearAnnotations();
  },

  update: function() {
    this.renderPorts();
    this.editor.setReadOnly(this.model.get('disabled'));
    joint.dia.ElementView.prototype.update.apply(this, arguments);
  },

  updateBox: function() {
    var i, port;
    var bbox = this.model.getBBox();
    var data = this.model.get('data');
    var state = this.model.get('state');
    var rules = this.model.get('rules');
    var leftPorts = this.model.get('leftPorts');
    var rightPorts = this.model.get('rightPorts');

    // Set font size
    if (this.editor) {
      this.$box.find('.code-editor').css({
        margin: 8 * state.zoom,
        'border-radius': 5 * state.zoom
      });
      this.editor.setFontSize(Math.round(aceFontSize * state.zoom));
      this.editor.resize();
    }

    // Set ports width
    var width = WIRE_WIDTH * state.zoom;
    this.$('.port-wire').css('stroke-width', width);
    // Set buses
    for (i in leftPorts) {
      port = leftPorts[i];
      if (port.size > 1) {
        this.$('#port-wire-' + port.id).css('stroke-width', width * 3);
      }
    }
    for (i in rightPorts) {
      port = rightPorts[i];
      if (port.size > 1) {
        this.$('#port-wire-' + port.id).css('stroke-width', width * 3);
      }
    }
    // Render rules
    if (data && data.ports && data.ports.in) {
      for (i in data.ports.in) {
        port = data.ports.in[i];
        if (rules && port.default && port.default.apply) {
          this.$('#port-default-' + port.name).css('display', 'inline');
          this.$('#port-default-wire-' + port.name).css('stroke-width', width);
          this.$('#port-default-rect-' + port.name).css('stroke-width', state.zoom);
        }
        else {
          this.$('#port-default-' + port.name).css('display', 'none');
        }
      }
    }

    this.$box.css({
      'border-radius': 5 * state.zoom
    });
    this.$box.css({ width: bbox.width * state.zoom,
                    height: bbox.height * state.zoom,
                    left: bbox.x * state.zoom + state.pan.x,
                    top: bbox.y * state.zoom + state.pan.y });
                    // 'border-width': 2 * state.zoom: problem int instead of float
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

  initialize: function() {
    _.bindAll(this, 'updateBox');
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    var id = sha1(this.model.get('id')).toString().substring(0, 6);
    var blockLabel = 'block' + id;
    var textLabel = 'text' + id;
    var editorLabel = 'editor' + id;
    var readonly = this.model.get('data').readonly;
    this.$box = $(joint.util.template(
      '\
      <div class="info-block" id="' + blockLabel + '">\
        <div class="info-text ace_editor ace-chrome ' + (readonly ? '' : ' hidden') + '" " id="' + textLabel + '" style="font-size: ' + aceFontSize + 'px;">\
          <div class="ace_layer ace_text-layer" style="overflow: visible; padding: 0px 4px;"></div>\
        </div>\
        <div class="info-editor ' + (readonly ? ' hidden' : '') + '" id="' + editorLabel + '"></div>\
        <script>\
          var ' + editorLabel + ' = ace.edit("' + editorLabel + '");\
          ' + editorLabel + '.setTheme("ace/theme/chrome");\
          ' + editorLabel + '.renderer.setShowGutter(false);\
          ' + editorLabel + '.setHighlightActiveLine(false);\
          ' + editorLabel + '.setShowPrintMargin(false);\
          ' + editorLabel + '.setAutoScrollEditorIntoView(true);\
        </script>\
        <div class="resizer"/>\
      </div>\
      '
    )());

    this.model.on('change', this.updateBox, this);
    this.model.on('remove', this.removeBox, this);

    this.updateBox();
    this.updating = false;

    this.textSelector = this.$box.find('#' + textLabel);
    this.editorSelector = this.$box.find('#' + editorLabel);

    // Prevent paper from handling pointerdown.
    this.editorSelector.on('mousedown click', function(event) { event.stopPropagation(); });

    this.deltas = [];
    this.counter = 0;
    this.timer = null;
    var undoGroupingInterval = 200;

    var self = this;
    this.editor = ace.edit(this.editorSelector[0]);
    this.editor.$blockScrolling = Infinity;
    this.editor.commands.removeCommand('undo');
    this.editor.commands.removeCommand('redo');
    this.editor.session.on('change', function(delta) {
      if (!self.updating) {
        // Check consecutive-change interval
        if (Date.now() - self.counter < undoGroupingInterval) {
          clearTimeout(self.timer);
        }
        // Update deltas
        self.deltas = self.deltas.concat([delta]);
        // Launch timer
        self.timer = setTimeout(function() {
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
        self.editor.resize();
      }
    });
    this.editor.on('focus', function() {
      $(document).trigger('disableSelected');
      // Show cursor
      self.editor.renderer.$cursorLayer.element.style.opacity = 1;
    });
    this.editor.on('blur', function() {
      var selection = self.editor.session.selection;
      if (selection) {
        selection.clearSelection();
      }
      // Hide cursor
      self.editor.renderer.$cursorLayer.element.style.opacity = 0;
    });
    this.editor.on('paste', function(e) {
      if (e.text.startsWith('{"icestudio":')) {
        // Prevent paste blocks
        e.text = '';
      }
    });
    this.editor.on('mousewheel', function(event) {
      // Stop mousewheel event propagation when target is active
      if (document.activeElement.className === 'ace_text-input') { // TODO: is the same info block?
        // Enable only scroll
        event.stopPropagation();
      }
      else {
        // Enable only zoom
        event.stopImmediatePropagation();
      }
    });

    this.setupResizer();

    // Apply data
    this.apply({ ini: true });
  },

  applyValue: function(opt) {
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
      // Set data.code
      this.model.attributes.data.info = this.editor.session.getValue();
    }
    setTimeout(function(self) {
      self.updating = false;
    }, 10, this);
  },

  applyReadonly: function() {
    var readonly = this.model.get('data').readonly;
    if (readonly) {
      this.$box.addClass('info-block-readonly');
      this.textSelector.removeClass('hidden');
      this.editorSelector.addClass('hidden');
      this.disableResizer();
      // Hide cursor
      this.editor.renderer.$cursorLayer.element.style.opacity = 0;
      // Clear selection
      var selection = this.editor.session.selection;
      if (selection) {
        selection.clearSelection();
      }
    }
    else {
      this.$box.removeClass('info-block-readonly');
      this.textSelector.addClass('hidden');
      this.editorSelector.removeClass('hidden');
      this.enableResizer();
      // Show cursor
      this.editor.renderer.$cursorLayer.element.style.opacity = 1;
    }
  },

  applyText: function() {
    var data = this.model.get('data');
    this.textSelector.children().html(data.text || '');
  },

  apply: function(opt) {
    this.applyValue(opt);
    this.applyReadonly();
    this.applyText();
    this.updateBox();
  },

  render: function() {
    joint.dia.ElementView.prototype.render.apply(this, arguments);
    this.paper.$el.append(this.$box);
    this.updateBox();
    return this;
  },

  update: function() {
    this.editor.setReadOnly(this.model.get('disabled'));
    joint.dia.ElementView.prototype.update.apply(this, arguments);
  },

  updateBox: function() {
    var bbox = this.model.getBBox();
    var state = this.model.get('state');
    var data = this.model.get('data');

    if (data.readonly) {
      this.$box.find('.info-text').css({
        margin: 8 * state.zoom,
        'border-radius': 5 * state.zoom,
        fontSize: Math.round(aceFontSize * state.zoom)
      });
    }
    else if (this.editor) {
      this.$box.find('.info-editor').css({
        margin: 8 * state.zoom,
        'border-radius': 5 * state.zoom
      });
      this.editor.setFontSize(Math.round(aceFontSize * state.zoom));
      this.editor.resize();
    }

    this.$box.css({
      'border-radius': 5 * state.zoom
    });
    this.$box.css({ width: bbox.width * state.zoom,
                    height: bbox.height * state.zoom,
                    left: bbox.x * state.zoom + state.pan.x,
                    top: bbox.y * state.zoom + state.pan.y });
  },

  removeBox: function(/*event*/) {
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
    '<rect x="-8" y="-9" width="16" height="16" fill="white" stroke="#777"/>',
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
    '<circle class="marker-arrowhead" end="<%= end %>" r="6"/>',
    '</g>'
  ].join(''),

  toolMarkup: [
    '<g class="link-tool">',
    '<g class="tool-remove" event="remove">',
    '<circle r="8.5" />',
    '<path transform="scale(.6) translate(-16, -16)" d="M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z" />',
    '<title>Remove link.</title>',
    '</g>',
    '</g>'
  ].join(''),

  vertexMarkup: [
    '<g class="marker-vertex-group" transform="translate(<%= x %>, <%= y %>)">',
    '<circle class="marker-vertex" idx="<%= idx %>" r="8" />',
    '<path class="marker-vertex-remove-area" idx="<%= idx %>" transform="scale(.8) translate(5, -33)" d="M16,5.333c-7.732,0-14,4.701-14,10.5c0,1.982,0.741,3.833,2.016,5.414L2,25.667l5.613-1.441c2.339,1.317,5.237,2.107,8.387,2.107c7.732,0,14-4.701,14-10.5C30,10.034,23.732,5.333,16,5.333z"/>',
    '<path class="marker-vertex-remove" idx="<%= idx %>" transform="scale(.6) translate(11.5, -39)" d="M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z">',
    '<title>Remove vertex.</title>',
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
          'font-size': '13px',
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
    connector: { name: 'ice'},

  }, joint.dia.Link.prototype.defaults)

});

joint.shapes.ice.WireView = joint.dia.LinkView.extend({

  options: {
    shortLinkLength: 100,
    longLinkLength: 160,
    linkToolsOffset: 40,
  },

  initialize: function() {
    joint.dia.LinkView.prototype.initialize.apply(this, arguments);

    var self = this;
    setTimeout(function() {
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

  apply: function() {
    // No operation required
  },

  render: function() {
    joint.dia.LinkView.prototype.render.apply(this, arguments);
    // console.log('render');
    return this;
  },

  remove: function() {
    joint.dia.LinkView.prototype.remove.apply(this, arguments);
    // console.log('remove');
    this.updateBifurcations();
    return this;
  },

  update: function() {
    joint.dia.LinkView.prototype.update.apply(this, arguments);
    // console.log('update');
    this.updateBifurcations();
    return this;
  },

  renderLabels: function() {
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

    _.each(labels, function(label, idx) {

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

  updateToolsPosition: function() {
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

  updateWireProperties: function(size) {
    if (size > 1) {
      this.$('.connection').css('stroke-width', WIRE_WIDTH * 3);
      this.model.label(0, {attrs: { text: { text: size } } });
      this.model.bifurcationMarkup = this.model.bifurcationMarkup.replace(/<%= r %>/g, WIRE_WIDTH * 4);
    }
    else {
      this.model.bifurcationMarkup = this.model.bifurcationMarkup.replace(/<%= r %>/g, WIRE_WIDTH * 2);
    }
  },

  updateConnection: function(opt) {
    opt = opt || {};

    var model = this.model;
    var route;

    if (opt.translateBy && model.isRelationshipEmbeddedIn(opt.translateBy)) {
      // The link is being translated by an ancestor that will
      // shift source point, target point and all vertices
      // by an equal distance.
      var tx = opt.tx || 0;
      var ty = opt.ty || 0;

      route = this.route =  _.map(this.route, function(point) {
        // translate point by point by delta translation
        return g.point(point).offset(tx, ty);
      });

      // translate source and target connection and marker points.
      this._translateConnectionPoints(tx, ty);

    } else {
      // Necessary path finding
      route = this.route = this.findRoute(model.get('vertices') || [], opt);
      // finds all the connection points taking new vertices into account
      this._findConnectionPoints(route);
    }

    var pathData = this.getPathData(route);

    // The markup needs to contain a `.connection`
    this._V.connection.attr('d', pathData.full);
    if(this._V.connectionWrap) {
      this._V.connectionWrap.attr('d', pathData.wrap);
    }

    this._translateAndAutoOrientArrows(this._V.markerSource, this._V.markerTarget);
  },

  updateBifurcations: function() {
    if (this._V.markerBifurcations) {
      var self = this;
      var currentWire = this.model;
      var allWires = this.paper.model.getLinks();

      // Find all the wires in the same port
      var portWires = [];
      _.each(allWires, function(wire) {
        var wireSource = wire.get('source');
        var cwireSource = currentWire.get('source');
        if ((wireSource.id === cwireSource.id) &&
            (wireSource.port === cwireSource.port))
        {
          // Wire with the same source of currentWire
          var wireView = self.paper.findViewByModel(wire);
          // Clean the wire bifurcations
          var markerBifurcations = $(wireView._V.markerBifurcations.node).empty();
          portWires.push({
            id: wire.get('id'),
            view: wireView,
            markers: markerBifurcations
          });
        }
      });

      // Update all the portWires combinations
      if (portWires.length > 0) {
        var markupTemplate = joint.util.template(
          this.model.get('bifurcationMarkup') ||
          this.model.bifurcationMarkup
        );
        _.each(portWires, function(wireA) {
          _.each(portWires, function(wireB) {
            if (wireA.id !== wireB.id) {
              // Not the same wire
              findBifurcations(wireA.view, wireB.view, wireA.markers);
            }
          });
        });
      }

      /* jshint -W082 */

      function findBifurcations(wireA, wireB, markersA) {
        // Find the corners in A that intersects with any B segment
        var vA = v(wireA);
        var vB = v(wireB);

        if (vA.length > 2) {
          for (var i = 1; i < vA.length - 1; i++) {
            if ((vA[i-1].x !== vA[i+1].x) && (vA[i-1].y !== vA[i+1].y)) {
              // vA[i] is a corner
              for (var j = 0; j < vB.length - 1; j++) {
                // Eval if intersects any segment of wire vB
                if (evalIntersection(vA[i], [vB[j], vB[j+1]])) {
                  // Bifurcation found!
                  markersA.append(V(markupTemplate(vA[i])).node);
                }
              }
            }
          }
        }
      }

      function v(wire) {
        var v = [];
        v.push(wire.sourcePoint);
        v = v.concat(wire.route);
        v.push(wire.targetPoint);
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
