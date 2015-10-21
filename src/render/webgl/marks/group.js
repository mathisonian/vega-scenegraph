var util = require('./util'),
    EMPTY = [];

function draw(g, scene, bounds) {
  if (!scene.items || !scene.items.length) return;



  var groups = scene.items,
      renderer = this,
      group, items, axes, legends, gx, gy, w, h, opac, i, n, j, m;

  for (i=0, n=groups.length; i<n; ++i) {
    group = groups[i];
    axes = group.axisItems || EMPTY;
    items = group.items || EMPTY;
    legends = group.legendItems || EMPTY;
    gx = group.x || 0;
    gy = group.y || 0;
    w = group.width || 0;
    h = group.height || 0;

    // draw group background
    // if (group.stroke || group.fill) {
    //   opac = group.opacity == null ? 1 : group.opacity;
    //   if (opac > 0) {
    //     if (group.fill && util.fill(g, group, opac)) {
    //       g.fillRect(gx, gy, w, h);
    //     }
    //     if (group.stroke && util.stroke(g, group, opac)) {
    //       g.strokeRect(gx, gy, w, h);
    //     }
    //   }
    // }

    // setup graphics context
    // g.save();
    // g.translate(gx, gy);
    // if (group.clip) {
    //   g.beginPath();
    //   g.rect(0, 0, w, h);
    //   g.clip();
    // }
    // if (bounds) bounds.translate(-gx, -gy);

    // draw group contents
    for (j=0, m=axes.length; j<m; ++j) {
      if (axes[j].layer === 'back') {
        renderer.draw(g, axes[j], bounds);
      }
    }
    for (j=0, m=items.length; j<m; ++j) {
      renderer.draw(g, items[j], bounds);
    }
    for (j=0, m=axes.length; j<m; ++j) {
      if (axes[j].layer !== 'back') {
        renderer.draw(g, axes[j], bounds);
      }
    }
    for (j=0, m=legends.length; j<m; ++j) {
      renderer.draw(g, legends[j], bounds);
    }

    // restore graphics context
    // if (bounds) bounds.translate(gx, gy);
    // g.restore();
  }
}

function pick(g, scene, x, y, gx, gy) {
  throw new Error('Not implemented');
}

module.exports = {
  draw: draw,
  pick: pick
};
