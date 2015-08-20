// config  //

var totalLinks = 50;

var maxLinks = 5;
var minLinks = 2;

var minSize = 20;
var maxSize = 50;

var minForce = 10/100;
var maxForce = 100/100;

var maxVel = 2;
var stretchBuffer = 10; 
var friction = 0.9;
var jiggle = 10;

var outerCurverature = 1;
var innerCurverature = 1;

var width = 2000;
var height = 2000;
var area = width * height

var black = "#000000"
var color1 = "#76B729"
var color2 = "#F07D00"
var color3 = "#076532"
var color4 = "#3AAA34"

//helpers
var colors = [black, color1, color2, color3, color4];

randomColor = function(){
	return colors[Math.floor(Math.random()*colors.length)]
}

randomCoOrd = function(){
	return [Math.random() * width, Math.random() * height]
}

randomLinkVector = function(length){

	var x = spread(-length,length);
	var y = Math.sqrt((length * length) - (x * x)) * posOrNeg();

	return new Vector(x,y);
};

spread = function(min,max){
	return (Math.random()*(max-min) + min);
}
spreadInt = function(min,max){
	return Math.floor(spread(min,max));
}

posOrNeg = function(){
	return Math.random() < 0.5 ? -1 : 1;
}

//vector helpers

function Vector(x,y){
	return {'x': x, 'y': y};
}

vectorAdd = function(vector1, vector2){
	return new Vector(vector1.x + vector2.x, vector1.y + vector2.y);
}

vectorSubtract = function(vector1, vector2){
	return new Vector(vector1.x - vector2.x, vector1.y - vector2.y);
}

function scaleVector(vector, length){
	var currentLength = vectorLength(vector);
	var ratio = length/currentLength;
	return new Vector(vector.x * ratio, vector.y * ratio );
}

function vectorLength(vector){
	return (Math.sqrt(vector.x * vector.x + vector.y * vector.y));
}


//function

//clusters

var clusters = [];

function Cluster(link){

	clusters.push(this);

	this.linkNumber = spreadInt(minLinks,maxLinks);

	this.rotateDirection = posOrNeg();
	this.rotateForce = spread(minForce,maxForce);

	if (link == null){
		//first cluster
		this.x = width/2;
		this.y = height/3;
		this.xVel = 0;
		this.yVel = 0;
		this.dragged = false;
		this.links = [new Link(this)];


	} else {
		//subsuquent clusters
		this.links = [link];

		//find some free space
		var direction = link.start.findFreeSpace(link.length);

		//keep new links within boundaries
		this.x = (link.start.x + direction.x < 0 || link.start.x + direction.x > width) ? link.start.x - direction.x : link.start.x + direction.x;
		this.y = (link.start.y + direction.y < 0 || link.start.y + direction.y > height) ? link.start.y - direction.y : link.start.y + direction.y;

		this.xVel = Math.random()*2 -1;
		this.yVel = Math.random()*2 -1;
	}

}


Cluster.prototype.addLink = function(){
	if (this.links.length < this.linkNumber) this.links.push(new Link(this));
}

Cluster.prototype.findFreeSpace = function(length){

	if (this.links == undefined) return randomLinkVector(length);

	var scope = this;
	var toAvoid = [];

	this.links.forEach(function(link){

		if (link.start == scope)  {
			toAvoid.push(scope.getDirectionVector(link.end))
		} else {
			toAvoid.push(scope.getDirectionVector(link.start))
		} 

	});

	var dontPlace = new Vector(0,0);

	toAvoid.forEach(function(directionVector){

		dontPlace = vectorAdd(dontPlace, directionVector)

	});

	//randomize

	dontPlace = vectorAdd(dontPlace, randomLinkVector(length));

	placeAt = scaleVector(dontPlace, length);


	return placeAt;
}

Cluster.prototype.bounce = function(){
	if (this.x < 0 || this.x > width) this.xVel = -this.xVel;
	if (this.y < 0 || this.y > height) this.yVel = -this.yVel;
}

