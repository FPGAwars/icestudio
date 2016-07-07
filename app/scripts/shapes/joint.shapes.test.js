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
            'fill-opacity': 0
        },
        '.port-body': {
           r: 15,
           stroke: '#888888',
           'stroke-width': 2,
           'stroke-opacity': 0,
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
      this.$box.css({ width: bbox.width, height: bbox.height, left: bbox.x, top: bbox.y });
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

joint.shapes.test.I = joint.shapes.test.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'test.I',
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

joint.shapes.test.O = joint.shapes.test.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'test.O',
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
      <select class="select2"></select>\
      <script>\
        $(".select2").select2({placeholder: "", allowClear: true});\
      </script>\
    </div>\
    ',

    initialize: function() {
      joint.shapes.test.ModelView.prototype.initialize.apply(this, arguments);

      this.$box.find('.select2').on('change', _.bind(function(evt) {
        //this.model.attributes.data.pin.name = $(evt.target).find("option:selected").text();
        //this.model.attributes.data.pin.value = $(evt.target).val();
      }, this));

      var name = this.model.get('label');
      this.$box.find('label').text(name);
    },
    renderChoices: function() {
      if (this.model.get('disabled')) {
        //this.$box.find('.select2').removeClass('select2');
        this.$box.find('.select2').css({'display': 'none'});
      }
      else {
        var choices = this.model.get('choices');
        var $select = this.$box.find('.select2').empty();

        $select.append('<option></option>');
        for (var c in choices) {
          $select.append('<option value="' + choices[c].value + '">' + choices[c].name + '</option>');
        }

        //this.$box.find('.select2').val(this.model.get('data').pin.value);
      }
    },
    update: function () {
      this.renderPorts();
      this.renderChoices();
      joint.dia.ElementView.prototype.update.apply(this, arguments);
    }
});

joint.shapes.test.IView = joint.shapes.test.IOView;
joint.shapes.test.OView = joint.shapes.test.IOView;


// Code block

joint.shapes.test.Code = joint.shapes.test.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'test.Code',
    size: {
      width: 300,
      height: 100
    },
    attrs: {
      '.body': {
        width: 300,
        height: 100
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

    initialize: function() {
      joint.shapes.test.ModelView.prototype.initialize.apply(this, arguments);

      //this.$box.find('.code-block').append(this.model.attributes.data.code);
      //this.$box.find('#content').append(this.model.attributes.data.code);
    },
    update: function () {
      this.renderPorts();
      if (this.model.get('disabled')) {
        this.$box.find('.code-block').css({'pointer-events': 'none'});
      }
      else {
        this.$box.find('.code-block').css({'pointer-events': 'all'});
      }
      joint.dia.ElementView.prototype.update.apply(this, arguments);
    },
});


// Custom wire

