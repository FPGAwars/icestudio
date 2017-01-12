'use strict';

var os = require('os');
var sha1 = require('sha1');

const DARWIN = Boolean(os.platform().indexOf('darwin') > -1);

if (DARWIN) {
  var fontSize = '12';
}
else {
  var fontSize = '15';
}

// Model element

joint.shapes.ice = {};
joint.shapes.ice.Model = joint.shapes.basic.Generic.extend({

  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g class="leftPorts"/><g class="rightPorts"/><g class="topPorts"/><g class="bottomPorts"/></g>',
  portMarkup: '<g class="port port<%= id %>"><path id="port-wire-<%= port.id %>" class="port-wire"/><circle class="port-body"/><text class="port-label"/></g>',

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
      gridUnits: 1,
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
        fill: '#888'
      },
      '.port-wire': {
        stroke: '#888',
        'stroke-width': 2
      }
    }
  }, joint.shapes.basic.Generic.prototype.defaults),


  initialize: function() {
    this.updatePortsAttrs();
    this.on('change:leftPorts change:rightPorts change:topPorts change:bottomPorts', this.updatePortsAttrs, this);
    this.constructor.__super__.constructor.__super__.initialize.apply(this, arguments);
  },

  updatePortsAttrs: function(/*eventName*/) {
    if (this._portSelectors) {
      var newAttrs = _.omit(this.get('attrs'), this._portSelectors);
      this.set('attrs', newAttrs, { silent: true });
    }
    this._portSelectors = [];
    var attrs = {};

    _.each(['left', 'right', 'top', 'bottom'], function(type) {
      var port = type + 'Ports';
      _.each(this.get(port), function(portName, index, ports) {
          var portAttributes = this.getPortAttrs(portName, index, ports.length, '.' + port, type);
          this._portSelectors = this._portSelectors.concat(_.keys(portAttributes));
          _.extend(attrs, portAttributes);
      }, this);
    }, this);

    this.attr(attrs, { silent: true });
    this.processPorts();
    this.trigger('process:ports');
  },

  getPortAttrs: function(port, index, total, selector, type) {

    var attrs = {};

    var portClass = 'port' + index;
    var portSelector = selector + '>.' + portClass;
    var portLabelSelector = portSelector + '>.port-label';
    var portWireSelector = portSelector + '>.port-wire';
    var portBodySelector = portSelector + '>.port-body';

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

    if ((type === 'leftPorts') || (type === 'topPorts')) {
      attrs[portSelector]['pointer-events'] = 'none';
      attrs[portWireSelector]['pointer-events'] = 'none';
    }

    var pos = Math.round((index + 0.5) / total * port.gridUnits) / port.gridUnits;

    switch (type) {
      case 'left':
        attrs[portSelector]['ref-x'] = -16;
        attrs[portSelector]['ref-y'] = pos;
        attrs[portLabelSelector]['dx'] = 10;
        attrs[portLabelSelector]['y'] = -10;
        attrs[portLabelSelector]['text-anchor'] = 'end';
        attrs[portWireSelector]['y'] = pos;
        attrs[portWireSelector]['d'] = 'M 0 0 L 32 0';
        break;
      case 'right':
        attrs[portSelector]['ref-dx'] = 16;
        attrs[portSelector]['ref-y'] = pos;
        attrs[portLabelSelector]['dx'] = -10;
        attrs[portLabelSelector]['y'] = -10;
        attrs[portLabelSelector]['text-anchor'] = 'start';
        attrs[portWireSelector]['y'] = pos;
        attrs[portWireSelector]['d'] = 'M 0 0 L -32 0';
        break;
      case 'top':
        attrs[portSelector]['ref-y'] = -16;
        attrs[portSelector]['ref-x'] = pos;
        attrs[portLabelSelector]['dx'] = 10;
        attrs[portLabelSelector]['dy'] = 0;
        attrs[portLabelSelector]['text-anchor'] = 'start';
        attrs[portWireSelector]['x'] = pos;
        attrs[portWireSelector]['d'] = 'M 0 0 L 0 32';
        break;
      case 'bottom':
        attrs[portSelector]['ref-dy'] = 16;
        attrs[portSelector]['ref-x'] = pos;
        attrs[portLabelSelector]['dx'] = 10;
        attrs[portLabelSelector]['y'] = 0;
        attrs[portLabelSelector]['text-anchor'] = 'start';
        attrs[portWireSelector]['x'] = pos;
        attrs[portWireSelector]['d'] = 'M 0 0 L 0 -32';
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
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);
  },

  apply: function() {
    // No operation required
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
    var port, wireWidth;
    var bbox = this.model.getBBox();
    var state = this.model.get('state');
    var leftPorts = this.model.get('leftPorts');
    var rightPorts = this.model.get('rightPorts');

    // Render ports width
    this.$('.port-wire').css('stroke-width', 2 * state.zoom);
    for (var i in leftPorts) {
      port = leftPorts[i];
      wireWidth = (port.size > 1) ? 8 : 2;
      this.$('#port-wire-' + port.id).css('stroke-width', wireWidth * state.zoom);
    }
    for (var o in rightPorts) {
      port = rightPorts[o];
      wireWidth = (port.size > 1) ? 8 : 2;
      this.$('#port-wire-' + port.id).css('stroke-width', wireWidth * state.zoom);
    }

    /*if (this.$box.css('z-index') > this.model.attributes.zindex) {
      this.$box.css('z-index', ++this.model.attributes.zindex);
    }*/

    this.$box.css({
      left: bbox.x * state.zoom + state.pan.x + bbox.width / 2.0 * (state.zoom - 1),
      top: bbox.y * state.zoom + state.pan.y + bbox.height / 2.0 * (state.zoom - 1),
      width: bbox.width,
      height: bbox.height,
      transform: 'scale(' + state.zoom + ')'
    });
  },

  removeBox: function(/*evt*/) {
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

  template: '\
  <div class="generic-block">\
    <img>\
    <label></label>\
  </div>\
  ',

  initialize: function() {
    joint.shapes.ice.ModelView.prototype.initialize.apply(this, arguments);

    var image = this.model.get('image');
    var name = this.model.get('label');

    if (image) {
      this.$box.find('img').attr('src', 'data:image/svg+xml,' + image);
      this.$box.find('img').removeClass('hidden');
      this.$box.find('label').addClass('hidden');
    }
    else {
      this.$box.find('label').html(name);
      this.$box.find('img').addClass('hidden');
      this.$box.find('label').removeClass('hidden');
    }
    if (this.model.get('blockType').indexOf('config.') !== -1) {
      this.$box.addClass('config-block');
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

    if (data.pins) {
      for (var i in data.pins) {
        //selectCode += '<p style="top:' + (30 + 38*i) + 'px">' + this.pins[i].index + '</p>';
        selectCode +='<select id="' + comboId + data.pins[i].index + '"';
        selectCode += 'class="select2" i="' + i + '">';
        selectCode += '</select>';

        selectScript += '$("#' + comboId + data.pins[i].index + '").select2(';
        selectScript += '{placeholder: "", allowClear: true, dropdownCssClass: "bigdrop"});';
      }
    }

    this.$box = $(joint.util.template(
      '\
      <div class="virtual-port' + (virtual ? '' : ' hidden') + '" id="' + virtualPortId + '">\
        <label></label>\
      </div>\
      <div class="fpga-port' + (virtual ? ' hidden' : '') + '" id="' + fpgaPortId + '">\
        <label></label>\
        <div>' + selectCode + '</div>\
        <script>' + selectScript + '</script>\
      </div>\
      '
    )());

    // Prevent paper from handling pointerdown.
    var self = this;
    var comboSelector = this.$box.find('.select2');
    comboSelector.on('mousedown click', function(evt) { evt.stopPropagation(); });
    comboSelector.on('change', function(evt) {
      var target = $(evt.target);
      var i = target.attr('i');
      var name = target.find('option:selected').text();
      var value = target.val();
      var data = JSON.parse(JSON.stringify(self.model.get('data')));
      if (name !== null && value !== null) {
        data.pins[i].name = name;
        data.pins[i].value = value;
        self.model.set('data', data);
      }
      //comboSelector.find('.select2-selection').css('font-size', this.computeFontSize(name));
    });

    // Apply data
    if (!this.model.get('disabled')) {
      this.applyChoices();
      this.applyShape();
      this.applyValue();
    }
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

  applyValue: function() {
    var data = this.model.get('data');
    if (data.pins) {
      for (var i in data.pins) {
        var index = data.pins[i].index;
        var comboId = '#combo' + this.id + index;
        var comboSelector = this.$box.find(comboId);
        var value = data.pins[i].value;
        comboSelector.val(value).change();
        //var fontSize = this.computeFontSize(this.pins[i].name);
        //$('#select2-' + comboId + '-container').css('font-size', fontSize);
      }
    }
  },

  clearValue: function() {
    var data = this.model.get('data');
    if (data.pins) {
      for (var i in data.pins) {
        this.$box.find('#combo' + this.id + data.pins[i].index).val('');
        this.model.attributes.data.pins[i].name = '';
        this.model.attributes.data.pins[i].value = 0;
      }
    }
  },

  computeFontSize: function(name) {
    var n = name.length;
    return Math.min(13, 17-n).toString() + 'px';
  },

  apply: function() {
    this.applyShape();
    this.applyValue();
    this.render();
  },

  update: function() {
    this.renderPorts();
    joint.dia.ElementView.prototype.update.apply(this, arguments);
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
    <p>*</p>\
    <label></label>\
    <input class="constant-input"></input>\
  </div>\
  ',

  initialize: function() {
    joint.shapes.ice.ModelView.prototype.initialize.apply(this, arguments);

    // Prevent paper from handling pointerdown.
    var self = this;
    this.$box.find('.constant-input').on('mousedown click', function(evt) { evt.stopPropagation(); });
    this.$box.find('.constant-input').on('input', function(evt) {
      var target = $(evt.target);
      var data = JSON.parse(JSON.stringify(self.model.get('data')));
      data.value = target.val();
      self.model.set('data', data);
    });

    // Apply data
    this.apply();
  },

  applyName: function() {
    var name = this.model.get('data').name;
    this.$box.find('label').text(name);
  },

  applyValue: function() {
    if (this.model.get('disabled')) {
      this.$box.find('.constant-input').css({'pointer-events': 'none'});
    }
    var value = this.model.get('data').value;
    this.$box.find('.constant-input').val(value);
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
// Size: 64 * x

joint.shapes.ice.Code = joint.shapes.ice.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'ice.Code',
    size: {
      width: 384,
      height: 256
    },
    attrs: {
      '.body': {
        width: 384,
        height: 256
      }
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
          ' + editorLabel + '.setFontSize(' + fontSize + ');\
          ' + editorLabel + '.renderer.setShowGutter(true);\
          ' + editorLabel + '.setAutoScrollEditorIntoView(true);\
          ' + editorLabel + '.session.setMode("ace/mode/verilog");\
        </script>\
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
    selector.on('mousedown click', function(evt) { evt.stopPropagation(); });

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
        // Launch timer to
        self.timer = setTimeout(function() {
          // Set data
          var data = {
            code: self.editor.session.getValue(),
            deltas: self.deltas
          };
          self.model.set('data', data);
          // Reset deltas
          self.deltas = [];
        }, undoGroupingInterval);
        // Reset counter
        self.counter = Date.now();
      }
    });
    this.editor.on('focus', function() {
      $(document).trigger('disableSelected');
    });
    $('#' + blockLabel).resize(function() {
      self.editor.resize();
    });

    // Apply data
    this.apply();
  },

  applyValue: function(opt) {
    this.updating = true;
    var dontselect = false;
    var data = this.model.get('data');
    if (data.deltas && opt) {
      var changes = [{
        group: 'doc',
        deltas: data.deltas
      }];
      if (opt.undo) {
        this.editor.session.undoChanges(changes, dontselect);
      }
      else {
        this.editor.session.redoChanges(changes, dontselect);
      }
    }
    else {
      this.editor.session.setValue(data.code);
    }
    setTimeout(function(self) {
      self.updating = false;
    }, 10, this);
  },

  apply: function(opt) {
    this.applyValue(opt);
  },

  update: function() {
    this.renderPorts();
    this.editor.setReadOnly(this.model.get('disabled'));
    joint.dia.ElementView.prototype.update.apply(this, arguments);
  },

  updateBox: function() {
    var port, wireWidth;
    var bbox = this.model.getBBox();
    var state = this.model.get('state');
    var leftPorts = this.model.get('leftPorts');
    var rightPorts = this.model.get('rightPorts');

    // Render ports width
    this.$('.port-wire').css('stroke-width', 2 * state.zoom);
    for (var i in leftPorts) {
      port = leftPorts[i];
      wireWidth = (port.size > 1) ? 8 : 2;
      this.$('#port-wire-' + port.id).css('stroke-width', wireWidth * state.zoom);
    }
    for (var o in rightPorts) {
      port = rightPorts[o];
      wireWidth = (port.size > 1) ? 8 : 2;
      this.$('#port-wire-' + port.id).css('stroke-width', wireWidth * state.zoom);
    }

    this.$box.css({ width: bbox.width * state.zoom,
                    height: bbox.height * state.zoom,
                    left: bbox.x * state.zoom + state.pan.x,
                    top: bbox.y * state.zoom + state.pan.y });
                    // 'border-width': 2 * state.zoom: problem int instead of float
  }
});


