var canvas0=document.getElementById("canvas0");
var ctx0=canvas0.getContext("2d");
var canvas1=document.getElementById("canvas1");
var ctx1=canvas1.getContext("2d");

// Coordinates of an equiliteral triangle measured from the center
// and in units of half of the longest direction.
// n = 0,1,2,3,4,5
function triangleCoord(n) {
	var T = {
		a : { x : 0, y : 0 },
		b : { x : Math.cos(n*60/180*Math.PI), y : -Math.sin(n*60/180*Math.PI) },
		c : { x : Math.cos((n+1)*60/180*Math.PI), y : -Math.sin((n+1)*60/180*Math.PI) }
	}
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

	canvas1.width = cw;
	canvas1.height = ch;

	// draw the example image on the source canvas
	ctx0.drawImage(img,0,0);

	// unwarp the source rectangle and draw it to the destination canvas
	//unwarp(anchors,unwarped,ctx1);

	var Ntriangle = 2;


	placeRotatedClippedTriangle(triangleCoord(Ntriangle), 0, 0, 0, img , ctx0);
	placeRotatedClippedTriangle(triangleCoord(Ntriangle), 0, 0, 3, img , ctx1);

}

function placeRotatedClippedTriangle(triangle, x, y, rot, img, ctx) {
	// clear the destination canvas
	//ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);

	var len = Math.min(img.width, img.height)/2;

	ctx.save();
	renderGrid(20, "black", canvas1)

	var a = { x : 10, y : 10 };
	var b = { x : 100, y : 10 };
	var c = { x : 100, y : 100 };
	var d = { x : 10, y : 100 };

	var dx = img.width/2;
	var dy = img.height/2;

	var x0 = triangle.a.x*len + dx;
	var y0 = triangle.a.y*len + dy;
	var x1 = triangle.b.x*len + dx;
	var y1 = triangle.b.y*len + dy;
	var x2 = triangle.c.x*len + dx;
	var y2 = triangle.c.y*len + dy;

	var centerx = (x0+x1+x2)/3;
	var centery = (y0+y1+y2)/3;

	renderGrid(20, "red", canvas1)

	// position where to put center of image
	posx = 0
	posy = 0

	ctx.translate(centerx, centery);
	ctx.rotate(rot*60/180*Math.PI);
	ctx.translate(-centerx, -centery);



	ctx.fillStyle = "#0000ff";
	//ctx.fillRect(centerx-5,centery-5, 10, 10);
	ctx.beginPath();
	ctx.arc( centerx, centery, len/20, 0, 360, false);
	ctx.lineWidth = 3;
	ctx.strokeStyle = 'black';
    ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(x0, y0);
	ctx.lineTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.closePath();
	//ctx.stroke();
	ctx.clip();

	ctx.drawImage(img, 0, 0);

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
