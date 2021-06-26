'use strict';

joint.connectors.ice = function (sourcePoint, targetPoint, vertices) {
  var points = [];

  points.push({ x: sourcePoint.x, y: sourcePoint.y });
  _.each(vertices, function (vertex) {
    points.push({ x: vertex.x, y: vertex.y });
  });
  points.push({ x: targetPoint.x, y: targetPoint.y });

  var step = 8;
  var n = points.length;

  var sq = { x: points[0].x - points[1].x, y: points[0].y - points[1].y };
  var tq = { x: points[n - 1].x - points[n - 2].x, y: points[n - 1].y - points[n - 2].y };

  var sx = Math.sign(sq.x) * step;
  var sy = Math.sign(sq.y) * step;

  var tx = (tq.y === 0) ? Math.sign(tq.x) * step : 0;
  var ty = (tq.x === 0) ? Math.sign(tq.y) * step : 0;

  var full = ['M'];
  var wrap = ['M'];

  var dVertices = [];
  _.each(vertices, function (vertex) { dVertices.push(vertex.x, vertex.y); });

  full.push(sourcePoint.x, sourcePoint.y);
  wrap.push(sourcePoint.x - sx, sourcePoint.y - sy);

  full = full.concat(dVertices);
  wrap = wrap.concat(dVertices);

  full.push(targetPoint.x, targetPoint.y);
  wrap.push(targetPoint.x - tx, targetPoint.y - ty);

  return {
    full: full.join(' '),
    wrap: wrap.join(' ')
  };
};
