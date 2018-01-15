(function() {

const colors= [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#800000', '#808000',
    '#008000', '#800080', '#008080', '#000080'
];

var show_walls= function( walls, w, h ) {
    const per_line= (w + 2) * 2;
    const v= (value) => value < 0 ? value : ' ' + value;
    let s= '';

    for ( let y= 0; y < h + 4; y++ ) {
        for ( let x= 0; x < w + 2; x++ ) {
            const i= y * per_line + x * 2;
            s += v(walls[i]) + ' ' + v(walls[i + 1]) + '|';
        }
        s += y * per_line + '<br>';
    }
    s += '<hr>';
    for ( let y= 0; y < h + 1; y++ ) {
        let v= '';
        let h= '';
        for ( let x= 0; x < w + 1; x++ ) {
            const i= (y + 2) * per_line + x * 2;
            v += walls[i + 1] == 1 ? ' -- ' : '    ';
            h += walls[i] == 1 ? '|   ' : '    ';
        }
        s += v + '<br>' + h + '<br>';
    }
    document.getElementById('walls').innerHTML= '<pre>' + s + '</pre>';
}


var gen_cells= function( w, h ) {
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

    const change_wall= function() {
        let guard= 1000;
        while ( --guard ) {
            const inx= Math.floor(Math.random() * walls.length);
            if ( walls[inx] != 1 ) continue;

            const dir= Math.floor(Math.random() * 2);
            if ( _change_wall(inx, dir) ) break;
        }
    };

    const fill_wall= function( x, y ) {

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

        const mark= function( x, y ) {
            cells[y + 1][x + 1]= color;
            cellList.push([ x, y ]);
        };

        const fillList= [ [ 0, 0 ] ];

        let guard= 1000;
        while ( --guard && fillList.length ) {
            let x= fillList[0][0];
            let y= fillList[0][1];
            fillList.shift();
            if ( cells[y + 1][x + 1] !== 0 ) continue;

            color++;
            mark(x, y);
            while ( --guard && cellList.length ) {
                let x= cellList[0][0];
                let y= cellList[0][1];
                for ( let i= 0; i < 4; i++ ) {
                    const x1= x + DIRS[i][0];
                    const y1= y + DIRS[i][1];
                    if ( cells[y1 + 1][x1 + 1] == 0 ) {
                        if ( cw(x, y, i) == 0 ) {
                            mark(x1, y1);
                        }
                        else {
                            fillList.push([ x1, y1 ]);
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

//    _change_wall(30, 1);
//    _change_wall(21, 1);
//    _change_wall(25, 1);
//    _change_wall(23, 1);

    for ( let i= 0; i < 50; i++ ) {
        change_wall();
    }

    show_walls(walls, w, h);

    const cells= fill_wall(0, 0);

    return cells;
};


var Panel= function( w, h ) {
    var cells= gen_cells(w, h);

};







// new Panel(3, 2);
new Panel(5, 5);



})();
