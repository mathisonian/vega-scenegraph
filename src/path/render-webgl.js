var arc = require('./arc');
var bezier = require('adaptive-bezier-curve');
var quadratic = require('adaptive-quadratic-curve');


module.exports = function(g, path, l, t) {

  var points = [];

  var current, // current instruction
      previous = null,
      x = 0, // current x
      y = 0, // current y
      tempPoints,
      controlX = 0, // current control point x
      controlY = 0, // current control point y
      idx,
      tempX,
      tempY,
      tempControlX,
      tempControlY;

  if (l == null) l = 0;
  if (t == null) t = 0;

  for (var i=0, len=path.length; i<len; ++i) {
    current = path[i];

    console.log(current);

    switch (current[0]) { // first letter

      case 'l': // lineto, relative
        points.push(x + l, y + t);
        x += current[1];
        y += current[2];
        points.push(x + l, y + t);
        break;

      case 'L': // lineto, absolute
        points.push(x + l, y + t);
        x = current[1];
        y = current[2];
        points.push(x + l, y + t);
        break;

      case 'h': // horizontal lineto, relative
        points.push(x + l, y + t);
        x += current[1];
        points.push(x + l, y + t);
        break;

      case 'H': // horizontal lineto, absolute
        points.push(x + l, y + t);
        x = current[1];
        points.push(x + l, y + t);
        break;

      case 'v': // vertical lineto, relative
        points.push(x + l, y + t);
        y += current[1];
        points.push(x + l, y + t);
        break;

      case 'V': // verical lineto, absolute
        points.push(x + l, y + t);
        y = current[1];
        points.push(x + l, y + t);
        break;

      case 'm': // moveTo, relative
        x += current[1];
        y += current[2];
        // g.moveTo(x + l, y + t);
        break;

      case 'M': // moveTo, absolute
        x = current[1];
        y = current[2];
        // g.moveTo(x + l, y + t);
        break;

      case 'c': // bezierCurveTo, relative
        tempX = x + current[5];
        tempY = y + current[6];
        controlX = x + current[3];
        controlY = y + current[4];

        tempPoints = bezier(
            [x + l, y + t],
            [x + current[1] + l, y + current[2] + t]
            [controlX + l, controlY + t],
            [tempX + l, tempY + t]
          );

        for (idx = 1; idx < tempPoints.length; idx++) {
          points.push(tempPoints[idx - 1][0], tempPoints[idx - 1][1]);
          points.push(tempPoints[idx][0], tempPoints[idx][1]);
        }

        x = tempX;
        y = tempY;
        break;

      case 'C': // bezierCurveTo, absolute

        controlX = current[3];
        controlY = current[4];

        tempPoints = bezier(
          [x + l, y + t],
          [current[1] + l, current[2] + t],
          [controlX + l, controlY + t],
          [current[5] + l, current[6] + t]
        );

        x = current[5];
        y = current[6];

        for (idx = 1; idx < tempPoints.length; idx++) {
          points.push(tempPoints[idx - 1][0], tempPoints[idx - 1][1]);
          points.push(tempPoints[idx][0], tempPoints[idx][1]);
        }

        break;

      case 's': // shorthand cubic bezierCurveTo, relative
        // transform to absolute x,y
        tempX = x + current[3];
        tempY = y + current[4];
        // calculate reflection of previous control points
        controlX = 2 * x - controlX;
        controlY = 2 * y - controlY;

        tempPoints = bezier(
          [x + l, y + t],
          [controlX + l, controlY + t],
          [x + current[1] + l, y + current[2] + t],
          [tempX + l, tempY + t]
        );

        for (idx = 1; idx < tempPoints.length; idx++) {
          points.push(tempPoints[idx - 1][0], tempPoints[idx - 1][1]);
          points.push(tempPoints[idx][0], tempPoints[idx][1]);
        }
        // set control point to 2nd one of this command
        // the first control point is assumed to be the reflection of
        // the second control point on the previous command relative
        // to the current point.
        controlX = x + current[1];
        controlY = y + current[2];

        x = tempX;
        y = tempY;
        break;

      case 'S': // shorthand cubic bezierCurveTo, absolute
        tempX = current[3];
        tempY = current[4];
        // calculate reflection of previous control points
        controlX = 2*x - controlX;
        controlY = 2*y - controlY;

        tempPoints = bezier(
          [x + l, y + t],
          [controlX + l, controlY + t],
          [current[1] + l, current[2] + t],
          [tempX + l, tempY + t]
        );

        for (idx = 1; idx < tempPoints.length; idx++) {
          points.push(tempPoints[idx - 1][0], tempPoints[idx - 1][1]);
          points.push(tempPoints[idx][0], tempPoints[idx][1]);
        }

        x = tempX;
        y = tempY;
        // set control point to 2nd one of this command
        // the first control point is assumed to be the reflection of
        // the second control point on the previous command relative
        // to the current point.
        controlX = current[1];
        controlY = current[2];

        break;

      case 'q': // quadraticCurveTo, relative
        // transform to absolute x,y
        tempX = x + current[3];
        tempY = y + current[4];

        controlX = x + current[1];
        controlY = y + current[2];

        tempPoints = quadratic(
          [x + l, y + t],
          [controlX + l, controlY + t],
          [tempX + l, tempY + t]
        );

        for (idx = 1; idx < tempPoints.length; idx++) {
          points.push(tempPoints[idx - 1][0], tempPoints[idx - 1][1]);
          points.push(tempPoints[idx][0], tempPoints[idx][1]);
        }

        x = tempX;
        y = tempY;
        break;

      case 'Q': // quadraticCurveTo, absolute
        tempX = current[3];
        tempY = current[4];

        tempPoints = quadratic(
          [x + l, y + t],
          [current[1] + l, current[2] + t],
          [tempX + l, tempY + t]
        );

        for (idx = 1; idx < tempPoints.length; idx++) {
          points.push(tempPoints[idx - 1][0], tempPoints[idx - 1][1]);
          points.push(tempPoints[idx][0], tempPoints[idx][1]);
        }
        x = tempX;
        y = tempY;
        controlX = current[1];
        controlY = current[2];
        break;

      case 't': // shorthand quadraticCurveTo, relative

        // transform to absolute x,y
        tempX = x + current[1];
        tempY = y + current[2];

        if (previous[0].match(/[QqTt]/) === null) {
          // If there is no previous command or if the previous command was not a Q, q, T or t,
          // assume the control point is coincident with the current point
          controlX = x;
          controlY = y;
        }
        else if (previous[0] === 't') {
          // calculate reflection of previous control points for t
          controlX = 2 * x - tempControlX;
          controlY = 2 * y - tempControlY;
        }
        else if (previous[0] === 'q') {
          // calculate reflection of previous control points for q
          controlX = 2 * x - controlX;
          controlY = 2 * y - controlY;
        }

        tempControlX = controlX;
        tempControlY = controlY;

        tempPoints = quadratic(
          [x + l, y + t],
          [controlX + l, controlY + t],
          [tempX + l, tempY + t]
        );

        for (idx = 1; idx < tempPoints.length; idx++) {
          points.push(tempPoints[idx - 1][0], tempPoints[idx - 1][1]);
          points.push(tempPoints[idx][0], tempPoints[idx][1]);
        }

        x = tempX;
        y = tempY;
        controlX = x + current[1];
        controlY = y + current[2];
        break;

      case 'T':
        tempX = current[1];
        tempY = current[2];

        // calculate reflection of previous control points
        controlX = 2 * x - controlX;
        controlY = 2 * y - controlY;

        tempPoints = quadratic(
          [x + l, y + t],
          [controlX + l, controlY + t],
          [tempX + l, tempY + t]
        );

        for (idx = 1; idx < tempPoints.length; idx++) {
          points.push(tempPoints[idx - 1][0], tempPoints[idx - 1][1]);
          points.push(tempPoints[idx][0], tempPoints[idx][1]);
        }

        x = tempX;
        y = tempY;
        break;

      case 'a':
        drawArc(g, x + l, y + t, [
          current[1],
          current[2],
          current[3],
          current[4],
          current[5],
          current[6] + x + l,
          current[7] + y + t
        ]);
        x += current[6];
        y += current[7];
        break;

      case 'A':
        drawArc(g, x + l, y + t, [
          current[1],
          current[2],
          current[3],
          current[4],
          current[5],
          current[6] + l,
          current[7] + t
        ]);
        x = current[6];
        y = current[7];
        break;

      case 'z':
      case 'Z':
        points.push(x + l, y + t);
        points.push(points[0], points[1]);
        break;
    }
    previous = current;
  }

  return points;
};

function drawArc(g, x, y, coords) {
  var seg = arc.segments(
    coords[5], // end x
    coords[6], // end y
    coords[0], // radius x
    coords[1], // radius y
    coords[3], // large flag
    coords[4], // sweep flag
    coords[2], // rotation
    x, y
  );
  for (var i=0; i<seg.length; ++i) {
    var bez = arc.bezier(seg[i]);
    // g.bezierCurveTo.apply(g, bez);
  }
}
