(function() {

var OLD_gen_way= function( w, h, colors ) {
    let cells= [];
    let cellList= [];

    for ( let y= -1; y <= h; y++ ) {
        cells[y + 1]= [];
        for ( let x= -1; x <= w; x++ ) {
            var value= 0;
            if ( x == -1 || x == w || y == -1 || y == h ) {
                value= -1;
            }
            else {
                cellList.push([ x + 1, y + 1 ]);
            }
            cells[y + 1].push(value);
        }
    }

    for ( let i= 1; i < cellList.length; i++ ) {
        let r= Math.floor(Math.random() * i);
        let x= cellList[r][0];
        let y= cellList[r][1];
        cellList[r][0]= cellList[i][0];
        cellList[r][1]= cellList[i][1];
        cellList[i][0]= x;
        cellList[i][1]= y;
    }

    for ( let i= 0; i < cellList.length; i++ ) {
        let x= cellList[i][0];
        let y= cellList[i][1];
        
//        let color= cells[
    }

console.log(cells);

    console.log(cellList);
    
};


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


var gen_way= function( w, h, colors ) {
    let walls= [];

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

        var ofsF, ofsS1, ofsS2;
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

//    _change_wall(30, 1);
//    _change_wall(21, 1);
//    _change_wall(25, 1);
//    _change_wall(23, 1);

    for ( let i= 0; i < 50; i++ ) {
        change_wall();
    }

    show_walls(walls, w, h);

    console.log(walls);

/*
    for ( let i= 0; i < first0; i++ ) {
        walls[i]= -1;
        walls[i]= -1;

    }
*/

};


var Panel= function( w, h ) {
    var way= gen_way(w, h, 2);


};







// new Panel(3, 2);
new Panel(5, 5);



})();
