(function( global ) {

const DEBUG= global.DEBUG_PUZZLE;

const colors= [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#800000', '#808000',
    '#008000', '#800080', '#008080', '#000080'
];

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


const gen_cells= function( w, h ) {
    const walls= [];

    const per_line= (w + 2) * 2;
    for ( let i= 0; i < per_line * (h + 4); i++ ) {
        walls[i]= -1;
    }

//    const xc= Math.floor(w / 2) + (w & 1) * (Math.random() > .5 ? 1 : 0);
//    const yc= Math.floor(h / 2) + (h & 1) * (Math.random() > .5 ? 1 : 0);

    for ( let y= 0; y < h + 1; y++ ) {
        for ( let x= 0; x < w + 1; x++ ) {
            if ( x < w ) walls[(y + 2) * per_line + x * 2 + 1]= y == 0 ? 1 : 0;
            if ( y < h ) walls[(y + 2) * per_line + x * 2]= x == 0 ? 1 : 0;
        }
    }

    const start1= per_line * (h + 1);
    const start2= start1 + per_line + 1;
    const end1= per_line * 2 + w * 2 - 1;
    const end2= per_line * 2 + w * 2;

    const is_start_or_end= inx => inx == start1 || inx == start2 || inx == end1 || inx == end2;

    const _change_wall= function( inx, dir ) {

        let ofsF, ofsS1, ofsS2;
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

        const w= inx => "w[" + inx + "]=" + walls[inx];

// console.log(inx, dir, inx + ofsF, inx + ofsS1, inx + ofsS2, inx + ofsF + ofsS1, inx + ofsF + ofsS2, inx + ofsFS1, inx + ofsFS2);
console.log("inx=", inx, "dir=", dir, w(inx + ofsF), w(inx + ofsS1), w(inx + ofsS2), w(inx + ofsF + ofsS1), w(inx + ofsF + ofsS2), w(inx + ofsFS1), w(inx + ofsFS2));


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

    const modify_wall= function() {
        let guard= 1000;
        while ( --guard ) {
            const inx= Math.floor(Math.random() * walls.length);
            if ( walls[inx] != 1 ) continue;

            const dir= Math.floor(Math.random() * 2);
            if ( _change_wall(inx, dir) ) break;
        }
    };

    const fill_wall= function() {

        const cells= [];
        const cellList= [];
        let color= 5;

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

        console.table(cells);
        console.table(cellList);

        return cells;
    };

    const optimise_cells1= function( cells ) {

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

    const optimise_cells2= function( cells ) {

// return;

        const POS= [
            [ 0, 0 ],
            [ 1, 0 ],
            [ 1, 1 ],
            [ 0, 1 ],
        ];

        for ( let y= 0; y < h; y++ ) {
            for ( let x= 0; x < w; x++ ) {
                for ( let i= 0; i < 4; i++ ) {
                    const x0= x + 1 + POS[i][0];
                    const y0= y + 1 + POS[i][1];
                    const n1x= x + 1 + POS[(i + 1) & 3][0];
                    const n1y= y + 1 + POS[(i + 1) & 3][1];
                    const n2x= x + 1 + POS[(i + 2) & 3][0];
                    const n2y= y + 1 + POS[(i + 2) & 3][1];
                    const n3x= x + 1 + POS[(i + 3) & 3][0];
                    const n3y= y + 1 + POS[(i + 3) & 3][1];
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

//    _change_wall(30, 1);
//    _change_wall(21, 1);
//    _change_wall(25, 1);
//    _change_wall(23, 1);

    for ( let i= 0; i < w * h * 2; i++ ) {
        modify_wall();
    }

    if ( DEBUG ) show_walls(walls, w, h);

    let cells= fill_wall();

    optimise_cells1(cells);
    optimise_cells2(cells);

    // Post-Processing
    // Umrandung wird nicht mehr benoetigt
    for ( let y= 0; y < h; y++ ) {
        for ( let x= 0; x < w; x++ ) {
            cells[y][x]= cells[y + 1][x + 1] < 0 ? 0 : cells[y + 1][x + 1];
        }
        cells[y].length= w;
    }
    cells.length= h;

    return cells;
};


const show_cells= function( cells, w, h, bw ) {
    let table= "";
    for ( let y= 0; y < h; y++ ) {
        let row= '';
        for ( let x= 0; x < w; x++ ) {
            let style= '';
            let value= cells[y][x];
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


const Puzzle= function( w, h ) {
    var cells= gen_cells(w - 1, h - 1);

    if ( DEBUG ) show_cells(cells, w, h, true);

    this.getCells= () => cells;
};



// new Panel(3, 2);
// new Puzzle(5, 5);

global.Puzzle= Puzzle;

})( window, window.DEBUG_PUZZLE );
