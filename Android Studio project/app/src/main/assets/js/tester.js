// test program, creating objects in array and then destroy objects

var CANVAS_WIDTH = window.innerWidth;
var CANVAS_HEIGHT = window.innerHeight;

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
	
}

var txtdebug;
var txtfps;
var txttest;
var phaserdude;
var starfield;


function create() {
console.log('create starts game.width='+game.width+' game.height='+game.height);

    //  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, game.width, game.height, 'starfield');

    // add phaserdude to show touch position
    phaserdude = game.add.sprite(0, 0, 'phaserdude');
	//for (var i = 0; i < 20; i++) {
	//	var xpos = game.rnd.integerInRange(0, CANVAS_WIDTH);
	//	var ypos = game.rnd.integerInRange(0, CANVAS_HEIGHT);
	//	var idx = game.rnd.integerInRange(0, 5);
	//	game.add.sprite(xpos, ypos, 'balls', idx);
	//}

    //  fake text for debugging purposes
    txtdebug = createMsdosText (game, 40, 0);
    txtfps = createMsdosText (game, 5, 1);
	txttest = createMsdosText (game, 30, 8);


	var msg = 'Testing GLES.JS wrapper, w*h=' + window.innerWidth +  '*' + window.innerHeight;
	doMsdosText(txtdebug, msg);
	doMsdosText(txtfps, '60fps');
	doMsdosText(txttest, 'More text goes here.. abc 123');
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
	phaserdude.x = game.input.x;
	phaserdude.y = game.input.y;
	var msg = 'dude coords='+game.input.x+'x'+game.input.y
	doMsdosText(txttest, msg);

	var str = ''+fps.getFPS()+'fps';
	doMsdosText(txtfps, str);
}

function render() {

    // for (var i = 0; i < aliens.length; i++)
    // {
    //     game.debug.body(aliens.children[i]);
    // }
}
