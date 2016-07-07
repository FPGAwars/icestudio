'use strict';

// Create a custom element.
// ------------------------

joint.shapes.test = {};
joint.shapes.test.Model = joint.shapes.basic.Generic.extend(_.extend({}, joint.shapes.basic.PortsModelInterface, {

    markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g class="inPorts"/><g class="outPorts"/></g>',
    portMarkup: '<g class="port port<%= id %>"><path class="port-wire"/><circle class="port-body"/><text class="port-label"/></g>',

    defaults: joint.util.deepSupplement({

        type: 'test.Model',
        size: { width: 1, height: 1 },
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
                r: 10,
                stroke: 'none',
                'fill-opacity': 1
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
                x: -15,
                dy: 4,
                'text-anchor': 'end',
                fill: '#000'
            },
            '.outPorts .port-label': {
                x: 15,
                dy: 4,
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

joint.shapes.test.ModelView = joint.dia.ElementView.extend({

    template: '',

    initialize: function() {
        _.bindAll(this, 'updateBox');
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);

        this.$box = $(joint.util.template(this.template)());

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
      // First render ports so that `attrs` can be applied to those newly created DOM elements
      // in `ElementView.prototype.update()`.
      this.renderPorts();
      joint.dia.ElementView.prototype.update.apply(this, arguments);
    },
    updateBox: function() {
        // Set the position and the size of the box so that it covers the JointJS element.
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
    size: { width: 120, height: 80 },
    attrs: {
        '.body': {
            width: 120,
            height: 80
        },
        '.inPorts .port-body': {
            fill: 'PaleGreen'
        },
        '.outPorts .port-body': {
            fill: 'Tomato'
        }
}
  }, joint.shapes.test.Model.prototype.defaults)
});

var genericBlockTemplate = '\
<div class="block">\
  <img>\
  <label></label>\
  <svg>\
  </svg>\
</div>\
'

joint.shapes.test.GenericView = joint.shapes.test.ModelView.extend({

    template: genericBlockTemplate,

    initialize: function() {
        joint.shapes.test.ModelView.prototype.initialize.apply(this, arguments);

        var image = this.model.get('image');
        var name = this.model.get('name');

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



var html = '\
<div class="my-html-element">\
<label>This is HTML</label>\
<input type="text" value="I\'m HTML input" />\
<svg>\
 <circle cx="10" cy="10" r="5" fill="white" />\
 <text y="2em">Hello world</text>\
</svg>\
<select class="select"></select>\
<script>\
$(".select2").select2({placeholder: "", allowClear: true});\
</script>\
</div>\
'

// Create a custom view for that element that displays an HTML div above it.
// -------------------------------------------------------------------------

joint.shapes.test.VElementView = joint.dia.ElementView.extend({

    template: genericBlockTemplate,

    initialize: function() {
        _.bindAll(this, 'updateBox');
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);

        this.$box = $(joint.util.template(this.template)());
        /*// Prevent paper from handling pointerdown.
        this.$box.find('input').on('mousedown', function(evt) { evt.stopPropagation(); });
        // This is an example of reacting on the input change and storing the input data in the cell model.
        this.$box.find('input').on('change', _.bind(function(evt) {
            this.model.set('myinput', $(evt.target).val());
        }, this));*/

        var image = this.model.get('image');
        var name = this.model.get('name');

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

        // Update the box position whenever the underlying model changes.
        this.model.on('change', this.updateBox, this);
        // Remove the box when the model gets removed from the graph.
        this.model.on('remove', this.removeBox, this);
    },
    render: function() {
        joint.dia.ElementView.prototype.render.apply(this, arguments);
        this.paper.$el.append(this.$box);
        this.updateBox();
        return this;
    },
    updateBox: function() {
        // Set the position and the size of the box so that it covers the JointJS element.
        var bbox = this.getBBox();
        // Example of updating the HTML with a data stored in the cell model.
        this.$box.css({ width: bbox.find('.body').width + 2, height: bbox.height + 2, left: bbox.x, top: bbox.y });
    },
    removeBox: function(evt) {
        this.$box.remove();
    }

});




//////////////////////////////////////////////////

//Initial Parameters
var gridsize = 1;
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
    snapLinks: true,
    linkPinning: false
});

var el1 = new joint.shapes.test.Generic({
  position: { x: 80, y: 80 },
  image: 'resources/images/and.svg',
  name: 'AND',
  inPorts: [{id: 1234, label:'in1'}, {id: 2345, label:'in2'}],
  outPorts: [{id: 3456, label:'out1'}]
});
var el2 = new joint.shapes.test.Generic({
  position: { x: 350, y: 150 },
  image: '',
  name: 'AND',
  inPorts: [{id: 1234, label:''}, {id: 2345, label:''}],
  outPorts: [{id: 3456, label:''}]
});
//var l = new joint.dia.Link({ source: { id: el1.id }, target: { id: el2.id } });

_graph.addCells([el1, el2]);


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
  _paper.findViewByModel(cellView.model).$box.removeClass('front');
}

function cellToFront(cellView) {
  _paper.findViewByModel(cellView.model).$box.addClass('front');
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
