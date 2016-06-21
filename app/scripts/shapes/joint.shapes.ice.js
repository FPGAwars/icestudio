'use strict';

joint.shapes.ice = {};

joint.shapes.ice.Model = joint.shapes.basic.Generic.extend(_.extend({}, joint.shapes.basic.PortsModelInterface, {

  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><text class="block-label"/><g class="inPorts"/><g class="outPorts"/></g>',
  portMarkup: '<g class="port port<%= id %>"><path class="port-wire"/><circle class="port-body"/><text class="port-label"/></g>',

  defaults: joint.util.deepSupplement({

    type: 'ice.Model',
    size: { width: 1, height: 1 },
    inPorts: [],
    outPorts: [],
    choices: [],
    attrs: {
      '.': { magnet: false },
      text: {
        'pointer-events': 'none'
      },
      '.body': {
        width: 80,
        height: 80,
        stroke: '#000',
        rx: 3,
        ry: 5,
        'stroke-width': 2
      },
      '.port-body': {
        r: 10,
        magnet: true,
        stroke: '#000'
      },
      '.block-label': {
        ref: '.body',
        'ref-x': .5,
        'ref-y': 10,
        'font-size': 15,
        'text-anchor': 'middle',
        'font-weight': 'bold',
        fill: '#000'
      },
      '.inPorts .port-label': {
        x: 40,
        y: 4,
        'text-anchor': 'start',
        fill: '#000'
      },
      '.outPorts .port-label': {
        x: -40,
        y: 4,
        'text-anchor': 'end',
        fill: '#000'
      },
      '.port-wire': {
        stroke: '#000',
        'stroke-width': 2
      }
    }
  }, joint.shapes.basic.Generic.prototype.defaults),

  getPortAttrs: function(port, index, total, selector, type) {

    var attrs = {};

    var portClass = 'port' + index;
    var portSelector = selector + '>.' + portClass;
    var portLabelSelector = portSelector + '>.port-label';
    var portWireSelector = portSelector + '>.port-wire';
    var portBodySelector = portSelector + '>.port-body';

    attrs[portLabelSelector] = {
      text: (port) ? (port.label) ? port.label  : ''  : ''
    };

    attrs[portBodySelector] = {
      port: {
        id: (port) ? (port.name) : null  || _.uniqueId(type),
        type: type
      }
    };

    attrs[portSelector] = {
      ref: '.body',
      'ref-y': (index + 0.5) * (1 / total)
    };

    attrs[portWireSelector] = {
      y: (index + 0.5) * (1 / total)
    };

    if (type === 'in') {
      attrs[portSelector]['ref-x'] = -30;
      attrs[portWireSelector]['d'] = 'M 0 0 L 30 0';
    }
    else {
      attrs[portSelector]['ref-dx'] = 30;
      attrs[portWireSelector]['d'] = 'M 0 0 L -30 0';
    }

    return attrs;
  }
}));

joint.shapes.ice.Block = joint.shapes.ice.Model.extend({

  defaults: joint.util.deepSupplement({
    type: 'ice.Block',
    attrs: {
      '.body': {
        fill: '#C0DFEB'
      }
    }
  }, joint.shapes.ice.Model.prototype.defaults)
});

joint.shapes.ice.IO = joint.shapes.ice.Model.extend({

  defaults: joint.util.deepSupplement({
    type: 'ice.IO',
    attrs: {
      '.body': {
        fill: '#FAFAD2'
      }
    }
  }, joint.shapes.ice.Model.prototype.defaults)
});

joint.shapes.ice.Code = joint.shapes.ice.Model.extend({

  defaults: joint.util.deepSupplement({
    type: 'ice.Code',
    attrs: {
      '.body': {
        fill: '#C0DFEB'
      }
    }
  }, joint.shapes.ice.Model.prototype.defaults)
});

joint.shapes.ice.Wire = joint.dia.Link.extend({

  defaults: joint.util.deepSupplement({
    type: 'ice.Wire',
    router: { name: 'manhattan' },
    connector: { name: 'rounded', args: { radius: 5 }},
    attrs: {
      '.connection': {
        'stroke-width': 2
      }
    }
  }, joint.dia.Link.prototype.defaults)
});

joint.shapes.ice.ModelView = joint.dia.ElementView.extend(joint.shapes.basic.PortsViewInterface);
joint.shapes.ice.BlockView = joint.shapes.ice.ModelView;

