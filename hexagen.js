function el(id){return document.getElementById(id);} // Get elem by ID

class hexImg {
	constructor(img) {
		// assume image is loaded
		this.img = img;
		this.determineOrientation();
	}

	toogleOrientation() {
		this.is_vertical = !this.is_vertical;
	}

	getTriangle(n, horizontal) {
		return equiTriFromCenter(n, this.is_vertical);
	}

	determineOrientation() {
		let w = img.width;
		let h = img.height;

		if (w>=h) {
			this.is_vertical = false;
		} else {
			this.is_vertical = true;
		}
	}

	getSidelen() {
		// The side length of the triangles, determined by the smallest length
		let w = this.img.width;
		let h = this.img.height;
		if (this.is_vertical) {
			// make sure the hexagon does not exceed image dimensions
			if ( h*Math.sin(60*Math.PI/180) > w ) {
				return w/Math.sin(60*Math.PI/180);
			} else {
				return h/2;
			}
		} else {
			if ( w*Math.sin(60*Math.PI/180) > h ) {
				return h/Math.sin(60*Math.PI/180);
			} else {
				return w/2;
			}
		}
	}

	scale(baselen) {
		return baselen/this.getSidelen();
	}

	scaledWidth(baselen) {
		// width such that the image produces a triangle with the desired baselength
		return this.img.width*this.scale(baselen);
	}

	scaledHeight(baselen) {
		// height such that the image produces a triangle with the desired baselength
		return this.img.height*this.scale(baselen);
	}
}

function toogleOrientationWrapper(heximg) {
	heximg.toogleOrientation();
}

var Nimgs = 6
var loadedCounter = 0;

var imgs = [];
var heximgs = [];
var ctxs = [];
var canvass = [];

var active_canvas = 0;

var fileElem = el("fileElem");
fileElem.addEventListener("change", readImage, false);

el("svgtester").addEventListener("click", writeSvg, false);

function writeSvg() {
	dataURL = el("canvas4").toDataURL();
	el("svgtester").getElementById("im").setAttribute('href',dataURL );
	el("svgtester").getElementById("im").setAttribute('transform',"rotate(0)" );

}

// Initialize thumbnail canvas with mouse over event handler
for (i=0; i<6; i++) {
	canvas = el("canvas"+ i)
	canvass.push(canvas);
	ctx = canvas.getContext("2d")
	ctxs.push(ctx);
	canvas.addEventListener("mouseover",
		(function(value){
			return function(){
				active_canvas = value;
			}
		})(i) , false );
	canvas.addEventListener("dragover",
		(function(value){
			return function(){
				active_canvas = value;
			}
		})(i) , false );

	canvas.addEventListener("click",
		function(){
			toogleOrientationWrapper(imgs[active_canvas]);
			applyImg(active_canvas);
			} , false );
	canvas.addEventListener("dblclick",
		function () {
			if (fileElem) {
				fileElem.click();
			}
		} , false );

	// from https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications
	canvas.addEventListener("dragenter", dragenter, false);
	canvas.addEventListener("dragover", dragover, false);
	canvas.addEventListener("drop", drop, false);
}

function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}

function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  var dt = e.dataTransfer;
  var files = dt.files;

  loadImage(files);
}

var canvasT=el("canvasTemplate");
var ctxT=canvasT.getContext("2d");

// Simplest template without break, simply print, fold in middle and glue
// and the fold
//                   __________________
//              ... /                 /\ ... fold here
//                  \/_________________/
//
var templateStd = [
	// 1st main side
	{ r   : [ 4, 4, 0, 0, 2, 2 ] ,
	  p   : [ 7, 4, 1, 16, 13, 10 ] ,
	  row : [ 0, 0, 0, 0, 0, 0 ] },
	// 2nd main side
	{ r   : [ 4, 4, 0, 0, 2, 2 ] ,
	  p   : [ 9, 6, 3, 18, 15, 12 ] ,
	  row : [ 0, 0, 0, 0, 0, 0 ] },
	// 3rd main side
	{ r   : [ 4, 4, 0, 0, 2, 2 ] ,
	  p   : [ 11, 8, 5, 2, 17, 14 ] ,
	  row : [ 0, 0, 0, 0, 0, 0 ] },

	// 1st off side
	{ r   : [ 4, 0, 0, 2, 2, 4 ] ,
	  p   : [ 8, 3, 2, 15, 14, 9 ] ,
	  row : [ 1, 1, 1, 1, 1, 1 ] },
	// 2nd off side
	{ r   : [ 4, 0, 0, 2, 2, 4 ] ,
	  p   : [ 4, 17, 16, 11, 10, 5 ] ,
	  row : [ 1, 1, 1, 1, 1, 1 ] },
	// 3ed off side
	{ r   : [ 4, 0, 0, 2, 2, 4 ] ,
	  p   : [ 6, 19, 18, 13, 12, 7 ] ,
	  row : [ 1, 1, 1, 1, 1, 1 ] }
]


