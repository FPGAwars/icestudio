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
    attrs: {
      '.': { magnet: false },
      text: {
        'pointer-events': 'none'
      },
      '.body': {
        width: 80,
        height: 80,
        stroke: '#000',
        rx: 5,
        ry: 10,
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
        'ref-y': 15,
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
      text: port.label
    };

    attrs[portBodySelector] = {
      port: {
        id: port.id || _.uniqueId(type),
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

joint.shapes.ice.Wire = joint.dia.Link.extend({

  defaults: {
    type: 'ice.Wire',
    router: { name: 'manhattan' },
    connector: { name: 'rounded', args: { radius: 5 }},
    attrs: {
      '.connection': {
        'stroke-width': 2
      }
    }
  }
});

joint.shapes.ice.ModelView = joint.dia.ElementView.extend(joint.shapes.basic.PortsViewInterface);
joint.shapes.ice.BlockView = joint.shapes.ice.ModelView;
joint.shapes.ice.IOView = joint.shapes.ice.ModelView;
