'use strict';

// Model element

joint.shapes.ice = {};
joint.shapes.ice.Model = joint.shapes.basic.Generic.extend(_.extend({}, joint.shapes.basic.PortsModelInterface, {

  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g class="inPorts"/><g class="outPorts"/></g>',
  portMarkup: '<g class="port port<%= id %>"><path class="port-wire"/><circle class="port-body"/><text class="port-label"/></g>',

  defaults: joint.util.deepSupplement({
    type: 'ice.Model',
    size: {
      width: 1,
      height: 1
    },
    inPorts: [],
    outPorts: [],
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
        r: 15,
        'stroke-width': 2,
        'stroke-opacity': 0,
        opacity: 0,
      },
      '.inPorts .port-body': {
        type: 'input',
        magnet: false
      },
      '.outPorts .port-body': {
        type: 'output',
        magnet: true
      },
      '.inPorts .port-label': {
        x: 15,
        y: -10,
        'text-anchor': 'end',
        fill: '#777'
      },
      '.outPorts .port-label': {
        x: -15,
        y: -10,
        'text-anchor': 'start',
        fill: '#777'
      },
      '.port-wire': {
        stroke: '#777',
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
      text: port.label
    };

    attrs[portBodySelector] = {
      port: {
        id: port.id,
        type: type
      }
    };

    var portY = (index + 0.5) / total;

    if (portY < 0.5) {
      portY = Math.ceil(portY * port.gridUnits) / port.gridUnits;
    }
    else if (portY > 0.5) {
      portY = Math.floor(portY * port.gridUnits) / port.gridUnits;
    }

    attrs[portSelector] = {
      ref: '.body',
      'ref-y': portY
    };

    attrs[portWireSelector] = {
      y: portY
    };

    if (type === 'in') {
      attrs[portSelector]['ref-x'] = -20;
      attrs[portWireSelector]['d'] = 'M 0 0 L 20 0';
    }
    else {
      attrs[portSelector]['ref-dx'] = 20;
      attrs[portWireSelector]['d'] = 'M 0 0 L -20 0';
    }

    return attrs;
  }
}));

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
    render: function() {
      joint.dia.ElementView.prototype.render.apply(this, arguments);
      this.paper.$el.append(this.$box);
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
      this.renderPorts();
      joint.dia.ElementView.prototype.update.apply(this, arguments);
    },
    updateBox: function() {
      var bbox = this.model.getBBox();
      var state = this.model.attributes.state;

      this.$('.port-wire').css('stroke-width', 2 * state.zoom);

      this.$box.css({
        left: bbox.x * state.zoom + state.pan.x + bbox.width / 2.0 * (state.zoom - 1),
        top: bbox.y * state.zoom + state.pan.y + bbox.height / 2.0 * (state.zoom - 1),
        width: bbox.width,
        height: bbox.height,
        transform: 'scale(' + state.zoom + ')'
      });
    },
    removeBox: function(evt) {
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
        this.$box.find('img').attr('src', image);
        this.$box.find('img').removeClass('hidden');
        this.$box.find('label').addClass('hidden');
      }
      else {
        this.$box.find('label').text(name);
        this.$box.find('img').addClass('hidden');
        this.$box.find('label').removeClass('hidden');
      }
    }
});

// I/O blocks

joint.shapes.ice.Input = joint.shapes.ice.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'ice.Input',
    choices: [],
    outPorts: [{
      id: "out",
      label: "",
      gridUnits: 8
    }],
    size: {
      width: 96,
      height: 64
    }
  }, joint.shapes.ice.Model.prototype.defaults)
});

joint.shapes.ice.Output = joint.shapes.ice.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'ice.Output',
    choices: [],
    inPorts: [{
      id: "in",
      label: "",
      gridUnits: 8
    }],
    size: {
      width: 96,
      height: 64
    }
  }, joint.shapes.ice.Model.prototype.defaults)
});