// Info block

joint.shapes.ice.Info = joint.shapes.basic.Rect.extend({
  defaults: joint.util.deepSupplement({
    type: 'ice.Info',
    size: {
      width: 400,
      height: 256
    },
    attrs: {
      '.body': {
        width: 400,
        height: 256
      },
      rect: {
        stroke: 'none',
        'fill-opacity': 0
      }
    }
  }, joint.shapes.basic.Rect.prototype.defaults)
});

joint.shapes.ice.InfoView = joint.dia.ElementView.extend({

  initialize: function() {
    _.bindAll(this, 'updateBox');
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    var id = sha1(this.model.get('id')).toString().substring(0, 6);
    var blockLabel = 'block' + id;
    var editorLabel = 'editor' + id;
    this.$box = $(joint.util.template(
      '\
      <div class="info-block" id="' + blockLabel + '">\
        <div class="info-editor" id="' + editorLabel + '"></div>\
        <script>\
          var ' + editorLabel + ' = ace.edit("' + editorLabel + '");\
          ' + editorLabel + '.setTheme("ace/theme/chrome");\
          ' + editorLabel + '.setFontSize(' + fontSize + ');\
          ' + editorLabel + '.renderer.setShowGutter(false);\
          ' + editorLabel + '.setAutoScrollEditorIntoView(true);\
        </script>\
      </div>\
      '
    )());

    this.model.on('change', this.updateBox, this);
    this.model.on('remove', this.removeBox, this);

    this.updateBox();
    this.updating = false;

    var selector = this.$box.find('#' + editorLabel);

    // Prevent paper from handling pointerdown.
    selector.on('mousedown click', function(evt) { evt.stopPropagation(); });

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
        // Launch timer to
        self.timer = setTimeout(function() {
          // Set data
          var data = {
            info: self.editor.session.getValue(),
            deltas: self.deltas
          };
          self.model.set('data', data);
          // Reset deltas
          self.deltas = [];
        }, undoGroupingInterval);
        // Reset counter
        self.counter = Date.now();
      }
    });
    this.editor.on('focus', function() {
      $(document).trigger('disableSelected');
    });
    $('#' + blockLabel).resize(function() {
      self.editor.resize();
    });

    // Apply data
    this.apply();
  },

  applyValue: function(opt) {
    this.updating = true;
    var dontselect = false;
    var data = this.model.get('data');
    if (data.deltas && opt) {
      var changes = [{
        group: 'doc',
        deltas: data.deltas
      }];
      if (opt.undo) {
        this.editor.session.undoChanges(changes, dontselect);
      }
      else {
        this.editor.session.redoChanges(changes, dontselect);
      }
    }
    else {
      this.editor.session.setValue(data.info);
    }
    setTimeout(function(self) {
      self.updating = false;
    }, 10, this);
  },

  apply: function(opt) {
    this.applyValue(opt);
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

    this.$box.css({ width: bbox.width * state.zoom,
                    height: bbox.height * state.zoom,
                    left: bbox.x * state.zoom + state.pan.x,
                    top: bbox.y * state.zoom + state.pan.y });
  },

  remove: function() {
    // Remove delta to allow Session Value restore
    delete this.model.attributes.data.delta;
    joint.dia.LinkView.prototype.remove.apply(this, arguments);
  },

  removeBox: function(/*evt*/) {
    this.$box.remove();
  }
});


