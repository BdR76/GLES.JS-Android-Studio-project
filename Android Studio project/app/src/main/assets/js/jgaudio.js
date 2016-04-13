

function JGAudio() { }

// false, null -> init
// true,null -> use audio element
// true,nonnull -> use web audio api
JGAudio._inited = false;
JGAudio._context = null;

// Audio elements
JGAudio._soundcache = {};

// mapping from sound name to filename
// or from sound name to audio buffer
JGAudio._sounds = {};

// name of channel if a looping sound was played before it was loaded
// -> play as soon as loaded. 
JGAudio._sounds_queued = {};

JGAudio._init = function() {
	if (JGAudio._inited) return;
	if (window.AudioContext || window.webkitAudioContext) {
		try {
			window.AudioContext=window.AudioContext||window.webkitAudioContext;
			JGAudio._context = new AudioContext();
		} catch (e) {
			// web audio not supported, use audio element
		}
	}
	JGAudio._inited = true;
}

// tries to load mp3 and ogg
JGAudio._loadFile = function(basefilename) {
	var ret=null;
	if ((new Audio()).canPlayType("audio/mpeg;")) {
		ret = new Audio(basefilename+".mp3");
	} else if ((new Audio()).canPlayType("audio/ogg;")) {
		ret = new Audio(basefilename+".ogg");
	}
	return ret;
}

JGAudio.load = function (name,basefilename) {
	JGAudio._init();
	if (JGAudio._context) {
		JGAudio._sounds[name] = "loading";
		var request = new XMLHttpRequest();
		request.open('GET', basefilename+".mp3", true);
		request.responseType = 'arraybuffer';
		// Decode asynchronously
		request.onload = function() {
			JGAudio._context.decodeAudioData(request.response,
				function(buffer) {
					JGAudio._sounds[name] = buffer;
					if (JGAudio._sounds_queued[name]) {
						JGAudio._sounds_queued[name] = false;
						JGAudio.play(name,JGAudio._sounds_queued[name],true);
					}
				},
				function(error) { }/*onError*/
			);
		}
		request.send();
	} else {
		JGAudio._sounds[name] = basefilename;
		JGAudio._soundcache[name] = JGAudio._loadFile(basefilename);
	}
}

JGAudio.play = function(name,channel,loop) {
	if (typeof JGAudio._sounds[name] == "undefined") return;
	if (JGAudio._context) {
		if (JGAudio._sounds[name] == "loading") {
			if (loop) {
				JGAudio._sounds_queued[name] = channel;
			}		
		} else {
			var source = JGAudio._context.createBufferSource();
			source.buffer = JGAudio._sounds[name];
			source.connect(JGAudio._context.destination);
			if (loop) source.loop = true;
			source.start(0);
		}
	} else {
		var audio = JGAudio._loadFile(JGAudio._sounds[name]);
		// http://stackoverflow.com/questions/3273552/html-5-audio-looping
		if (loop) audio.loop = true;
		audio.play();
		//audio.preload="auto";
		//audio.addEventListener("canplay", function() { alert("canplay"); audio.play(); });
	}
}

