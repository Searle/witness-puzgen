'use strict';

const Panel= function() {

    let svg;
    let mouseX= -100;
    let mouseY= -100;
    let mouseX_= -100;
    let mouseY_= -100;

    const width= 5;
    const height= 5;
    const gapsX= [ [ 0 ], [ 2, 3 ], [], [], [] ];
    const gapsY= [];    // TODO: Draw!
    const inCX= 0;
    const inCY= height - 1;
    const outCX= width - 1;
    const outCY= 0;
    const way= [ [ inCX, inCY ], [ 0, 2 ], [ 3, 2 ], [ 3, 0 ], [ outCX, outCY ] ];

    const lineColor= '#F00';
    const border= 10;
    const lineWidth= 4;
    const gapWidth= 6;

    const nodeX= [];
    const nodeY= [];
    for ( let x= 0; x < width;  x++ ) nodeX[x]= (100 - lineWidth - border * 2) * x / (width - 1)  + lineWidth / 2 + border;
    for ( let y= 0; y < height; y++ ) nodeY[y]= (100 - lineWidth - border * 2) * y / (height - 1) + lineWidth / 2 + border;

    const inX= nodeX[inCX];
    const inY= nodeY[inCY];
    const outX= nodeX[outCX];
    const outY= nodeY[outCY];
    let outX1= nodeX[outCX];
    let outY1= nodeY[outCY];

    if ( outCX == 0 ) outX1 -= lineWidth;
    if ( outCX == width - 1 ) outX1 += lineWidth;
    if ( outCY == 0 ) outY1 -= lineWidth;
    if ( outCY == height - 1 ) outY1 += lineWidth;

    const outCX1= width;
    const outCY1= height;
    nodeX[outCX1]= outX1;
    nodeY[outCY1]= outY1;

    const _dist= (x0, y0, x1, y1) => Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));