joint.shapes.ice.IOView = joint.dia.ElementView.extend({

  template: [
      '<div class="io-element">',
      '<select class="io-combo select2"></select>',
      '<script>',
      '$(".select2").select2({placeholder: "", allowClear: true});',
      '</script>',
      '</div>'
  ].join(''),

  initialize: function() {
    _.bindAll(this, 'updateBox');
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    this.$box = $(_.template(this.template)());
    // Prevent paper from handling pointerdown.
    this.$box.find('select').on('mousedown click', function(evt) { evt.stopPropagation(); });

    this.$box.find('select').on('change', _.bind(function(evt) {
        this.model.attributes.data.value = $(evt.target).val();
    }, this));

    // Update the box position whenever the underlying model changes.
    this.model.on('change', this.updateBox, this);
    // Remove the box when the model gets removed from the graph.
    this.model.on('remove', this.removeBox, this);

    this.updateBox();

    this.listenTo(this.model, 'process:ports', this.update);
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);
  },

  render: function() {
    joint.dia.ElementView.prototype.render.apply(this, arguments);
    this.paper.$el.prepend(this.$box);
    this.updateBox();
    return this;
  },

  renderPorts: function () {
    var $inPorts = this.$('.inPorts').empty();
    var $outPorts = this.$('.outPorts').empty();

    var portTemplate = _.template(this.model.portMarkup);

    _.each(_.filter(this.model.ports, function (p) { return p.type === 'in' }), function (port, index) {

        $inPorts.append(V(portTemplate({ id: index, port: port })).node);
    });
    _.each(_.filter(this.model.ports, function (p) { return p.type === 'out' }), function (port, index) {

        $outPorts.append(V(portTemplate({ id: index, port: port })).node);
    });
  },

  renderChoices: function() {
    if (this.model.get('hidecombo')) {
      this.$box.find('select').removeClass('select2');
      this.$box.find('select').css({'display': 'none'});
    }
    else {
      var choices = this.model.get('choices');
      var $select = this.$box.find('.io-combo').empty();

      $select.append('<option></option>');
      for (var c in choices) {
        $select.append('<option>' + choices[c].name + '</option>');
      }

      this.$box.find('select').val(this.model.get('data').value);
    }
  },

  update: function () {
    // First render ports so that `attrs` can be applied to those newly created DOM elements
    // in `ElementView.prototype.update()`.
    this.renderPorts();
    this.renderChoices();

    joint.dia.ElementView.prototype.update.apply(this, arguments);
  },

  updateBox: function() {
    // Set the position and dimension of the box so that it covers the JointJS element.
    var bbox = this.model.getBBox()
    this.$box.css({ width: bbox.width, left: bbox.x + 10, top: bbox.y + 32 });
  },

  removeBox: function(evt) {
    this.$box.remove();
  }
});

joint.shapes.ice.CodeView = joint.dia.ElementView.extend({

  template: [
      '<div class="code-element">',
      '<div class="code-editor" id="editor"></div>',
      '<textarea class="hidden" id="content"></textarea>',
      '<script>',
      'var editor = ace.edit("editor");',
      'editor.setTheme("ace/theme/chrome");',
      'editor.getSession().setMode("ace/mode/verilog");',
      'editor.getSession().on("change", function () {',
      '  $("#content").val(editor.getSession().getValue());',
      '});',
      'document.getElementById("editor").style.fontSize="15px";',
      '</script>',
      '</div>'
  ].join(''),

  initialize: function() {
    _.bindAll(this, 'updateBox');
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);

    this.$box = $(_.template(this.template)());
    // Prevent paper from handling pointerdown.
    // this.$box.find('input').on('mousedown click', function(evt) { evt.stopPropagation(); });

    this.$box.find('#editor').append(this.model.attributes.data.code);
    this.$box.find('#content').append(this.model.attributes.data.code);

    // Update the box position whenever the underlying model changes.
    this.model.on('change', this.updateBox, this);
    // Remove the box when the model gets removed from the graph.
    this.model.on('remove', this.removeBox, this);

    this.updateBox();

    this.listenTo(this.model, 'process:ports', this.update);
    joint.dia.ElementView.prototype.initialize.apply(this, arguments);
  },

  render: function() {
    joint.dia.ElementView.prototype.render.apply(this, arguments);
    this.paper.$el.prepend(this.$box);
    // this.paper.$el.mousemove(this.onMouseMove.bind(this)), this.paper.$el.mouseup(this.onMouseUp.bind(this));
    this.updateBox();
    return this;
  },

  renderPorts: function () {
    var $inPorts = this.$('.inPorts').empty();
    var $outPorts = this.$('.outPorts').empty();

    var portTemplate = _.template(this.model.portMarkup);

    _.each(_.filter(this.model.ports, function (p) { return p.type === 'in' }), function (port, index) {

        $inPorts.append(V(portTemplate({ id: index, port: port })).node);
    });
    _.each(_.filter(this.model.ports, function (p) { return p.type === 'out' }), function (port, index) {

        $outPorts.append(V(portTemplate({ id: index, port: port })).node);
    });
  },

  update: function () {
    // First render ports so that `attrs` can be applied to those newly created DOM elements
    // in `ElementView.prototype.update()`.
    this.renderPorts();

    joint.dia.ElementView.prototype.update.apply(this, arguments);
  },

  updateBox: function() {
    // Set the position and dimension of the box so that it covers the JointJS element.
    var bbox = this.model.getBBox()
    this.$box.css({ width: bbox.width, height: bbox.height, left: bbox.x, top: bbox.y });
  },

  removeBox: function(evt) {
    this.$box.remove();
  }
});
