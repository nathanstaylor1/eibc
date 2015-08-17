// config  //

var dotDensity = 25;
var dotSize = 20;
var lineLength = 160;
var pullForce = 3000;
var pushForce = 2500;
var rotateForce = 6000;

var haloGrowthRate = 0.1;
var haloShrinkRate = 0.5;

var maxHalo = 5;
var maxLineWidth = 3;

var width = 2000;
var height = 2000;
var area = width * height

var black = "#000000"
var color1 = "#76B729"
var color2 = "#F07D00"
var color3 = "#076532"
var color4 = "#3AAA34"

var dotNumber = area / 1000000 * dotDensity

// functions  //

function sizeCanvas(){

	
}

var colors = [black, color1, color2, color3, color4];

randomColor = function(){
	return colors[Math.floor(Math.random()*colors.length)]
}

randomCoOrd = function(){
	return [Math.random() * width, Math.random() * height]
}


var dots = [];

function Dot(color){

	this.color = randomColor();
	this.x = randomCoOrd()[0];
	this.y = randomCoOrd()[1];
	this.xVel = Math.random() * 2 - 1;
	this.yVel = Math.random() * 2 - 1;
	this.isClose = [];
	this.halo = Math.random() * 3 * maxHalo;

	this.sizeVar = 0.5 + Math.random();
	this.alphaVar = 0.5 + (Math.random() * 0.5)

	dots.push(this);

}

Dot.prototype.draw = function(context){

	context.strokeStyle = this.color;
	context.fillStyle = this.color;
	context.globalAlpha = this.alphaVar * 0.3;

	context.beginPath();
	context.arc(this.x,this.y,dotSize,0,Math.PI*2,true);
	context.closePath();
	context.fill();


	context.globalAlpha = this.alphaVar * 0.2;
	context.beginPath();
	context.arc(this.x,this.y, (dotSize + this.halo) * this.sizeVar ,0,Math.PI*2,true);
	context.closePath();
	context.fill();

	context.globalAlpha = 0.3;


}

Dot.prototype.bounce = function(){
	if (this.x < 0 || this.x > width) this.xVel = -this.xVel;
	if (this.y < 0 || this.y > height) this.yVel = -this.yVel;
}

Dot.prototype.updatePosition = function(){
	this.x += this.xVel;
	this.y += this.yVel;



	if (this.isClose.length > 0 && this.halo < maxHalo*this.isClose.length){
		this.halo += haloGrowthRate;
	} else if (this.halo > 0){
		this.halo -= haloShrinkRate;
	}

}


Dot.prototype.getDistance = function(otherDot){

	var xDistance = this.x - otherDot.x;
	var yDistance = this.y - otherDot.y;

	var twoDistance = Math.sqrt( xDistance*xDistance + yDistance*yDistance)

	return twoDistance

};

Dot.prototype.findClose = function(toConnect){
	
	this.isClose = []	

	var startAt = dots.indexOf(this) + 1;
	var finishAt = dots.length;

	for (var i = startAt; i < finishAt; i++){

		if ( this.getDistance(dots[i]) < lineLength ) {
			this.isClose.push(dots[i]);
		}
	};

}

Dot.prototype.drawLines = function(context){

	var scope = this;

	this.isClose.forEach(function(dot){

		lineWidth = lineLength / scope.getDistance(dot) - 1 ; 

		if (lineWidth > maxLineWidth) lineWidth = maxLineWidth;

		context.lineWidth = lineWidth

		context.beginPath();
		context.moveTo(scope.x,scope.y);
		context.lineTo(dot.x,dot.y);
		context.stroke();
	})
}

Dot.prototype.getDirectionVector = function(otherDot){

	var x = this.x - otherDot.x;
	var y = this.y - otherDot.y;
	
	return {'x': x, 'y': y}

}

Dot.prototype.pull = function(otherDot){

	var direction = this.getDirectionVector(otherDot);

	this.xVel -= direction.x/pullForce
	this.yVel -= direction.y/pullForce
	otherDot.xVel += direction.x/pullForce
	otherDot.yVel += direction.y/pullForce

}


Dot.prototype.push = function(otherDot){

	var direction = this.getDirectionVector(otherDot);

	this.xVel += direction.x/pushForce
	this.yVel += direction.y/pushForce
	otherDot.xVel -= direction.x/pushForce
	otherDot.yVel -= direction.y/pushForce

}

Dot.prototype.rotate = function(otherDot){

	var direction = this.getDirectionVector(otherDot);

	this.xVel += direction.y/rotateForce
	this.yVel += direction.x/rotateForce
	otherDot.xVel -= direction.y/rotateForce
	otherDot.yVel -= direction.x/rotateForce

}

Dot.prototype.interact = function(){

	var scope = this;

	this.isClose.forEach(function(dot){

		if (scope.color == dot.color){
			scope.push(dot);
		} else if (scope.color == colors[colors.indexOf(dot.color) + 1]){
			scope.rotate(dot);
 		} else {
 			scope.pull(dot);
 		}

	})

}

Dot.prototype.act = function(context){

	this.updatePosition(context);
	this.bounce();

	this.findClose();
	this.interact();

	this.draw(context);
	this.drawLines(context);

};

function createDot(context){
	var currentDot = new Dot();
	currentDot.draw(context);

}


// protocol  //

$(document).ready(function(){

sizeCanvas();

var canvas = document.getElementById('dot-animation');
var context = canvas.getContext('2d');



	for (var i = 0; i < dotNumber; i++){
		createDot(context);
	}

	setInterval(function(){

		context.clearRect(0, 0, canvas.width, canvas.height);

		dots.forEach(function(dot){

			dot.act(context);

		})

	},50 );


})