/*
    const _pointDist= (xa, ya, xb, yb, x, y ) => {
        const dxab= xb - xa;
        const dyab= yb - ya;
        const d= dyab * (x - xa) - dxab * (y - ya);
        return Math.sqrt(d * d / (dxab * dxab + dyab * dyab));
    };
*/
    const _projectedPointOnLineDist= (x1, y1, x2, y2, x, y) => {
        const dx= x2 - x1;
        const dy= y2 - y1;
        const t= (dx * (x - x1) + dy * (y - y1)) / (dx * dx + dy * dy);
        const px = dx * t + x1;
        const py = dy * t + y1;
        return _dist(x1, y1, px, py);
    };

    const _setMousePos= function( event ) {
        const node= svg.node;
        const rect= node.getBoundingClientRect();

// console.log(rect);

        mouseX_= mouseX= 100 * (event.clientX - rect.x) / rect.width;
        mouseY_= mouseY= 100 * (event.clientY - rect.y) / rect.height;
    };

    const _drawWay= function( way ) {
        let pointsStr= '';
        let pathLength= 0;
        let lastX;
        let lastY;
        for ( var i= 0; i < way.length; i++ ) {
            let x= nodeX[way[i][0]];
            let y= nodeY[way[i][1]];
            pointsStr += ',' + x + ',' + y;
            if ( i ) pathLength += _dist(lastX, lastY, x, y);
            lastX= x;
            lastY= y;
        }

        if ( currentTrackNext ) {
            const tX= currentTrackNext.x;
            const tY= currentTrackNext.y;
            const p= currentTrackNextPercent;
            const pX= lastX * (1 - p) + tX * ( p);
            const pY= lastY * (1 - p) + tY * ( p);
            pointsStr += ',' + pX + ',' + pY;
            pathLength += _dist(lastX, lastY, pX, pY);
        }

        wayPath.attr('stroke-dashoffset', 10000 - pathLength);
        wayPath.plot('M' + pointsStr.substr(1));
    };

    let trackMouse= false;
    const track= [];
    const trackNext= [];
    const trackCells= [];
    let currentTrackNext;
    let currentTrackNextPercent;
    let trackCX;
    let trackCY;

    const _addTrackNext= function( cx, cy, gaps, g ) {
        let isGap= false;

        if ( gaps ) {

            // FIXME: Refactor to eliminate table scan
            for ( let i= 0; i < gaps.length; i++ ) {
                if ( gaps[i] == g ) { isGap = true; break; }
            }
        }

        trackNext.push({ cx: cx, cy: cy, x: nodeX[cx], y: nodeY[cy], percent: 0, dist: 0, isGap: isGap });
    };

    const _updateTrackNext= function() {
        currentTrackNext= undefined;
        trackNext.length= 0;

// console.log("UPDTN", trackCX, trackCY);

        if ( trackCX == outCX1 && trackCY == outCY1 ) {
            _addTrackNext(outCX, outCY);
            return;
        }

        if ( trackCX > 0          ) _addTrackNext(trackCX - 1, trackCY, gapsX[trackCY], trackCX - 1);
        if ( trackCX < width - 1  ) _addTrackNext(trackCX + 1, trackCY, gapsX[trackCY], trackCX);
        if ( trackCY > 0          ) _addTrackNext(trackCX, trackCY - 1, gapsY[trackCX], trackCY - 1);
        if ( trackCY < height - 1 ) _addTrackNext(trackCX, trackCY + 1, gapsY[trackCX], trackCY);
        if ( trackCX == outCX && trackCY == outCY ) {
            trackNext.push({ cx: outCX1, cy: outCY1, x: outX1, y: outY1, percent: 0, dist: 0, isGap: false });
        }
    };

    const _drawTrack= function() {
        _drawWay(track);
    };

    const _addToTrack= function( x, y ) {

// console.log("ADD", x, y);

        trackCX= x;
        trackCY= y;
        track.push([ trackCX, trackCY ]);
        trackCells[trackCY * width + trackCX]= track.length;

// _drawTrack();
// console.table(track);

        _updateTrackNext();
    };

    const _removeFromTrack= function() {
        trackCells[trackCY * width + trackCX]= 0;
        track.pop();
        trackCX= track[track.length - 1][0];
        trackCY= track[track.length - 1][1];
    };

    const _resetTrack= function() {
        track.length= 0;
        trackCells.length= 0;
        _addToTrack(inCX, inCY);
    };

    let rec= 0;
    let recOne= 0;
    const _updateTrack= function() {
        rec++;
        if ( rec > 10 ) {
            console.log("RECURSION");
            debugger;
            if ( recOne == 0 ) {
                _recOne= 1;
                __updateTrack();
            }
        }
        else {
            __updateTrack();
        }
        rec--;
    }

    const __updateTrack= function() {
        if ( !trackNext.length ) return;

// console.log("A");

        trackNext.map(next => {
            const nextNodeDist= _dist(nodeX[trackCX], nodeY[trackCY], next.x, next.y);
            next.percent= _projectedPointOnLineDist(nodeX[trackCX], nodeY[trackCY], next.x, next.y, mouseX, mouseY) / nextNodeDist;
            next.dist= _dist(next.x, next.y, mouseX, mouseY) / nextNodeDist;
        });
        trackNext.sort((next1, next2) => next1.dist - next2.dist);

// if ( currentTrackNext) console.log(currentTrackNext.cx, currentTrackNext.cy, currentTrackNext.percent);
// console.log("B", trackNext[0].dist);


        if ( trackNext[0].dist > 1 ) {

// console.log("F");

            return;
        }

        const cell= trackCells[trackNext[0].cy * width + trackNext[0].cx];

// console.log("E");

        if ( cell && currentTrackNext && (trackNext[0].cx == currentTrackNext.cx || trackNext[0].cy == currentTrackNext.cy) ) {

// console.log(trackCX, trackCY, trackNext, cell, track.length - 1);
// console.log(cell, track.length, trackCX, trackCY, trackNext[0], currentTrackNext);

            if ( cell == track.length - 1 ) {
                _removeFromTrack();
                _updateTrackNext();

// console.log("NXY", trackCX, trackCY, trackNext);

                _updateTrack();
                return;
            }
        }

        if ( currentTrackNext ) {

// console.log("C");

            if ( trackNext[0].cx != currentTrackNext.cx || trackNext[0].cy != currentTrackNext.cy ) {

// console.log("D", currentTrackNext.cx, currentTrackNext.cy, currentTrackNextPercent, currentTrackNext.percent);
// console.table(trackNext);

                if ( currentTrackNext.percent > .3 ) return;
            }
        }

// console.log("T=", trackNext[0].percent, trackNext[0].dist);

        currentTrackNext= trackNext[0];

        if ( currentTrackNext.isGap ) {
            currentTrackNextPercent= currentTrackNext.percent > .3 ? .3 : currentTrackNext.percent;
            return;
        }

        if ( cell ) {
            currentTrackNextPercent= currentTrackNext.percent > .6 ? .6 : currentTrackNext.percent;
            return;
        }

// console.log("DIST", currentTrackNext.dist, _dist(currentTrackNext.x, currentTrackNext.y, nodeX[trackCX], nodeY[trackCY]) );

        if ( currentTrackNext.percent < 1 ) {
            currentTrackNextPercent= currentTrackNext.percent;
            return;
        }

        _addToTrack(currentTrackNext.cx, currentTrackNext.cy);
        _updateTrack();  // Tail recursion
    };

    let lastMouseX= 0;
    let lastMouseY= 0;
    const FACT= .2;

    const _loop= function() {
        if ( !trackMouse ) return;

        if ( mouseX_ != lastMouseX || mouseY_ != lastMouseY ) {

// console.log((mouseX_ - lastMouseX) * FACT, (mouseY_ - lastMouseY) * FACT);

            mouseX= mouseX_ + (mouseX_ - lastMouseX) * FACT;
            mouseY= mouseY_ + (mouseY_ - lastMouseY) * FACT;
            lastMouseX= mouseX_;
            lastMouseY= mouseY_;
            _updateTrack();
            _drawTrack();
        }
        window.requestAnimationFrame(_loop);
    }

    const setSvg= function( svg_ ) {
        svg= svg_;

        svg.on('mousedown', function( event ) {
            _setMousePos(event);

            trackMouse= false;

            const d= _dist(inX, inY, mouseX, mouseY);
            if ( d < lineWidth * 1.4 ) {
                trackMouse= true;
            }

            _resetTrack();
            _updateTrack();
            _drawTrack();

            window.requestAnimationFrame(_loop);
        });
        svg.on('mouseup', function( event ) {
            // trackMouse= false;
        });
        svg.on('mousemove', function( event ) {
            _setMousePos(event);

//            if ( !trackMouse ) return;

//            _updateTrack();
//            _drawTrack();

/*
            const trackEX= nodeX[trackX];
            const trackEY= nodeY[trackY];

            const d= _dist(nodeX, nodeY, mouseX, mouseY);

            console.log(d, lineWidth * 1.4, "MXY", mouseX, mouseY, "IN", inX, inY, "OUT", outX, outY);

            // console.log("WIDTH", window.aa= svg.node);
            // console.log(event, svg.node.offsetWidth);
            // rect.draw(event, options);
*/
        });

    };

    const drawPanel= function() {

        svg.node.setAttribute('viewBox', '0 0 100 100');
        svg.size(100, 100);
        svg.rect(100, 100).attr({ fill: '#fF6' });

//        var polygon = svg.polygon([ nodeX[0], nodeY[0], nodeX[width - 1], nodeY[0], nodeX[width - 1], nodeY[height - 1], nodeX[0], nodeY[height - 1] ])
//        polygon.fill('none').move(nodeX[0], nodeY[0])
//        polygon.stroke({ color: lineColor, width: lineWidth, linecap: 'round', linejoin: 'round' })

        svg.circle(lineWidth).center(nodeX[0], nodeY[0]).fill(lineColor);
        svg.circle(lineWidth).center(nodeX[width - 1], nodeY[0]).fill(lineColor);
        svg.circle(lineWidth).center(nodeX[width - 1], nodeY[height - 1]).fill(lineColor);
        svg.circle(lineWidth).center(nodeX[0], nodeY[height - 1]).fill(lineColor);
        svg.circle(lineWidth * 3).center(inX, inY).fill(lineColor);
        svg.line(outX, outY, outX1, outY1).stroke({ color: lineColor, width: lineWidth, linecap: 'round' });

        for ( let x= 0; x < width; x++ ) {
            svg.line(nodeX[x], nodeY[0], nodeX[x], nodeY[height - 1]).stroke({ color: lineColor, width: lineWidth });
        }

        for ( let y= 0; y < height; y++ ) {
            let fromX= nodeX[0];
            let toX= nodeX[width - 1];
            for ( let i= 0; i < gapsX[y].length; i++ ) {
                toX= (nodeX[gapsX[y][i]] + nodeX[gapsX[y][i] + 1]) / 2 - gapWidth / 2;
                svg.line(fromX, nodeY[y], toX, nodeY[y]).stroke({ color: lineColor, width: lineWidth });
                fromX= toX + gapWidth;
                toX= nodeX[width - 1];
            }
            svg.line(fromX, nodeY[y], toX, nodeY[y]).stroke({ color: lineColor, width: lineWidth });
        }
    };

    let wayPath;

    const drawWay= function() {

        let pointsStr= '';
        let pathLength= 0;
        let lastX;
        let lastY;
        for ( var i= 0; i < way.length; i++ ) {
            let x= nodeX[way[i][0]];
            let y= nodeY[way[i][1]];
            pointsStr += ',' + x + ',' + y;
            if ( i ) pathLength += _dist(lastX, lastY, x, y);
            lastX= x;
            lastY= y;
        }
        pointsStr += ',' + outX1 + ',' + outY1;
        pathLength += _dist(outX, outY, outX1, outY1);

// console.log(pathLength);

        if ( wayPath ) wayPath.remove();

// console.log(pointsStr);

        var path= svg.path('M' + pointsStr.substr(1));
        path.fill('none'); // .move(nodeX[0] < outX1 ? nodeX[0] : outX1, nodeY[0] < outY1 ? nodeY[0] : outY1);
        path.attr('stroke-dasharray', 10000);
        path.attr('stroke-dashoffset', 10000);
        path.stroke({ color: '#000', width: lineWidth, linecap: 'round', linejoin: 'round' })
        path.animate().attr({ 'stroke-dashoffset': 10000 - pathLength });

        wayPath= path;
    };

    this.setSvg= setSvg;
    this.drawPanel= drawPanel;
    this.drawWay= drawWay;
};

const panel= new Panel();
panel.setSvg(SVG('drawing'));
panel.drawPanel();
panel.drawWay();

/*
var draw = SVG('drawing').size(300, 130)
var polyline = draw.polyline('50,0 60,40 100,50 60,60 50,100 40,60 0,50 40,40')
polyline.fill('none').move(20, 20)
polyline.stroke({ color: '#f06', width: 4, linecap: 'round', linejoin: 'round' })
*/
