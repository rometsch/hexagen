
var Nimgs = 6
var loadedCounter = 0;

var imgs = [];
var ctxs = [];
var canvass = [];

var canvasT=document.getElementById("canvasTemplate");
var ctxT=canvasT.getContext("2d");

// Simplest template without break, simply print, fold in middle and glue
// and the fold
//                   __________________
//              ... /                 /\ ... fold here
//                  \/_________________/
//
var templateStd = [
	// 1st main side
	{ r   : [ 0, 4, 4, 2, 2, 0 ] ,
	  p   : [ 7, 4, 1, 16, 13, 10 ] ,
	  row : [ 0, 0, 0, 0, 0, 0 ] },
	// 2nd main side
	{ r   : [ 0, 4, 4, 2, 2, 0 ] ,
	  p   : [ 9, 6, 3, 18, 15, 12 ] ,
	  row : [ 0, 0, 0, 0, 0, 0 ] },
	// 3rd main side
	{ r   : [ 0, 4, 4, 2, 2, 0 ] ,
	  p   : [ 11, 8, 5, 2, 17, 14 ] ,
	  row : [ 0, 0, 0, 0, 0, 0 ] },

	// 1st off side
	{ r   : [ 4, 4, 2, 2, 0, 0 ] ,
	  p   : [ 8, 3, 2, 15, 14, 9 ] ,
	  row : [ 1, 1, 1, 1, 1, 1 ] },
	// 2nd off side
	{ r   : [ 4, 4, 2, 2, 0, 0 ] ,
	  p   : [ 4, 17, 16, 11, 10, 5 ] ,
	  row : [ 1, 1, 1, 1, 1, 1 ] },
	// 3ed off side
	{ r   : [ 4, 4, 2, 2, 0, 0 ] ,
	  p   : [ 6, 19, 18, 13, 12, 7 ] ,
	  row : [ 1, 1, 1, 1, 1, 1 ] }
]
var filenames = [
	"testimages/A.png",
	"testimages/B.png",
	"testimages/C.png",
	"testimages/D.png",
	"testimages/E.png",
	"testimages/F.png" ]

for (i=0; i<Nimgs; i++) {
	canvas = document.getElementById("canvas"+ i)
	canvass.push(canvas);
	ctx = canvas.getContext("2d")
	ctxs.push(ctx);
	img = new Image();
	imgs.push(img);
	img.onload = (function(value){
       return function(){
           printOnCanvas(canvass[value], imgs[value]);
		   checkAllLoaded();
       }
   })(i);
	img.src = "cats/" + (i+1) + ".png"; //filenames[i];
}

function checkAllLoaded() {
	loadedCounter = loadedCounter + 1;
	if (loadedCounter == Nimgs) {
		makeTemplate(imgs);
	}
}

function makeTemplate(imgs){

	iw = imgs[0].width;
	ih = imgs[0].height;

	var Lx = iw/2;
	var Ly = ih/2*Math.sin(60*Math.PI/180);

	canvasTemplate.width = 10*Lx;
	canvasTemplate.height = 2*Ly;

	for (k=0; k<imgs.length; k++) {

		img = imgs[k];
		ctx = ctxs[k];
		templateMap = templateStd[k];

		for (i=0; i<6; i++) {
			T = equiTriFromCenter(i, false);
			//markTriangle(T, img , ctx);
			row = templateMap.row[i];
			p = templateMap.p[i];
			r = templateMap.r[i];
			n = i;
			palceTriInTemplate(row, p, r, n, img, ctxT, Lx)
		}
	}
}

// Coordinates of an equiliteral triangle measured from the center
// and in units of half of the longest direction.
// n = 0,1,2,3,4,5
function equiTriFromCenter(n, vert) {
	// equiliteral trianlge with relative coordinates from center
	if (vert) {
		n = n + 0.5;
	}
	let T = [
		[0, 0],
		[Math.cos(n*60/180*Math.PI), -Math.sin(n*60/180*Math.PI)],
		[Math.cos((n+1)*60/180*Math.PI), -Math.sin((n+1)*60/180*Math.PI)],
	]
	return T;
};

function posLayoutGrid(p, row, baselength) {
	// Coordinates of the triangle position in row *row*
	let pos = [(p)*baselength/2 ,
				(row+0.5)*baselength*Math.sin(60*Math.PI/180)]
	return pos;
}

function palceTriInTemplate(row, p, r, n, img, ctx, baselen) {
	// place the *n*th triangle from image *img* in row *row*
	// at position *pos* rotated by *r* times 60 degree.
	let triangle = equiTriFromCenter(n, false);
	let pos = posLayoutGrid(p, row, baselen)
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

	let len = Math.min(img.width, img.height)/2;
	ctx.save();

	//renderGrid(len/10, 'red', canvas1)

	// offset to center triangle on image center
	let dximg = img.width/2;
	let dyimg = img.height/2;

	let x0 = T[0][0]*len + dximg;
	let y0 = T[0][1]*len + dyimg;
	let x1 = T[1][0]*len + dximg;
	let y1 = T[1][1]*len + dyimg;
	let x2 = T[2][0]*len + dximg;
	let y2 = T[2][1]*len + dyimg;

	// center position = point on the central vertical line at half height

	let centerx = (x0+x1+x2)/3
	let centery = (y0+y1+y2)/3

	let dx = posx - centerx;
	let dy = posy - centery;

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

	let len = Math.min(img.width, img.height)/2;

	ctx.save();

	// offset to center triangle on image center
	let dximg = img.width/2;
	let dyimg = img.height/2;

	let x0 = T[0][0]*len + dximg;
	let y0 = T[0][1]*len + dyimg;
	let x1 = T[1][0]*len + dximg;
	let y1 = T[1][1]*len + dyimg;
	let x2 = T[2][0]*len + dximg;
	let y2 = T[2][1]*len + dyimg;

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
	let ctx=canvas.getContext("2d");
    //ctx.save();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = color;

    // horizontal grid lines
    for(let i = 0; i <= canvas.height; i = i + gridPixelSize)
    {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.closePath();
        ctx.stroke();
    }

    // vertical grid lines
    for(let j = 0; j <= canvas.width; j = j + gridPixelSize)
    {
        ctx.beginPath();
        ctx.moveTo(j, 0);
        ctx.lineTo(j, canvas.height);
        ctx.closePath();
        ctx.stroke();
    }
    //ctx.restore();
}

function printOnCanvas(canvas, img) {
	let ctx = canvas.getContext("2d");
	ctx.save();
	let len = canvas.width;
	ctx.drawImage(img, 0, 0, len, len);
	ctx.restore();
}


// PDF export inspired by
// https://stackoverflow.com/questions/19699366/html5-canvas-to-pdf#27370253
// in jsfiddle http://jsfiddle.net/p4s5k59s/1222/
function downloadPdf() {
    var imgData = canvasTemplate.toDataURL(
        'image/png');
    var doc = new jsPDF('l', 'mm', 'a4');

	let cw = canvasTemplate.width;
	let ch = canvasTemplate.height;

	let w = 0.9*550; // 90% of a4 length in pts
	let h = w*ch/cw;
	let bor = 0.05*w/0.9;
    doc.addImage(imgData, 'PNG', bor, bor, w, h);
    doc.save('sample-file.pdf');
}