var testimages = [
	"testimages/A.png",
	"testimages/B.png",
	"testimages/C.png",
	"testimages/D.png",
	"testimages/E.png",
	"testimages/F.png" ]

var catfiles = [
	"cats/1.png",
	"cats/2.png",
	"cats/3.png",
	"cats/4.png",
	"cats/5.png",
	"cats/6.png" ]

function reset() {
	imgs = []
	loadedCounter = 0
}

function readImage() {
    if ( this.files && this.files[0] ) {
        loadImage(this.files);
    }
}

function loadImage(files) {
	var FR = new FileReader();
    FR.onload = function(e) {
		var img = new Image();
		img.addEventListener("load", function() {
			insertImg(active_canvas, img);
        });
        img.src = e.target.result;
    };
    FR.readAsDataURL( files[0] );
}

function loadFiles(filenames) {
	reset();
	for (i=0; i<Nimgs; i++) {
		img = new Image();
		img.onload = (function(value, image){
			return function(){
				insertImg(value, image);
			}
		})(i, img);
		img.src = filenames[i];
	}
}

function insertImg(slot, img) {
	heximg = new hexImg(img);
	imgs[slot] = heximg;
	applyImg(slot);
}

function applyImg(slot) {
	printOnCanvas(canvass[slot], imgs[slot]);
	makeTemplateWhenLoaded();
}

function makeTemplateWhenLoaded() {
	if (loadedCounter < Nimgs) {
		loadedCounter = loadedCounter + 1;
	}
	if (loadedCounter == Nimgs) {
		makeTemplate();
	}
}

function makeTemplate() {
	// Baselength of the hexagons in the result
	// take the smallest length b.c. its probably better to scale down
	// than to scale up
	let baselen = Math.min(imgs[0].getSidelen(), imgs[1].getSidelen());

	for (i=2; i<imgs.length; i++) {
		baselen = Math.min(baselen, imgs[i].getSidelen());
	}

	let iw = imgs[0].img.width;
	let ih = imgs[0].img.height;

	var Lx = baselen;
	var Ly = baselen*Math.sin(60*Math.PI/180);

	canvasTemplate.width = 10*Lx;
	canvasTemplate.height = 2*Ly;

	for (k=0; k<imgs.length; k++) {

		heximg = imgs[k];
		ctx = ctxs[k];
		templateMap = templateStd[k];

		for (i=0; i<6; i++) {
			row = templateMap.row[i];
			p = templateMap.p[i];
			r = templateMap.r[i];
			n = i;
			palceTriInTemplate(row, p, r, n, heximg, ctxT, baselen)
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

function palceTriInTemplate(row, p, r, n, heximg, ctx, baselen) {
	// place the *n*th triangle from image *img* in row *row*
	// at position *pos* rotated by *r* times 60 degree.
	//alert(heximg.is_vertical)
	let T = heximg.getTriangle(n);
	// let T = equiTriFromCenter(n, false);
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
	placeRotatedClippedTriangle(T, pos[0], pos[1], r, heximg, ctx, baselen)
}

function placeRotatedClippedTriangle(T, posx, posy, rot, heximg, ctx, baselen) {

	// let len = Math.min(heximg.img.width, heximg.img.height)/2;
	let len = baselen;
	let s = heximg.scale(baselen);

	ctx.save();

	//renderGrid(len/10, 'red', canvas1)

	// offset to center triangle on image center
	// let dximg = heximg.img.width/2;
	// let dyimg = heximg.img.height/2;
	// let dximg = len;
	// let dyimg = len;
	let dximg = s*heximg.img.width/2;
	let dyimg = s*heximg.img.height/2;

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
	if (heximg.is_vertical) {
		rot = rot + 0.5;
	}
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

	ctx.drawImage(heximg.img, 0, 0, s*heximg.img.width, s*heximg.img.height);

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

function markTriangles(canvas, heximg) {
	for (i=0; i<6; i++) {
		markTriangle(equiTriFromCenter(i, heximg.is_vertical), canvas, heximg.img);
	}
}

function markTriangle(T, canvas, img) {

	let ctx = canvas.getContext("2d");
	let len = Math.min(canvas.width, canvas.height)/2;

	ctx.save();

	// offset to center triangle on image center
	// let dximg = img.width/2;
	// let dyimg = img.height/2;
	let dximg = len;
	let dyimg = len;

	let x0 = T[0][0]*len + dximg;
	let y0 = T[0][1]*len + dyimg;
	let x1 = T[1][0]*len + dximg;
	let y1 = T[1][1]*len + dyimg;
	let x2 = T[2][0]*len + dximg;
	let y2 = T[2][1]*len + dyimg;

	ctx.lineWidth = 0.5;
    ctx.strokeStyle = "black";

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

function printOnCanvas(canvas, heximg) {
	let ctx = canvas.getContext("2d");
	ctx.save();
	let len = canvas.width;
	ctx.drawImage(heximg.img, 0, 0, len, len);
	markTriangles(canvas, heximg);
	ctx.restore();
}
