'use strict';

// Create a custom element.
// ------------------------

joint.shapes.test = {};
joint.shapes.test.Model = joint.shapes.basic.Generic.extend(_.extend({}, joint.shapes.basic.PortsModelInterface, {

  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g class="inPorts"/><g class="outPorts"/></g>',
  portMarkup: '<g class="port port<%= id %>"><path class="port-wire"/><circle class="port-body"/><text class="port-label"/></g>',

  defaults: joint.util.deepSupplement({
    type: 'test.Model',
    size: {
      width: 1,
      height: 1
    },
    inPorts: [],
    outPorts: [],
    attrs: {
      '.': {
        magnet: false
      },
      '.body': {
          stroke: 'none',
          'fill-opacity': 0,
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
        fill: '#000'
      },
      '.outPorts .port-label': {
        x: -15,
        y: -10,
        'text-anchor': 'start',
        fill: '#000'
      },
      '.port-wire': {
        stroke: '#888888',
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

    attrs[portSelector] = {
      ref: '.body',
      'ref-y': (index + 0.5) * (1 / total)
    };

    attrs[portWireSelector] = {
      y: (index + 0.5) * (1 / total)
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

joint.shapes.test.ModelView = joint.dia.ElementView.extend({

    template: '',

    initialize: function() {
      _.bindAll(this, 'updateBox');
      joint.dia.ElementView.prototype.initialize.apply(this, arguments);

      this.$box = $(joint.util.template(this.template)());

      var bbox = this.model.getBBox();
      this.offset = { x: bbox.x, y: bbox.y };

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
      this.$box.css({ width: bbox.width * state.zoom,
                      height: bbox.height * state.zoom,
                      left: bbox.x * state.zoom + state.pan.x,
                      top: bbox.y * state.zoom + state.pan.y });
    },
    removeBox: function(evt) {
      this.$box.remove();
    }
});


// Generic block

joint.shapes.test.Generic = joint.shapes.test.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'test.Generic',
    size: {
      width: 120,
      height: 80
    },
    attrs: {
      '.body': {
        width: 120,
        height: 80
      }
    }
  }, joint.shapes.test.Model.prototype.defaults)
});

joint.shapes.test.GenericView = joint.shapes.test.ModelView.extend({

    template: '\
    <div class="generic-block">\
      <img>\
      <label></label>\
    </div>\
    ',

    initialize: function() {
      joint.shapes.test.ModelView.prototype.initialize.apply(this, arguments);

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

joint.shapes.test.Input = joint.shapes.test.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'test.Input',
    choices: [],
    outPorts: [{
      id: "out",
      label: ""
    }],
    size: {
      width: 120,
      height: 80
    },
    attrs: {
      '.body': {
        width: 120,
        height: 80
      }
    }
  }, joint.shapes.test.Model.prototype.defaults)
});

joint.shapes.test.Output = joint.shapes.test.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'test.Output',
    choices: [],
    inPorts: [{
      id: "in",
      label: ""
    }],
    size: {
      width: 120,
      height: 80
    },
    attrs: {
      '.body': {
        width: 120,
        height: 80
      }
    }
  }, joint.shapes.test.Model.prototype.defaults)
});


joint.shapes.test.IOView = joint.shapes.test.ModelView.extend({

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
      joint.shapes.test.ModelView.prototype.initialize.apply(this, arguments);

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

        //this.$box.find('.io-combo').val(this.model.get('data').pin.value);
        this.$box.find('.io-combo').val('');
      }
    },
    update: function () {
      this.renderLabel();
      this.renderPorts();
      this.renderChoices();
      joint.dia.ElementView.prototype.update.apply(this, arguments);
    }
});

joint.shapes.test.InputView = joint.shapes.test.IOView;
joint.shapes.test.OutputView = joint.shapes.test.IOView;


// Code block

joint.shapes.test.Code = joint.shapes.test.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'test.Code',
    size: {
      width: 400,
      height: 200
    },
    attrs: {
      '.body': {
        width: 400,
        height: 200
      }
    }
  }, joint.shapes.test.Model.prototype.defaults)
});

joint.shapes.test.CodeView = joint.shapes.test.ModelView.extend({

    template: '\
    <div class="code-block">\
      <div class="code-editor" id="editor"></div>\
      <textarea class="hidden" id="content"></textarea>\
      <script>\
        var editor = ace.edit("editor");\
        editor.setTheme("ace/theme/chrome");\
        editor.getSession().setMode("ace/mode/verilog");\
        editor.getSession().on("change", function () {\
          $("#content").val(editor.getSession().getValue());\
          $(document).trigger("disableSelected");\
        });\
        editor.on("hover", function() { $(document).trigger("disableSelected"); });\
        document.getElementById("editor").style.fontSize="15px";\
      </script>\
    </div>\
    ',

    // TODO: check change and hover trigger event

    initialize: function() {
      joint.shapes.test.ModelView.prototype.initialize.apply(this, arguments);

      // Prevent paper from handling pointerdown.
      this.$box.find('.code-editor').on('mousedown click', function(evt) { evt.stopPropagation(); });

      this.$box.find('.code-editor').append(this.model.attributes.data.code);
      this.$box.find('#content').append(this.model.attributes.data.code);
    },
    update: function () {
      this.renderPorts();
      if (this.model.get('disabled')) {
        this.$box.find('.code-editor').css({'pointer-events': 'none'});
      }
      else {
        this.$box.find('.code-editor').css({'pointer-events': 'all'});
      }
      joint.dia.ElementView.prototype.update.apply(this, arguments);
    },
});


// Custom wire

joint.connectors.lineGapConnector = function(sourcePoint, targetPoint, vertices) {

    var dimensionFix = 1e-3;

    var points = [];

    points.push({ x: sourcePoint.x, y: sourcePoint.y });
    _.each(vertices, function(vertex) {
      points.push({ x: vertex.x, y: vertex.y });
    });
    points.push({ x: targetPoint.x, y: targetPoint.y });

    var step = 15 + 2;
    var n = points.length;

    var sq = { x: points[0].x - points[1].x, y: points[0].y - points[1].y };
    var tq = { x: points[n-1].x - points[n-2].x, y: points[n-1].y - points[n-2].y };

    var sx = Math.sign(sq.x) * step;
    var sy = Math.sign(sq.y) * step;

    var tx = (tq.y == 0) ? Math.sign(tq.x) * step : 0;
    var ty = (tq.x == 0) ? Math.sign(tq.y) * step : 0;

    var d = ['M', sourcePoint.x + sx, sourcePoint.y + sy];

    _.each(vertices, function(vertex) { d.push(vertex.x, vertex.y); });

    d.push(targetPoint.x + tx + dimensionFix, targetPoint.y + ty + dimensionFix);

    return d.join(' ');
};

joint.shapes.test.Wire = joint.dia.Link.extend({

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

    type: 'test.Wire',

    attrs: {
      '.connection': { 'stroke-width': 2, stroke: '#888888'},
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
