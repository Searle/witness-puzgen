(function( global ) {

'use strict';

const DEBUG= global.DEBUG_PUZZLE;

const colors= [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#800000', '#808000',
    '#008000', '#800080', '#008080', '#000080'
];


/*
    walls[] am Beispiel: w=3, h=3

    In walls wird die zweidimensionale Matrix in ein ein eindimensionales Array abgebildet.
    Die naechste horizontale Zelle von n ist bei n + 1.
    Die naechste vertikale Zelle von n ist bei n + (w + 2).
    walls enthaelt Ausserhalb-der-Matrix-Marker um schnell feststellen zu koennen, ob z.B.
    walls[n+1] oder walls[n+2] ausserhalb des gueltigen Bereichs ist.

    Spalte  Nummer.Vertikal..Horizontal
            0.V..H  1.V..H  2.V..H  2+1.V..H  2+2.V..H
    Zeile
    0-2       -  -    -  -    -  -      -  -      -  -      -  Ausserhalb-Marker (-1)
    0 -       -  -    -  -    -  -      -  -      -  -      V  Vertikale Weg (0) / Wand (1)
    0         V  H    V  H    V  H      V  -      -  -      H  Horizonaler Weg (0) / Wand (1)
    1         V  H    V  H    V  H      V  -      -  -
    2         V  H    V  H    V  H      V  -      -  -
    2+1       -  H    -  H    -  H      -  -      -  -
    2+2       -  -    -  -    -  -      -  -      -  -
*/

const show_walls= function( walls, w, h ) {
    const per_line= (w + 2) * 2;
    const v= (value) => value < 0 ? value : ' ' + value;
    let html= '';

    for ( let y= 0; y < h + 4; y++ ) {
        for ( let x= 0; x < w + 2; x++ ) {
            const i= y * per_line + x * 2;
            html += v(walls[i]) + ' ' + v(walls[i + 1]) + '|';
        }
        html += y * per_line + '<br>';
    }
    html += '<hr>';
    for ( let y= 0; y < h + 1; y++ ) {
        let v= '';
        let h= '';
        for ( let x= 0; x < w + 1; x++ ) {
            const i= (y + 2) * per_line + x * 2;
            v += walls[i + 1] == 1 ? ' -- ' : '    ';
            h += walls[i] == 1 ? '|   ' : '    ';
        }
        html += v + '<br>' + h + '<br>';
    }
    html= '<pre>' + html + '</pre>';
    document.getElementById('walls').innerHTML= html;
}


const fill_walls= function( walls, w, h ) {

    const per_line= (w + 2) * 2;
    const cells= [];
    const cellList= [];
    let color= 1;

    const DIRS= [ [ 0, -1 ], [ 1, 0 ], [ 0, 1 ], [ -1, 0 ] ];

    for ( let y= 0; y < h + 2; y++ ) {
        cells[y]= [];
        for ( let x= 0; x < w + 2; x++ ) {
            cells[y][x]= (x == 0 || x == w + 1 || y == 0 || y == h + 1) ? -1 : 0;
        }
    }

    const cw= function( x, y, dir ) {
        const inx= (y + 2) * per_line + x * 2;
        if ( dir == 0 ) return walls[inx + 1];              // UP;
        if ( dir == 1 ) return walls[inx + 2];              // RIGHT;
        if ( dir == 2 ) return walls[inx + per_line + 1];   // DOWN;
        if ( dir == 3 ) return walls[inx];                  // LEFT;
        return 0;
    };

    const mark= function( x, y, color ) {
        cells[y + 1][x + 1]= color;
        cellList.push([ x, y ]);
    };

    const fillList= [ [ 0, 0, color ] ];

    let guard= 1000;
    while ( --guard && fillList.length ) {
        let x= fillList[0][0];
        let y= fillList[0][1];
        let color= fillList[0][2];
        fillList.shift();
        if ( cells[y + 1][x + 1] !== 0 ) continue;

        mark(x, y, color);
        while ( --guard && cellList.length ) {
            let x= cellList[0][0];
            let y= cellList[0][1];
            for ( let i= 0; i < 4; i++ ) {
                const x1= x + DIRS[i][0];
                const y1= y + DIRS[i][1];
                if ( cells[y1 + 1][x1 + 1] == 0 ) {
                    if ( cw(x, y, i) == 0 ) {
                        mark(x1, y1, color);
                    }
                    else {
                        fillList.push([ x1, y1, color + 1 ]);
                    }
                }
            }
            cellList.shift();
        }
    }

// console.table(cells);
// console.table(cellList);

    return cells;
};


const gen_cells_and_gaps= function( w, h ) {
    const walls= [];

    const per_line= (w + 2) * 2;
    for ( let i= 0; i < per_line * (h + 4); i++ ) {
        walls[i]= -1;
    }


/*
    Spalte  Nummer.Vertikal..Horizontal
            0.V..H  1.V..H  2.V..H  2+1.V..H  2+2.V..H
    Zeile
    0-2       -  -    -  -    -  -      -  -      -  -      -  Ausserhalb-Marker (-1)
    0 -       -  -    -  -    -  -      -  -      -  -      V  Vertikale Weg (0) / Wand (1)
    0         V  H    V  H    V  H      V  -      -  -      H  Horizonaler Weg (0) / Wand (1)
    1         V  H    V  H    V  H      V  -      -  -
    2         V  H    V  H    V  H      V  -      -  -
    2+1       -  H    -  H    -  H      -  -      -  -
    2+2       -  -    -  -    -  -      -  -      -  -
*/

    let wall_length= 0;
    const min_wall_length= Math.pow(w + h + 2, 1.37) - 3;  // Empirisch ermittelt

    // Mit einem Weg am Rand initialisieren:
    // for ( let y= 0; y < h + 1; y++ ) {
    //     for ( let x= 0; x < w + 1; x++ ) {
    //         if ( x < w ) walls[(y + 2) * per_line + x * 2 + 1]= y == 0 ? 1 : 0;
    //         if ( y < h ) walls[(y + 2) * per_line + x * 2]= x == 0 ? 1 : 0;
    //     }
    // }

    // Initialiseren mit folgenden Waenden:
    // (0, h + 1) -> (0, h / 2) -> (w + 1, h / 2) -> (w + 1, 0)
    const y2= (h / 2) | 0;

    for ( let y= 0; y < h + 1; y++ ) {
        for ( let x= 0; x < w + 1; x++ ) {
            if ( x < w ) walls[(y + 2) * per_line + x * 2 + 1]= y == y2 ? (wall_length++, 1) : 0;
            if ( y < h ) walls[(y + 2) * per_line + x * 2]= x == (y < y2 ? w : 0) ? (wall_length++, 1) : 0;
        }
    }

    const start1= per_line * (h + 1);
    const start2= start1 + per_line + 1;
    const end1= per_line * 2 + w * 2 - 1;
    const end2= per_line * 2 + w * 2;

    const is_start_or_end= inx => inx == start1 || inx == start2 || inx == end1 || inx == end2;

    const _change_wall= function( inx, dir ) {

        let ofsF, ofsFS1, ofsFS2, ofsS1, ofsS2;
        if ( inx & 1 ) {
            if ( dir == 0 ) {           // UP
                ofsF= -per_line;
                ofsFS1= -per_line - 2;
                ofsFS2= -per_line + 2;
                ofsS1= -per_line - 1;
                ofsS2= -per_line + 1;
            }
            else {                      // DOWN
                ofsF= per_line;
                ofsFS1= per_line + 2;
                ofsFS2= per_line - 2;
                ofsS1= 1;
                ofsS2= -1;
            }
        }
        else {                          // LEFT
            if ( dir == 0 ) {
                ofsF= -2;
                ofsFS1= per_line - 2;
                ofsFS2= -per_line - 2;
                ofsS1= per_line - 1;
                ofsS2= -1;
            }
            else {                      // RIGHT
                ofsF= 2;
                ofsFS1= -per_line + 2;
                ofsFS2= per_line + 2;
                ofsS1= 1;
                ofsS2= per_line + 1;
            }
        }

        if ( walls[inx + ofsF] ) return false;

// const w= inx => "w[" + inx + "]=" + walls[inx];
// console.log("inx=", inx, "dir=", dir, w(inx + ofsF), w(inx + ofsS1), w(inx + ofsS2), w(inx + ofsF + ofsS1), w(inx + ofsF + ofsS2), w(inx + ofsFS1), w(inx + ofsFS2));


        //  .      -
        // |   =>   |
        //  .      -
        if (   walls[inx + ofsS1] != 1
            && walls[inx + ofsS2] != 1
            && walls[inx + ofsF + ofsS1] != 1
            && walls[inx + ofsF + ofsS2] != 1
            && walls[inx + ofsFS1] != 1
            && walls[inx + ofsFS2] != 1
        ) {
            walls[inx]= 0;
            walls[inx + ofsF]= 1;
            if ( walls[inx + ofsS1] == 0 ) walls[inx + ofsS1]= 1;
            if ( walls[inx + ofsS2] == 0 ) walls[inx + ofsS2]= 1;
            wall_length += 2;
            return true;
        }

        //  -
        // | .  =>  . |
        //  -
        if (   walls[inx + ofsS1] == 1
            && walls[inx + ofsS2] == 1
        ) {
            walls[inx]= 0;
            walls[inx + ofsF]= 1;
            walls[inx + ofsS1]= 0;
            walls[inx + ofsS2]= 0;
            wall_length -= 2;
            return true;
        }

        //  .      -
        // |   =>   |
        //  -      .
        if (   walls[inx + ofsS1] != 1
            && walls[inx + ofsS2] == 1
            && walls[inx + ofsF + ofsS1] != 1
            && walls[inx + ofsFS1] != 1
            && !is_start_or_end(inx)
            && !is_start_or_end(inx + ofsS2)
        ) {
            walls[inx]= 0;
            walls[inx + ofsF]= 1;
            if ( walls[inx + ofsS1] == 0 ) walls[inx + ofsS1]= 1;
            walls[inx + ofsS2]= 0;
            return true;
        }

        //  -      .
        // |   =>   |
        //  .      -
        if (   walls[inx + ofsS1] == 1
            && walls[inx + ofsS2] != 1
            && walls[inx + ofsF + ofsS2] != 1
            && walls[inx + ofsFS2] != 1
            && !is_start_or_end(inx)
            && !is_start_or_end(inx + ofsS1)
        ) {
            walls[inx]= 0;
            walls[inx + ofsF]= 1;
            walls[inx + ofsS1]= 0;
            if ( walls[inx + ofsS2] == 0 ) walls[inx + ofsS2]= 1;
            return true;
        }

        return false;
    };

    const randomise_wall= function() {
        let guard= 1000;
        while ( --guard ) {
            const inx= Math.floor(Math.random() * walls.length);
            if ( walls[inx] != 1 ) continue;

            const dir= Math.floor(Math.random() * 2);
            if ( _change_wall(inx, dir) ) break;
        }

        // console.log("WALL_LENGTH", wall_length, min_wall_length);
    };

    //  Fuellungen entfernen
    //
    const optimise_cells_remove_fill= function( cells ) {

        const DIRS= [ [ 0, -1 ], [ 1, 0 ], [ 0, 1 ], [ -1, 0 ] ];
        let remove= [];

        for ( let y= 0; y < h; y++ ) {
            for ( let x= 0; x < w; x++ ) {
                let color= cells[y + 1][x + 1];
                let found= true;
                for ( let i= 0; i < 4; i++ ) {
                    const x0= x + 1 + DIRS[i][0];
                    const y0= y + 1 + DIRS[i][1];
                    if ( cells[y0][x0] > 0 && cells[y0][x0] != color ) {
                        found= false;
                        break;
                    }
                }
                if ( found ) remove.push([ x + 1, y + 1 ]);
            }
        }

        for ( let i= 0; i < remove.length; i++ ) {
            const x= remove[i][0];
            const y= remove[i][1];
            cells[y][x]= -cells[y][x];
        }
    };

    //  In Dreier-Ecke kann immer die Ecke entfernt werden
    //  Alle 4 Rotationen von   XX      .X
    //                          XO  =>  XO
    //
    const optimise_cells_dead_spots= function( cells ) {

        const POS= [ [ 0, 0 ], [ 1, 0 ], [ 1, 1 ], [ 0, 1 ] ];

        for ( let y= 0; y < h; y++ ) {
            for ( let x= 0; x < w; x++ ) {
                for ( let rot= 0; rot < 4; rot++ ) {
                    const x0= x + 1 + POS[rot][0];
                    const y0= y + 1 + POS[rot][1];
                    const n1x= x + 1 + POS[(rot + 1) & 3][0];
                    const n1y= y + 1 + POS[(rot + 1) & 3][1];
                    const n2x= x + 1 + POS[(rot + 2) & 3][0];
                    const n2y= y + 1 + POS[(rot + 2) & 3][1];
                    const n3x= x + 1 + POS[(rot + 3) & 3][0];
                    const n3y= y + 1 + POS[(rot + 3) & 3][1];
                    if ( cells[y0][x0] > 0
                        && cells[y0][x0] == cells[n1y][n1x]
                        && cells[y0][x0] == cells[n3y][n3x]
                        && cells[n2y][n2x] > 0
                    ) {
                        cells[y0][x0]= -cells[y0][x0];
                    }
                }
            }
        }
    };

    const optimise_cells_make_gaps= function( cells, gapsX, gapsY ) {

        const DIRS= [ [ -1, 0 ], [ 1, 0 ], [ 0, -1 ], [ 0, 1 ] ];

        const run= () => {
            let done= true;
            for ( let y= 0; y < h; y++ ) {
                for ( let x= 0; x < w; x++ ) {
                    let color= cells[y + 1][x + 1];
                    if ( color <= 0 ) continue;

                    let foundDir= -1;
                    for ( let i= 0; i < 4; i++ ) {
                        const x0= x + 1 + DIRS[i][0];
                        const y0= y + 1 + DIRS[i][1];
                        if ( cells[y0][x0] == color ) {
                            if ( foundDir >= 0 ) {
                                foundDir= -1;
                                break;
                            }
                            foundDir= i;
                        }
                    }
                    if ( foundDir >= 0 ) {
                        done= false;
                        if ( foundDir == 0 ) gapsY[x].push(y);
                        if ( foundDir == 1 ) gapsY[x + 1].push(y);
                        if ( foundDir == 2 ) gapsX[y].push(x);
                        if ( foundDir == 3 ) gapsX[y + 1].push(x);
                    }
                }
            }
            return done;
        };

        let guard= 100;
        while ( --guard ) {
            if ( run() ) break;
        }

        const unique= (arr) => [...new Set(arr)].sort((a, b) => a - b)

        for ( let y= 0; y < h + 1; y++ ) gapsX[y]= unique(gapsX[y])


        for ( let y= 0; y < h + 1; y++ ) {
            gapsX[y]= unique(gapsX[y])
            for ( let i= 0; i < gapsX[y].length; i++ ) {
                const x0= gapsX[y][i] + 1;
                const y0= Math.random() < .5 ? y : y + 1;
                cells[y0][x0]= 0;
                // console.log("GAPS", y0, x0);
            }
        }

        for ( let x= 0; x < w + 1; x++ ) {
            gapsY[x]= unique(gapsY[x])
            for ( let i= 0; i < gapsY[x].length; i++ ) {
                const x0= Math.random() < .5 ? x : x + 1;
                const y0= gapsY[x][i] + 1;
                cells[y0][x0]= 0;
                // console.log("GAPS", y0, x0);
            }
        }

// console.table(gapsX);
// console.table(gapsY);
    };


//    _change_wall(30, 1);
//    _change_wall(21, 1);
//    _change_wall(25, 1);
//    _change_wall(23, 1);

    // console.log("min_wall_length", min_wall_length, w, h);

    for ( let i= 0; i < w * h * 2; i++ ) {
        randomise_wall();

        if ( wall_length >= min_wall_length ) break;
    }

    if ( DEBUG ) show_walls(walls, w, h);

    const cells= fill_walls(walls, w, h);
    const gapsX= [];
    const gapsY= [];

    for ( let x= 0; x < w + 1; x++ ) gapsX.push([]);
    for ( let y= 0; y < h + 1; y++ ) gapsY.push([]);

    optimise_cells_remove_fill(cells);
    optimise_cells_dead_spots(cells);
    optimise_cells_make_gaps(cells, gapsX, gapsY);

    return [ cells, gapsX, gapsY ];
};


const show_cells= function( cells, w, h, bw ) {
    let table= "";
    for ( let y= 0; y < h - 1; y++ ) {
        let row= '';
        for ( let x= 0; x < w - 1; x++ ) {
            let style= '';
            let value= cells[y + 1][x + 1];
            if ( value < 0) {
                value= -value;
                style= 'opacity: .0; x-background-color: #FFF !important;';
            }
            if ( bw ) {
                const color= value & 1 ? '#FFF' : '#000';
                // style += 'background-color: ' + color + '; border: 3px solid ' + (colors[value % colors.length]) + ';';
                style += 'background-color: ' + color + '; border: 3px solid transparent;';
            }
            else {
                style += 'background-color: ' + (colors[value % colors.length]) + ';';
            }
            row += '<span class="circle" style="' + style + '"></span>';
        }
        table += '<div>' + row + '</div>';
    }
    const html= '<div class="panel' + (bw ? ' bw' : '') + '">' + table + '</div>';
    document.getElementById('cells').innerHTML= html;
};


const new_walls= function( w, h, init ) {

    const walls= [];
    const per_line= (w + 2) * 2;

    for ( let i= 0; i < per_line * (h + 4); i++ ) {
        walls[i]= -1;
    }

    for ( let y= 0; y < h + 1; y++ ) {
        for ( let x= 0; x < w + 1; x++ ) {
            if ( x < w ) walls[(y + 2) * per_line + x * 2 + 1]= init(x, y, 0);
            if ( y < h ) walls[(y + 2) * per_line + x * 2]= init(x, y, 1);
        }
    }

    return walls;
};


const way_to_walls= function( way, w, h ) {

    const walls= new_walls(w, h, (x, y, vertical) => 0);

    const per_line= (w + 2) * 2;

    const _set= (x, y, dx, dy) => {
        let inx= (y + 2) * per_line + x * 2;
        if ( dx ) inx++;
        if ( dx < 0 ) inx -= 2;
        if ( dy < 0 ) inx -= per_line;
        walls[inx]= 1;
    };

    let x= way[0][0];
    let y= way[0][1];
    for ( let i= 1; i < way.length; i++ ) {
        const x_= way[i][0];
        const y_= way[i][1];
        const dx= Math.sign(x_ - x);
        const dy= Math.sign(y_ - y);
        _set(x, y, dx, dy);

        let guard= 100;
        while ( --guard ) {
            x= (x + dx)|0;    // Nach Int wandeln um moegliche Rundungsfehler verhindern
            y= (y + dy)|0;
            if ( (dx && x == x_) || (dy && y == y_) ) break;

// console.log("XY", x,y, dy != 0);

            _set(x, y, dx, dy);
        }
    }

    return walls;
};


// w und h sind Wege, nicht Zellen!
const Puzzle= function( w, h ) {

    var [ cells, gapsX, gapsY ]= gen_cells_and_gaps(w - 1, h - 1);

    var outputCells;

    if ( DEBUG ) show_cells(cells, w, h, true);

    this.getCells= () => {
        if ( !outputCells ) {
            outputCells= [];
            for ( let y= 0; y < h; y++ ) {
                outputCells[y]= [];
                for ( let x= 0; x < w; x++ ) {
                    outputCells[y][x]= cells[y + 1][x + 1] < 0 ? 0 : cells[y + 1][x + 1];
                }
            }
        }
        return outputCells;
    };

    this.getGapsX= () => gapsX;
    this.getGapsY= () => gapsY;

    this.checkWay= (way) => {
        const walls= way_to_walls(way, w - 1, h - 1);

//        show_walls(walls, w - 1, h - 1);

        const wayCells= fill_walls(walls, w - 1, h - 1);

//        show_cells(cells, w, h, false);

        const lookup= {};

        for ( let y= 0; y < h; y++ ) {
            for ( let x= 0; x < w; x++ ) {
                const wayColor= wayCells[y + 1][x + 1];
                if ( wayColor <= 0 ) continue;

                const color= cells[y + 1][x + 1];
                if ( color <= 0 ) continue;

                if ( wayColor in lookup ) {
                    if ( lookup[wayColor] != color ) return false;
                }
                else {
                    lookup[wayColor]= color;
                }
            }
        }

        return true;
    };
};


if ( DEBUG ) {

    let seed;
    Math.random= function() {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const test0= function() {
        seed= 1;
        const puzzle= new Puzzle(6, 6);
        // const ok= puzzle.checkWay([ [ 0, 5 ], [ 0, 2 ], [ 3, 2 ], [ 3, 4 ], [ 5, 4 ], [ 5, 2 ], [ 4, 2 ], [ 4, 1 ], [ 3, 1 ], [ 3, 0 ], [ 5, 0 ] ]);
        const ok= puzzle.checkWay([ [ 0, 5 ], [ 0, 2 ], [ 3, 2 ], [ 3, 5 ], [ 5, 5 ], [ 5, 2 ], [ 4, 2 ], [ 4, 1 ], [ 3, 1 ], [ 3, 0 ], [ 5, 0 ] ]);
        console.log("OK", ok);
    };

    const test1= function() {
        const w= 5;
        const h= 5;
        const walls= way_to_walls([ [ 0, 5 ], [ 0, 2 ], [ 3, 2 ], [ 3, 4 ], [ 5, 4 ], [ 5, 2 ], [ 4, 2 ], [ 4, 1 ], [ 3, 1 ], [ 3, 0 ], [ 5, 0 ] ], w, h);

        show_walls(walls, w, h);

        const cells= fill_walls(walls, w, h);
        const cellLists= cells_fill_walls(walls, w, h);
        show_cells(cells, w + 1, h + 1, false);
    };

    test0();
}

global.Puzzle= Puzzle;

})( window, window.DEBUG_PUZZLE );
