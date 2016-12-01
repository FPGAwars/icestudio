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
        r: 16,
        opacity: 0
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
        x: 12,
        y: -10,
        'text-anchor': 'end',
        fill: '#888'
      },
      '.outPorts .port-label': {
        x: -12,
        y: -10,
        'text-anchor': 'start',
        fill: '#888'
      },
      '.port-wire': {
        stroke: '#888',
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

    portY = Math.round(portY * port.gridUnits) / port.gridUnits;

    attrs[portSelector] = {
      ref: '.body',
      'ref-y': portY
    };

    attrs[portWireSelector] = {
      y: portY
    };

    if (type === 'in') {
      attrs[portSelector]['ref-x'] = -16;
      attrs[portWireSelector]['d'] = 'M 0 0 L 32 0';
      attrs[portSelector]['pointer-events'] = 'none';
      attrs[portWireSelector]['pointer-events'] = 'none';
    }
    else {
      attrs[portSelector]['ref-dx'] = 16;
      attrs[portWireSelector]['d'] = 'M 0 0 L -32 0';
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
    renderPorts: function() {
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
    update: function() {
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
      var name = this.model.attributes.data.label;
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

        if (this.model.get('data').pin) {
          this.$box.find('.io-combo').val(this.model.get('data').pin.value);
        }
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

    initialize: function() {
      _.bindAll(this, 'updateBox');
      joint.dia.ElementView.prototype.initialize.apply(this, arguments);

      var id = sha1(this.model.get('id')).toString().substring(0, 6);
      var blockLabel = 'block' + id;
      var editorLabel = 'editor' + id;
      var contentLabel = 'content' + id;
      this.$box = $(joint.util.template(
        '\
        <div class="code-block" id="' + blockLabel + '">\
          <div class="code-editor" id="' + editorLabel + '"></div>\
          <textarea class="hidden" id="' + contentLabel + '"></textarea>\
          <script>\
            var ' + editorLabel + ' = ace.edit("' + editorLabel + '");\
            ' + editorLabel + '.setTheme("ace/theme/chrome");\
            ' + editorLabel + '.setFontSize(' + fontSize + ');\
            ' + editorLabel + '.renderer.setShowGutter(true);\
            ' + editorLabel + '.setAutoScrollEditorIntoView(true);\
            ' + editorLabel + '.getSession().setMode("ace/mode/verilog");\
            ' + editorLabel + '.getSession().on("change", function () {\
              $("#' + contentLabel + '").val(' + editorLabel + '.getSession().getValue());\
            });\
            $("#' + blockLabel + '").resize(function () {\
              ' + editorLabel + '.resize();\
            });\
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
      var id = sha1(this.model.get('id')).toString().substring(0, 6);
      var editorLabel = 'editor' + id;
      var editor = ace.edit(this.$box.find('#' + editorLabel)[0]);
      editor.setReadOnly(this.model.get('disabled'));
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
      var contentLabel = 'content' + id;
      this.$box = $(joint.util.template(
        '\
        <div class="info-block" id="' + blockLabel + '">\
          <div class="info-editor" id="' + editorLabel + '"></div>\
          <textarea class="hidden" id="' + contentLabel + '"></textarea>\
          <script>\
            var ' + editorLabel + ' = ace.edit("' + editorLabel + '");\
            ' + editorLabel + '.setTheme("ace/theme/chrome");\
            ' + editorLabel + '.setFontSize(' + fontSize + ');\
            ' + editorLabel + '.renderer.setShowGutter(false);\
            ' + editorLabel + '.setAutoScrollEditorIntoView(true);\
            ' + editorLabel + '.getSession().on("change", function () {\
              $("#' + contentLabel + '").val(' + editorLabel + '.getSession().getValue());\
            });\
            $("#' + blockLabel + '").resize(function () {\
              ' + editorLabel + '.resize();\
            });\
          </script>\
        </div>\
        '
      )());

      this.model.on('change', this.updateBox, this);
      this.model.on('remove', this.removeBox, this);

      this.updateBox();

      // Prevent paper from handling pointerdown.
      this.$box.find('#' + editorLabel).on('mousedown click', function(evt) { evt.stopPropagation(); });

      this.$box.find('#' + editorLabel).append(this.model.attributes.data.info);
      this.$box.find('#' + contentLabel).append(this.model.attributes.data.info);
    },
    render: function () {
      joint.dia.ElementView.prototype.render.apply(this, arguments);
        this.paper.$el.append(this.$box);
        this.updateBox();
        return this;
    },
    update: function () {
      var id = sha1(this.model.get('id')).toString().substring(0, 6);
      var editorLabel = 'editor' + id;
      var editor = ace.edit(this.$box.find('#' + editorLabel)[0]);
      editor.setReadOnly(this.model.get('disabled'));
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
    '<circle class="marker-bifurcation" idx="<%= idx %>" r="4" fill="#888"/>',
    '</g>'
  ].join(''),

  arrowheadMarkup: [
    '<g class="marker-arrowhead-group marker-arrowhead-group-<%= end %>">',
    '<circle class="marker-arrowhead" end="<%= end %>" r="8"/>',
    '</g>'
  ].join(''),

  defaults: joint.util.deepSupplement({

    type: 'ice.Wire',

    /*labels: [
      {
        position: .5,
        attrs: {
          text: {
            text: ' /8 ' || '',
            'font-weight': 'bold',
            'font-size': '150%'
          }
        }
      }
    ],*/

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
    this._V.connectionWrap && this._V.connectionWrap.attr('d', pathData.wrap);

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
        if ((wire.attributes.source.id == currentWire.attributes.source.id) &&
            (wire.attributes.source.port == currentWire.attributes.source.port))
        {
          // Wire with the same source of currentWire
          var wireView = self.paper.findViewByModel(wire);
          // Clean the wire bifurcations
          var markerBifurcations = $(wireView._V.markerBifurcations.node).empty();
          portWires.push({
            id: wire.attributes.id,
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
            if (wireA.id != wireB.id) {
              // Not the same wire
              findBifurcations(wireA.view, wireB.view, wireA.markers);
            }
          });
        });
      }

      function findBifurcations(wireA, wireB, markersA) {
        // Find the corners in A that intersects with any B segment
        var vA = v(wireA);
        var vB = v(wireB);

        if (vA.length > 2) {
          for (var i = 1; i < vA.length - 1; i++) {
            if ((vA[i-1].x != vA[i+1].x) && (vA[i-1].y != vA[i+1].y)) {
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
        if (segment[0].x == segment[1].x) {
          // Vertical
          return ((point.x == segment[0].x) &&
            (point.y > Math.min(segment[0].y, segment[1].y)) &&
            (point.y < Math.max(segment[0].y, segment[1].y)));
        }
        else {
          // Horizontal
          return ((point.y == segment[0].y) &&
          (point.x > Math.min(segment[0].x, segment[1].x)) &&
          (point.x < Math.max(segment[0].x, segment[1].x)));
        }
      }
    }

    return this;
  }

});