joint.connectors.lineGapConnector = function(sourcePoint, targetPoint, vertices) {

    var dimensionFix = 1e-3;

    console.log(sourcePoint, targetPoint, vertices);

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

    arrowheadMarkup: [
        '<g class="marker-arrowhead-group marker-arrowhead-group-<%= end %>">',
        '<circle class="marker-arrowhead" end="<%= end %>" r="7"/>',
        '</g>'
    ].join(''),

    vertexMarkup: [
        '<g class="marker-vertex-group" transform="translate(<%= x %>, <%= y %>)">',
        '<circle class="marker-vertex" idx="<%= idx %>" r="10" />',
        '<g class="marker-vertex-remove-group">',
        '<path class="marker-vertex-remove-area" idx="<%= idx %>" d="M16,5.333c-7.732,0-14,4.701-14,10.5c0,1.982,0.741,3.833,2.016,5.414L2,25.667l5.613-1.441c2.339,1.317,5.237,2.107,8.387,2.107c7.732,0,14-4.701,14-10.5C30,10.034,23.732,5.333,16,5.333z" transform="translate(5, -33)"/>',
        '<path class="marker-vertex-remove" idx="<%= idx %>" transform="scale(.8) translate(9.5, -37)" d="M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z">',
        '<title>Remove vertex.</title>',
        '</path>',
        '</g>',
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

console.log(joint.routers.manhattan)


//////////////////////////////////////////////////

//Initial Parameters
var gridsize = 10;
var currentScale = 1;

//Get the div that will hold the graph
var targetElement= $('#xpaper')[0];

var _graph = new joint.dia.Graph;
var _paper = new joint.dia.Paper({
    el: $('#xpaper'),
    width: 600,
    height: 300,
    gridSize: gridsize,
    model: _graph,
    snapLinks: { radius: 15 },
    linkPinning: false,
    defaultLink: new joint.shapes.test.Wire()
});

var el1 = new joint.shapes.test.Generic({
  position: { x: 80, y: 80 },
  image: 'resources/images/and.svg',
  label: 'AND',
  inPorts: [{id: 1234, label:'in1'}, {id: 2345, label:'in2'}],
  outPorts: [{id: 3456, label:'out1'}]
});
var el2 = new joint.shapes.test.I({
  position: { x: 350, y: 100 },
  label: 'mi',
  choices: [
    { name: 'LED0', value: '95' },
    { name: 'LED1', value: '96' }
  ]
});
var el3 = new joint.shapes.test.O({
  position: { x: 350, y: 180 },
  label: 'mo'
});
var el4 = new joint.shapes.test.Code({
  position: { x: 0, y: 0 },
  outPorts: [{
    id: "out",
    label: "out"
  }],
});
//var l = new joint.dia.Link({ source: { id: el1.id }, target: { id: el2.id } });

_graph.addCells([el1, el2, el3, el4]);

var lastSelectedCell = null;

_paper.on('cell:pointerdown',
  function(cellView, evt, x, y) {
    if (!cellView.model.isLink()) {
      if (lastSelectedCell)
      cellToBack(lastSelectedCell);
      lastSelectedCell = cellView;
      cellToFront(cellView);
    }
  }
);

function cellToBack(cellView) {
  // For Element SVG
  cellView.model.toBack();
  // For ElementView HTML
  cellView.$box.removeClass('front');
}

function cellToFront(cellView) {
  // For Element SVG
  cellView.model.toFront();
  // For ElementView HTML
  cellView.$box.addClass('front');
}

/*$('#highlight').on('click', function() {

    var el1View = _paper.findViewByModel(el1);
    var el2View = _paper.findViewByModel(el2);
    var lView = _paper.findViewByModel(l);
    el1View.$box.addClass('highlight');
    el2View.$box.addClass('highlight');
    lView.highlight();
});

$('#unhighlight').on('click', function() {

    var el1View = _paper.findViewByModel(el1);
    var el2View = _paper.findViewByModel(el2);
    var lView = _paper.findViewByModel(l);

    el1View.$box.removeClass('highlight');
    el2View.$box.removeClass('highlight');
    lView.unhighlight();
});*/

/*//Bonus function use (see below) - create dotted grid
setGrid(_paper, gridsize*15, '#808080');

el1.on('change:position', function() {
  el1View.updateBox();
});

//Setup  svgpan and zoom, with handlers that set the grid sizing on zoom and pan
//Handlers not needed if you don't want the dotted grid
var panAndZoom = svgPanZoom(targetElement.childNodes[0],
{
    viewportSelector: targetElement.childNodes[0].childNodes[0],
    fit: false,
    zoomScaleSensitivity: 0.4,
    panEnabled: false,
    onZoom: function(scale) {
        currentScale = scale;
        setGrid(_paper, gridsize*15*currentScale, '#808080');
        alert('mo');
    },
    beforePan: function(oldpan, newpan) {
        setGrid(_paper, gridsize*15*currentScale, '#808080', newpan);
    },
    onPan: function(newPan) {
      el1View.updateBox();
      el2View.updateBox();
    }
});

el1View.updateBox();
el2View.updateBox();

//Enable pan when a blank area is click (held) on
_paper.on('blank:pointerdown', function (evt, x, y) {
  panAndZoom.enablePan();
  //console.log(x + ' ' + y);
});

//Disable pan when the mouse button is released
_paper.on('cell:pointerup blank:pointerup', function(cellView, event) {
  panAndZoom.disablePan();
});

//BONUS function - will add a css background of a dotted grid that will scale reasonably
//well with zooming and panning.
function setGrid(paper, size, color, offset) {
    // Set grid size on the JointJS paper object (joint.dia.Paper instance)
    paper.options.gridsize = gridsize;
    // Draw a grid into the HTML 5 canvas and convert it to a data URI image
    var canvas = $('<canvas/>', { width: size, height: size });
    canvas[0].width = size;
    canvas[0].height = size;
    var context = canvas[0].getContext('2d');
    context.beginPath();
    context.rect(1, 1, 1, 1);
    context.fillStyle = color || '#AAAAAA';
    context.fill();
    // Finally, set the grid background image of the paper container element.
    var gridBackgroundImage = canvas[0].toDataURL('image/png');
    $(paper.el.childNodes[0]).css('background-image', 'url("' + gridBackgroundImage + '")');
    if(typeof(offset) != 'undefined'){
        $(paper.el.childNodes[0]).css('background-position', offset.x + 'px ' + offset.y + 'px');
    }
}*/