// Custom wire

joint.shapes.ice.Wire = joint.dia.Link.extend({

  markup: [
    '<path class="connection" stroke="black" d="M 0 0 0 0"/>',
    '<path class="connection-wrap" d="M 0 0 0 0"/>',
    '<path class="marker-source" d="M 0 0 0 0"/>',
    '<path class="marker-target" d="M 0 0 0 0"/>',
    '<g class="labels"/>',
    '<g class="marker-vertices"/>',
    '<g class="marker-bifurcations"/>',
    '<g class="marker-arrowheads"/>',
    '<g class="link-tools"/>'
  ].join(''),

  bifurcationMarkup: [
    '<g class="marker-bifurcation-group" transform="translate(<%= x %>, <%= y %>)">',
    '<circle class="marker-bifurcation" idx="<%= idx %>" r="<%= r %>" fill="#888"/>',
    '</g>'
  ].join(''),

  arrowheadMarkup: [
    '<g class="marker-arrowhead-group marker-arrowhead-group-<%= end %>">',
    '<circle class="marker-arrowhead" end="<%= end %>" r="8"/>',
    '</g>'
  ].join(''),

  defaults: joint.util.deepSupplement({

    type: 'ice.Wire',

    labels: [
      {
        position: 0.5,
        attrs: {
          text: {
            text: '',
            'font-weight': 'bold',
            'font-size': '150%',
            'y': '12px'
          }
        }
      }
    ],

    attrs: {
      '.connection': {
        'stroke-width': 2,
        stroke: '#888'
      },
      '.marker-vertex': { r: 8 }
    },

    router: { name: 'ice' },
    connector: { name: 'ice'},

  }, joint.dia.Link.prototype.defaults)

});

joint.shapes.ice.WireView = joint.dia.LinkView.extend({

  initialize: function() {
    joint.dia.LinkView.prototype.initialize.apply(this, arguments);

    var self = this;
    setTimeout(function() {
      var portName = self.model.get('source').port;
      var rightPorts = self.sourceView.model.get('rightPorts');

      // Initialize wire properties
      var port;
      for (var o in rightPorts) {
        port = rightPorts[o];
        if (portName === port.id) {
          self.model.attributes.size = port.size; // For wire size connection validation
          self.$('.connection').css('stroke-width', (port.size > 1) ? 8 : 2);
          self.model.label(0, {attrs: { text: { text: (port.size > 1) ? '' + port.size + '' : '' } } });
          self.model.bifurcationMarkup = self.model.bifurcationMarkup.replace(/<%= r %>/g, (port.size > 1) ? 8 : 4);
          self.update();
          break;
        }
      }
    }, 0);
  },

  apply: function() {
    this.render();
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
