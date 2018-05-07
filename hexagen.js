var canvas0=document.getElementById("canvas0");
var ctx0=canvas0.getContext("2d");
var canvas1=document.getElementById("canvas1");
var ctx1=canvas1.getContext("2d");

// Coordinates of an equiliteral triangle measured from the center
// and in units of half of the longest direction.
// n = 0,1,2,3,4,5
function equiTriFromCenter(n, vert) {
	// equiliteral trianlge with relative coordinates from center
	if (vert) {
		n = n + 0.5;
	}
	var T = [
		[0, 0],
		[Math.cos(n*60/180*Math.PI), -Math.sin(n*60/180*Math.PI)],
		[Math.cos((n+1)*60/180*Math.PI), -Math.sin((n+1)*60/180*Math.PI)],
	]
	return T;
};

// load example image
var img=new Image();
img.onload=start;
img.src="sample.png";

function start(){

	// set canvas sizes equal to image size
	var cw=canvas0.width=img.width;
	var ch=canvas0.height=img.height;

	canvas1.width = 4*cw;
	canvas1.height = ch;

	// draw the example image on the source canvas
	ctx0.drawImage(img,0,0);

	// unwarp the source rectangle and draw it to the destination canvas
	//unwarp(anchors,unwarped,ctx1);

	var Ntriangle = 2;

	var Lx = cw/2;
	var Ly = ch/2*Math.sin(60*Math.PI/180);



	for (i=0; i<6; i++) {
		markTriangle(equiTriFromCenter(i, false), img , ctx0);
		//placeRotatedClippedTriangle(equiTriFromCenter(i, false), (i+1)*Lx, Ly, i-(i%2), img , ctx1);
		palceTriInTemplate(0, i, i*2, i, img, ctx1, Lx);
	}
}

function posLayoutGrid(p, row, baselength) {
	// Coordinates of the triangle position in row *row*
	var pos = [(p+1)*baselength/2 ,
				(row+0.5)*baselength*Math.sin(60*Math.PI/180)]
	return pos;
}

function palceTriInTemplate(row, p, r, n, img, ctx, baselen) {
	// place the *n*th triangle from image *img* in row *row*
	// at position *pos* rotated by *r* times 60 degree.
	var triangle = equiTriFromCenter(n, false);
	var pos = posLayoutGrid(p, row, baselen)
	// caculate offset needed to place the center of the triangle at the right pos
	// the oritentation (up/down facing) is reversed with every rotation by 60 degree
	// and the original triangle faces upwards for even numbers
	if ( (n+r)%2 == 0) {
		// upwards
		pos[1] = pos[1] + baselen*Math.sin(60*Math.PI/180)/6;
	} else {
		// downwards
		pos[1] = pos[1] - baselen*Math.sin(60*Math.PI/180)/6;
	}
	placeRotatedClippedTriangle(triangle, pos[0], pos[1], r, img, ctx)
}

function placeRotatedClippedTriangle(T, posx, posy, rot, img, ctx) {

	var len = Math.min(img.width, img.height)/2;
	ctx.save();

	//renderGrid(len/10, 'red', canvas1)

	// offset to center triangle on image center
	var dximg = img.width/2;
	var dyimg = img.height/2;

	var x0 = T[0][0]*len + dximg;
	var y0 = T[0][1]*len + dyimg;
	var x1 = T[1][0]*len + dximg;
	var y1 = T[1][1]*len + dyimg;
	var x2 = T[2][0]*len + dximg;
	var y2 = T[2][1]*len + dyimg;

	// center position = point on the central vertical line at half height

	var centerx = (x0+x1+x2)/3
	var centery = (y0+y1+y2)/3

	var dx = posx - centerx;
	var dy = posy - centery;

	// Final placement of clipped and rotated image
	ctx.translate(dx,dy);

	// Rotation
	ctx.translate(centerx, centery);
	ctx.rotate(rot*60/180*Math.PI);
	ctx.translate(-centerx, -centery);

	// Clipping
	ctx.beginPath();
	ctx.moveTo(x0, y0);
	ctx.lineTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.closePath();
	//ctx.stroke();
	ctx.clip();

	ctx.drawImage(img, 0, 0);

	// Stroke boundary
	ctx.beginPath();
	ctx.moveTo(x0, y0);
	ctx.lineTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.closePath();
	ctx.stroke();

	// restore the context to it's unclipped untransformed state
	ctx.restore();
};

function markPosition(x,y,radius,ctx) {
	// Mark a position with a circle
	ctx.save();

	// Stroke boundary
	ctx.beginPath();
	ctx.arc(x,y,radius,0,360);
	ctx.closePath();
	ctx.stroke();

	ctx.restore();
}


function markTriangle(T, img, ctx) {

	var len = Math.min(img.width, img.height)/2;

	ctx.save();

	// offset to center triangle on image center
	var dximg = img.width/2;
	var dyimg = img.height/2;

	var x0 = T[0][0]*len + dximg;
	var y0 = T[0][1]*len + dyimg;
	var x1 = T[1][0]*len + dximg;
	var y1 = T[1][1]*len + dyimg;
	var x2 = T[2][0]*len + dximg;
	var y2 = T[2][1]*len + dyimg;

	// Stroke boundary
	ctx.beginPath();
	ctx.moveTo(x0, y0);
	ctx.lineTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.closePath();
	ctx.stroke();

	// restore the context to it's unclipped untransformed state
	ctx.restore();
};


function renderGrid(gridPixelSize, color, canvas)
{
	var ctx=canvas.getContext("2d");
    //ctx.save();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = color;

    // horizontal grid lines
    for(var i = 0; i <= canvas.height; i = i + gridPixelSize)
    {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.closePath();
        ctx.stroke();
    }

    // vertical grid lines
    for(var j = 0; j <= canvas.width; j = j + gridPixelSize)
    {
        ctx.beginPath();
        ctx.moveTo(j, 0);
        ctx.lineTo(j, canvas.height);
        ctx.closePath();
        ctx.stroke();
    }
    //ctx.restore();
}
