var util = require('./util'),
    parse = require('../../../path/parse'),
    render = require('../../../path/render-webgl'),
    linePath = require('../../../util/svg').path.line;

function path(g, items) {
  var o = items[0],
      p = o.pathCache || (o.pathCache = parse(linePath(items)));


console.log(linePath(items))
    console.log(p)
  return render(g, p);
}

function pick(g, scene, x, y, gx, gy) {
  var items = scene.items,
      b = scene.bounds;

  if (!items || !items.length || b && !b.contains(gx, gy)) {
    return null;
  }

  if (g.pixelratio != null && g.pixelratio !== 1) {
    x *= g.pixelratio;
    y *= g.pixelratio;
  }
  return hit(g, items, x, y) ? items[0] : null;
}

var hit = util.testPath(path, false);

module.exports = {
  draw: util.drawOne(path),
  pick: pick,
  nested: true
};
