// test program, creating objects in array and then destroy objects

var CANVAS_WIDTH = window.innerWidth;
var CANVAS_HEIGHT = window.innerHeight;

var txtdebug;
var txtfps;
var txttest;
var phaserdude;
var starfield;
var soundForcefield;

// thanks Felipe http://www.html5gamedevs.com/topic/1828-how-to-calculate-fps-in-plain-javascript/
var fps = {
	startTime : 0,
	frameNumber : 0,
	getFPS : function(){
		this.frameNumber++;
		var d = new Date().getTime(),
		currentTime = ( d - this.startTime ) / 1000,
		result = Math.floor( ( this.frameNumber / currentTime ) );
		if( currentTime > 1 ) {
			this.startTime = new Date().getTime();
			this.frameNumber = 0;
		}
		return result;
	}
};


var game = new Phaser.Game(CANVAS_WIDTH, CANVAS_HEIGHT, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {
console.log('preload starts');
    game.load.spritesheet('msdosfont', 'img/msdosfont2.png', 18, 32);
    game.load.image('starfield', 'img/starfield.jpg');
    game.load.image('phaserdude', 'img/phaserdude.png');
    game.load.spritesheet('balls', 'img/balls.png', 17, 17);
	
	// GLESJS: can't use Phaser audio, instead use audio element
	//game.load.audio('forcefield', 'snd/forcefield.wav');
	//soundForcefield = new Audio('forcefield');
	//soundForcefield = document.getElementById('forcefield');
	//console.log('preload - soundForcefield='+soundForcefield);
	//soundForcefield = new Audio('forcefield');

	// JGAudio taken from TsunamiCruiser
	JGAudio.load('forcefield', 'snd/forcefield');
}


function create() {
console.log('create starts game.width='+game.width+' game.height='+game.height);

    //  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, game.width, game.height, 'starfield');
	
	//soundForcefield = game.add.audio('forcefield');

    // add phaserdude to show touch position
    phaserdude = game.add.sprite(0, 0, 'phaserdude');
	for (var i = 0; i < 50; i++) {
		var xpos = game.rnd.integerInRange(0, CANVAS_WIDTH);
		var ypos = game.rnd.integerInRange(0, CANVAS_HEIGHT);
		var idx = game.rnd.integerInRange(0, 5);
		game.add.sprite(xpos, ypos, 'balls', idx);
	}

    //  fake text for debugging purposes
    txtdebug = createMsdosText (game, 40, 0);
    txtfps = createMsdosText (game, 5, 1);
	txttest = createMsdosText (game, 30, 8);


	var msg = 'BLATEST GLES.JS wrapper, wxh=' + window.innerWidth +  '*' + window.innerHeight;
	doMsdosText(txtdebug, msg);
	doMsdosText(txtfps, '60fps');
	doMsdosText(txttest, 'More text goes here.. abc 123');
	
	// particle for stars on gamewin panel
	emitterTouch = game.add.emitter(0, 0, 200); // x=0, y=0, maxParticles=200
	emitterTouch.makeParticles('balls', [0,1,2,3,4,5]);
	emitterTouch.setXSpeed(-240, +240);
	emitterTouch.setYSpeed(-240, +240);
	emitterTouch.setRotation(0, 0);
	emitterTouch.setScale(1, 0.1, 1, 0.1, 1600, Phaser.Easing.None);
	emitterTouch.gravity = 0; // no gravity
	
	// set emitter event handler
	game.input.onDown.add(doGameSwipeOnDown);
}

function doGameSwipeOnDown(evt) {
	// start move
	emitterTouch.x = evt.x;
	emitterTouch.y = evt.y;
	
	emitterTouch.start(true, 500, null, 30); // explode=true, lifespan=500, freq=null, quantity=30
	
	console.log('doGameSwipeOnDown - about soundForcefield.play()');
	//soundForcefield.play();

	//JGAudio.play('forcefield'); // works in browser but crashes in GLESJS "accessed stale local reference" !?
}

function createMsdosText (game, count, ypos) {

	var result = game.add.group();
	result.createMultiple(count, 'msdosfont');
	for (var x = 0; x < result.children.length; x++) {
		result.children[x].x = x*18;
		result.children[x].y = ypos*32;
		result.children[x].frame = 1
		result.children[x].visible = true;
	};
	
	return result;
}

function doMsdosText (grp, str) {
    for (var i = 0; i < grp.children.length; i++)
    {
		var charidx = 32;
		if (i < str.length) {charidx = str.charCodeAt(i)};
		grp.children[i].frame = charidx;
    };
}

function update() {
    //  Scroll the background
    starfield.tilePosition.y += 1;

    //  Reset the player, then check for movement keys
    //player.body.velocity.setTo(0, 0);

	// mouse control
    //player.body.x = game.input.x;
	
	// phaserdude at touch position
	if (game.input.mouse.button == -1) {
		phaserdude.x = 0;
		phaserdude.y = 0;
	} else {
		phaserdude.x = game.input.x;
		phaserdude.y = game.input.y;
	}

	var msg = 'dude coords='+phaserdude.x+'x'+phaserdude.y;
	doMsdosText(txttest, msg);
	//if (_canvas) {
		//console.log('_canvas._virtmousex = '+_canvas._virtmousex);
	//}


	var str = ''+fps.getFPS()+'fps';
	doMsdosText(txtfps, str);
}

function render() {

    // for (var i = 0; i < aliens.length; i++)
    // {
    //     game.debug.body(aliens.children[i]);
    // }
}