joint.shapes.ice.IOView = joint.shapes.ice.ModelView.extend({

    template: '\
    <div class="io-block">\
      <label></label>\
      <select class="io-combo select2"></select>\
      <script>\
        $(".select2").select2({placeholder: "", allowClear: true});\
      </script>\
    </div>\
    ',

    initialize: function() {
      joint.shapes.ice.ModelView.prototype.initialize.apply(this, arguments);

      // Prevent paper from handling pointerdown.
      this.$box.find('.io-combo').on('mousedown click', function(evt) { evt.stopPropagation(); });

      this.$box.find('.io-combo').on('change', _.bind(function(evt) {
        this.model.attributes.data.pin.name = $(evt.target).find("option:selected").text();
        this.model.attributes.data.pin.value = $(evt.target).val();
      }, this));
    },
    renderLabel: function () {
      var name = this.model.get('label');
      this.$box.find('label').text(name);
    },
    renderChoices: function() {
      if (this.model.get('disabled')) {
        this.$box.find('.io-combo').removeClass('select2');
        this.$box.find('.io-combo').css({'display': 'none'});
      }
      else {
        var choices = this.model.get('choices');
        var $select = this.$box.find('.io-combo').empty();

        $select.append('<option></option>');
        for (var c in choices) {
          $select.append('<option value="' + choices[c].value + '">' + choices[c].name + '</option>');
        }

        this.$box.find('.io-combo').val(this.model.get('data').pin.value);
      }
    },
    clearValue: function () {
      this.model.attributes.data.pin.name = '';
      this.model.attributes.data.pin.value = 0;
      this.$box.find('.io-combo').val('');
    },
    update: function () {
      this.renderLabel();
      this.renderPorts();
      this.renderChoices();
      joint.dia.ElementView.prototype.update.apply(this, arguments);
    }
});

joint.shapes.ice.InputView = joint.shapes.ice.IOView;
joint.shapes.ice.OutputView = joint.shapes.ice.IOView;


// Code block

joint.shapes.ice.Code = joint.shapes.ice.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'ice.Code',
    size: {
      width: 400,
      height: 256
    },
    attrs: {
      '.body': {
        width: 400,
        height: 256
      }
    }
  }, joint.shapes.ice.Model.prototype.defaults)
});

joint.shapes.ice.CodeView = joint.shapes.ice.ModelView.extend({

    // TODO: check change and hover trigger event

    initialize: function() {
      _.bindAll(this, 'updateBox');
      joint.dia.ElementView.prototype.initialize.apply(this, arguments);

      var id = this.model.get('id');
      var editorLabel = 'editor' + id;
      var contentLabel = 'content' + id;
      this.$box = $(joint.util.template(
        '\
        <div class="code-block">\
          <div class="code-editor" id="' + editorLabel + '"></div>\
          <textarea class="hidden" id="' + contentLabel + '"></textarea>\
          <script>\
            var editor = ace.edit("' + editorLabel + '");\
            editor.setTheme("ace/theme/chrome");\
            editor.getSession().setMode("ace/mode/verilog");\
            editor.getSession().on("change", function () {\
              $("#' + contentLabel + '").val(editor.getSession().getValue());\
              $(document).trigger("disableSelected");\
            });\
            editor.on("hover", function() {\
              $(document).trigger("disableSelected");\
            });\
            document.getElementById("' + editorLabel + '").style.fontSize="15px";\
          </script>\
        </div>\
        '
      )());

      this.model.on('change', this.updateBox, this);
      this.model.on('remove', this.removeBox, this);

      this.updateBox();

      this.listenTo(this.model, 'process:ports', this.update);
      joint.dia.ElementView.prototype.initialize.apply(this, arguments);

      // Prevent paper from handling pointerdown.
      this.$box.find('#' + editorLabel).on('mousedown click', function(evt) { evt.stopPropagation(); });

      this.$box.find('#' + editorLabel).append(this.model.attributes.data.code);
      this.$box.find('#' + contentLabel).append(this.model.attributes.data.code);
    },
    update: function () {
      this.renderPorts();
      var id = this.model.get('id');
      var editorLabel = 'editor' + id;
      if (this.model.get('disabled')) {
        this.$box.find('#' + editorLabel).css({'pointer-events': 'none'});
      }
      else {
        this.$box.find('#' + editorLabel).css({'pointer-events': 'all'});
      }
      joint.dia.ElementView.prototype.update.apply(this, arguments);
    },
    updateBox: function() {
      var bbox = this.model.getBBox();
      var state = this.model.attributes.state;

      this.$('.port-wire').css('stroke-width', 2 * state.zoom);

      this.$box.css({ width: bbox.width * state.zoom,
                      height: bbox.height * state.zoom,
                      left: bbox.x * state.zoom + state.pan.x,
                      top: bbox.y * state.zoom + state.pan.y });
    }
});