Cluster.prototype.updatePosition = function(){

	this.x += this.xVel;
	this.y += this.yVel;

	this.xVel *= friction;
	this.yVel *= friction;

	if (Math.abs(this.xVel) > maxVel) this.xVel = this.xVel / Math.abs(this.xVel) * maxVel;
	if (Math.abs(this.yVel) > maxVel) this.yVel = this.yVel / Math.abs(this.yVel) * maxVel;

}

Cluster.prototype.getDirectionVector = function(otherCluster){

	var x = this.x - otherCluster.x;
	var y = this.y - otherCluster.y;
	
	return new Vector(x,y);

}
Cluster.prototype.getPerpendicularVector = function(otherCluster){

	var x = this.x - otherCluster.x;
	var y = this.y - otherCluster.y;
	
	return new Vector(-y,x);

}

Cluster.prototype.applyTorque = function(otherCluster){

	var direction = this.getPerpendicularVector(otherCluster);
	var distance = vectorLength(direction);

	var torque = scaleVector(direction, this.rotateForce * this.rotateDirection);

	otherCluster.xVel += torque.x/5;
	otherCluster.yVel += torque.y/5;

}


//links

var links = [];

function Link(cluster){

	links.push(this);
	this.color = randomColor();
	this.startSize = spread(minSize, maxSize);
	this.endSize = spread(minSize, maxSize);
	this.gooRate = (this.startSize + this.endSize) / 10;
	this.length = (this.startSize + this.endSize) * (1.5 + Math.random()*2);
	this.start = cluster;
	this.end = new Cluster(this)


}


Link.prototype.draw = function(context){

	//context variables
	context.strokeStyle = this.color;
	context.fillStyle = this.color;
	context.globalAlpha = 0.4;

	//drawing variables
	var sizeRatio = this.startSize/this.endSize;

	var direction = this.start.getDirectionVector(this.end);
	var centerDistance = vectorLength(direction)
	var innerDistance = centerDistance - (this.startSize + this.endSize);
	var toHalfway = scaleVector(direction, (this.startSize + (innerDistance / 2)));
	var halfway = new Vector (this.start.x - toHalfway.x, this.start.y - toHalfway.y);
	var perpendicular = this.start.getPerpendicularVector(this.end);
	var goo = scaleVector(perpendicular, this.gooRate);
	var angle = Math.atan(direction.y/direction.x) + (direction.x/Math.abs(direction.x)*Math.PI/2);

	startToEdge = scaleVector(perpendicular, this.startSize);
	startOuterCurve = scaleVector(direction, this.startSize * outerCurverature);
	startInnerCurve = scaleVector(direction, innerDistance/2);

	endToEdge = scaleVector(perpendicular, this.endSize);
	endOuterCurve = scaleVector(direction, this.endSize * outerCurverature);
	endInnerCurve = scaleVector(direction, innerDistance/2);

	//first semiCircle
	context.beginPath();
	context.arc(this.start.x,this.start.y,this.startSize,angle,angle + Math.PI,true);

	//first half curve
	control1 = new Vector(this.start.x - startToEdge.x - startOuterCurve.x, this.start.y - startToEdge.y - startOuterCurve.y);
	control2 = new Vector(halfway.x - goo.x + startInnerCurve.x, halfway.y - goo.y + startInnerCurve.y);
	endPoint = new Vector(halfway.x - goo.x, halfway.y - goo.y);

	context.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, endPoint.x, endPoint.y);

	//second half curve
	control1 = new Vector(halfway.x - goo.x - endInnerCurve.x, halfway.y - goo.y - endInnerCurve.y);
	control2 = new Vector(this.end.x - endToEdge.x + endOuterCurve.x, this.end.y - endToEdge.y +endOuterCurve.y);
	endPoint = new Vector(this.end.x - endToEdge.x, this.end.y - endToEdge.y);

	context.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, endPoint.x, endPoint.y);

	//second semiCircle
	context.arc(this.end.x,this.end.y,this.endSize,angle + Math.PI,angle,true);
	//context.closePath();
	context.stroke();

	//first half curve
	control1 = new Vector(this.end.x + endToEdge.x + endOuterCurve.x, this.end.y + endToEdge.y + endOuterCurve.y);
	control2 = new Vector(halfway.x + goo.x - endInnerCurve.x, halfway.y + goo.y - endInnerCurve.y);
	endPoint = new Vector(halfway.x + goo.x, halfway.y + goo.y);

	context.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, endPoint.x, endPoint.y);

	//second half curve
	control1 = new Vector(halfway.x + goo.x + startInnerCurve.x, halfway.y + goo.y + startInnerCurve.y);
	control2 = new Vector(this.start.x + startToEdge.x - startOuterCurve.x, this.start.y + startToEdge.y - startOuterCurve.y);
	endPoint = new Vector(this.start.x + startToEdge.x, this.start.y + startToEdge.y);

	context.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, endPoint.x, endPoint.y);

	context.fill();
	context.stroke();


}

