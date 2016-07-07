'use strict';

// Create a custom element.
// ------------------------

joint.shapes.test = {};
joint.shapes.test.Element = joint.shapes.basic.Rect.extend({
    defaults: joint.util.deepSupplement({
      type: 'test.Element',
      size: {
        width: 120,
        height: 80
      },
      attrs: {
        rect: {
          stroke: 'none',
          'fill-opacity': 0
        }
      }
    }, joint.shapes.basic.Rect.prototype.defaults)
});

// Generic block

joint.shapes.test.Generic = joint.shapes.test.Element.extend({
  defaults: joint.util.deepSupplement({
    type: 'test.Generic'
  }, joint.shapes.test.Element.prototype.defaults)
});

var genericBlockTemplate = '\
<div class="block">\
  <img>\
  <label></label>\
  <svg>\
  </svg>\
</div>\
'

joint.shapes.test.GenericView = joint.dia.ElementView.extend({

    template: genericBlockTemplate,

    initialize: function() {
        _.bindAll(this, 'updateBox');
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);

        this.$box = $(joint.util.template(this.template)());

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
        this.$box.css({ width: bbox.width, height: bbox.height, left: bbox.x, top: bbox.y });
    },
    removeBox: function(evt) {
        this.$box.remove();
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

joint.shapes.test.ElementView = joint.dia.ElementView.extend({

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
        this.$box.css({ width: bbox.width + 2, height: bbox.height + 2, left: bbox.x, top: bbox.y });
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

var el1 = new joint.shapes.test.Element({
  position: { x: 80, y: 80 },
  image: 'resources/images/and.svg',
  name: 'AND'
});
var el2 = new joint.shapes.test.Element({
  position: { x: 350, y: 150 },
  image: '',
  name: 'AND'
});
var l = new joint.dia.Link({ source: { id: el1.id }, target: { id: el2.id } });

_graph.addCells([el1, el2, l]);


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