// Custom wire

joint.connectors.lineGapConnector = function(sourcePoint, targetPoint, vertices) {
    var gridSize = 8;
    var dimensionFix = 1e-3;

    var points = [];

    points.push({ x: sourcePoint.x, y: sourcePoint.y });
    _.each(vertices, function(vertex) {
      points.push({ x: vertex.x, y: vertex.y });
    });
    points.push({ x: targetPoint.x, y: targetPoint.y });

    var step = 16;
    var n = points.length;

    var sq = { x: points[0].x - points[1].x, y: points[0].y - points[1].y };
    var tq = { x: points[n-1].x - points[n-2].x, y: points[n-1].y - points[n-2].y };

    var sx = Math.sign(sq.x) * step;
    var sy = Math.sign(sq.y) * step;

    var tx = (tq.y == 0) ? Math.sign(tq.x) * step : 0;
    var ty = (tq.x == 0) ? Math.sign(tq.y) * step : 0;

    var d = ['M', sourcePoint.x, sourcePoint.y];

    _.each(vertices, function(vertex) { d.push(vertex.x, vertex.y); });

    d.push(targetPoint.x + dimensionFix, targetPoint.y + dimensionFix);

    return d.join(' ');
};

joint.shapes.ice.Wire = joint.dia.Link.extend({

  markup: [
    '<path class="connection" stroke="black" d="M 0 0 0 0"/>',
    '<path class="marker-source" fill="black" stroke="black" d="M 0 0 0 0"/>',
    '<path class="marker-target" fill="black" stroke="black" d="M 0 0 0 0"/>',
    '<g class="labels"/>',
    '<g class="marker-vertices"/>',
    '<g class="marker-arrowheads"/>',
    '<g class="link-tools"/>'
  ].join(''),

  arrowheadMarkup: [
    '<g class="marker-arrowhead-group marker-arrowhead-group-<%= end %>">',
    '<circle class="marker-arrowhead" end="<%= end %>" r="7"/>',
    '</g>'
  ].join(''),

  defaults: joint.util.deepSupplement({

    type: 'ice.Wire',

    attrs: {
      '.connection': { 'stroke-width': 2, stroke: '#777'},
      '.marker-vertex': { r: 7 }
    },

    router: { name: 'manhattan' },
    connector: { name: 'lineGapConnector'}

  }, joint.dia.Link.prototype.defaults)

});


//////////////////////////////////////////////////

/*var obstacles = [el1, el4]

_graph.on('change:position', function(cell) {
    // has an obstacle been moved? Then reroute the link.
    if (_.contains(obstacles, cell)) {
      var cells = _graph.getCells();
      for (var i in cells) {
        var cell = cells[i];
        if (cell.isLink()) {
          _paper.findViewByModel(cell).update();
        }
      }
    }
});*/

/*el1.on('change:position', function() {
  el1View.updateBox();
});*/
