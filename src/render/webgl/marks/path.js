var util = require('./util'),
    parse = require('../../../path/parse'),
    render = require('../../../path/render-webgl');

function path(g, o) {
  if (o.path == null) return true;
  var p = o.pathCache || (o.pathCache = parse(o.path));
  return render(g, p, o.x, o.y);
}

module.exports = {
  draw: util.drawAll(path),
  pick: util.pickPath(path)
};
