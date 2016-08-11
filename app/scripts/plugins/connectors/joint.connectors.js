
joint.connectors.ice = function(sourcePoint, targetPoint, vertices) {
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

    var d = ['M', sourcePoint.x + sx, sourcePoint.y + sy];

    _.each(vertices, function(vertex) { d.push(vertex.x, vertex.y); });

    d.push(targetPoint.x + tx + dimensionFix, targetPoint.y + ty + dimensionFix);

    return d.join(' ');
};