Link.prototype.isInside = function(vector){

	var endDistance = vectorLength(this.end.getDirectionVector(vector));
	if (endDistance <= this.endSize) return this.end;
	var startDistance = vectorLength(this.start.getDirectionVector(vector));
	if (startDistance <= this.startSize) return this.start;


	return false;

}

Link.prototype.pushAndPull = function(){

	var direction = this.start.getDirectionVector(this.end);
	var distance = vectorLength(direction);
	var force = scaleVector(direction, (distance-this.length));

	this.end.xVel += force.x/jiggle;
	this.end.yVel += force.y/jiggle;
	this.start.xVel -= force.x/jiggle;
	this.start.yVel -= force.y/jiggle;

	if (this.end.dragged){
		this.start.xVel -= force.x/jiggle;
		this.start.yVel -= force.y/jiggle;	
	}

}


Link.prototype.interact = function(){

 this.start.applyTorque(this.end);
 this.pushAndPull();

}




Link.prototype.act = function(context){

	this.interact();
	if(!this.end.dragged) this.end.updatePosition(context);
	this.end.bounce();

	this.draw(context);

};

//mouse function 

findCluster = function(event){

	var click = new Vector(event.clientX, event.clientY );
	var canvasDimensions = new Vector($("#dot-animation").width(), $("#dot-animation").height())
	var canvasClick = new Vector(click.x/canvasDimensions.x * width, click.y/canvasDimensions.y * width )

	var inCluster = false;
	var clickedCluster = null;

	links.forEach(function(link){
		
		if (link.isInside(canvasClick)) {
			inCluster = true;
			clickedCluster = link.isInside(canvasClick);
			clickedCluster.dragged = true;
			$("#dot-animation").addClass("dragging");

			$("#dot-animation").on({
				"mousemove.dragging": function(event){ drag(event,clickedCluster);},
				"mouseup.dragging": function(event){ 
					clickedCluster.dragged = false;
					clickedCluster.xVel = 0;
					clickedCluster.yVel = 0;
					$("#dot-animation").removeClass("dragging");
					$( "#dot-animation" ).off( ".dragging" );
				}
			});
								

		}
	})	


}

drag = function(event, cluster){

	var click = new Vector(event.clientX, event.clientY );
	var canvasDimensions = new Vector($("#dot-animation").width(), $("#dot-animation").height())
	var canvasClick = new Vector(click.x/canvasDimensions.x * width, click.y/canvasDimensions.y * width )

	cluster.x = canvasClick.x;
	cluster.y = canvasClick.y;
}


// protocol  //

$(document).ready(function(){


var canvas = document.getElementById('dot-animation');

$("#dot-animation").on({
	"mousedown": findCluster
});

//canvas.addEventListener("mousedown", findCluster , false);

var context = canvas.getContext('2d');


	//create first cluster

	var firstCluster = new Cluster(null);

	while(links.length < totalLinks){
		clusters.forEach(function(cluster){
			cluster.addLink();
		});
	}

	setInterval(function(){
		context.clearRect(0, 0, canvas.width, canvas.height);

		firstCluster.updatePosition(context);
		firstCluster.bounce();

		links.forEach(function(link){
			link.act(context);
		})
	},50 );
})
