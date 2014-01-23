var reader = new FileReader();
var textarea;
var xmlhttp;
var Bvh = {};

init();

function init() {
	var css; //, selBvh, geometry, material, mesh;

	css = document.body.appendChild(document.createElement('style'));
	css.innerHTML = 'body { font: 600 12pt monospace; overflow: hidden; }' +
		'input { font: 600 12pt monospace; }';

	Bvh.info = document.body.appendChild(document.createElement('div'));

	/*
		Bvh.info.innerHTML = '<h1>Read BVH CMU DAZ</h1>' +
		'<select id=selBvh onchange=requestFile("bvh-cmu-daz/"+Bvh.files[this.selectedIndex]) ></select> ' +
		'<input type=file onchange=readText(this) /> <input type="checkbox" id="play" checked>Play - ' +
		'<button type=button onclick=Bvh.play.checked=false;Bvh.animate(0); >First frame</button>';

		Bvh.play = document.getElementById('play');
		selBvh = document.getElementById('selBvh');

		Bvh.files = [ '05_01.bvh', '05_14.bvh', '05_15.bvh', '07_03.bvh', '07_06.bvh', '08_08.bvh', '10_02.bvh', '13_14.bvh', '13_20.bvh', '13_29.bvh',
			'13_32.bvh', '14_10.bvh', '14_24.bvh', '16_15.bvh', '16_31.bvh', '16_36.bvh', '17_07.bvh'
		];
		for (var len = Bvh.files.length, option, i = 0; i < len; i++) {
			option = document.createElement( 'option' );
			option.innerText = Bvh.files[i];
			selBvh.appendChild( option );

		}
		selBvh.selectedIndex = 6;
*/

	textarea = document.body.appendChild(document.createElement('textarea'));
	textarea.style.cssText = 'height: ' + (window.innerHeight - 150) + 'px; width: ' + 0.45 * window.innerWidth + 'px; ';
	textarea.value = 'text here...';


}

function readText(that) {
	if (that.files && that.files[0]) {
		var reader = new FileReader();
		reader.onload = function(event) {
			if (threeD.scene.children.length > 1) {
				threeD.scene.remove(threeD.scene.children[2]);
			}
			var data = event.target.result;
			//textarea.value = data;
			alert("something");
			Bvh.parseData(data);
		};
		reader.readAsText(that.files[0]);
	}
}

function requestFile(fname) {
	//dataPlay = false;
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open('GET', fname, true);
	xmlhttp.onreadystatechange = callbackFile;
	xmlhttp.send(null);
	callbackCount = 0;
}

function callbackFile() {
	if (xmlhttp.readyState == 4) {
		//if ( threeD.scene.children.length > 1 ) {
		//	threeD.scene.remove( threeD.scene.children[2] );
		//}
		var data = xmlhttp.responseText;
		//textarea.value = data;
		Bvh.parseData(data);
	} else {
		// console.log('waiting...');
	}
}

Bvh.parseData = function(data) {
	console.log("bvh parsedata start");
	if (threeD.scene.children.length > 1) {
		threeD.scene.remove(threeD.scene.children[2]);
	}

	var _this = Bvh;
	_this.data = data.split(/\s+/g);
	//console.log(JSON.stringify(_this.data));
	_this.channels = [];
	var done = false;
	var intcount = 0;
	while (!done) {
		intcount += 1;
		console.log(intcount);
		switch (_this.data.shift()) {
			case 'ROOT':
				console.log("case root");
				_this.root = _this.parseNode(_this.data);
				//console.log(JSON.stringify(_this.root));
				_this.root.traverse(

					function(child) {
						console.log(":: " + child.name + child.position.x);
					}
				);
				threeD.scene.add(_this.root);
				break;
			case 'MOTION':
				_this.data.shift();
				_this.numFrames = parseInt(_this.data.shift());
				_this.data.shift();
				_this.data.shift();
				_this.secsPerFrame = parseFloat(_this.data.shift());
				//	console.log(JSON.stringify(_this.data));
				done = true;
		}
	}
	//	_this.root.material = new THREE.MeshBasicMaterial({ color: 0xff0000});
	_this.startTime = Date.now();
	animate();
};


Bvh.animate = function(frame) {
	var ch, n, torad, ref;
	n = frame % this.numFrames * this.channels.length;
	torad = Math.PI / 180;
	ref = this.channels;
	var reflen = this.channels.length;
	for (var i = 0; i < reflen; i++) {
		//ch = this.channels[i];//ref[ i ];
		switch (this.channels[i].prop) {
			case 'Xrotation':
				this.channels[i].node.rotation.x = (parseFloat(this.data[n])) * torad;
				break;
			case 'Yrotation':
				this.channels[i].node.rotation.y = (parseFloat(this.data[n])) * torad;
				break;
			case 'Zrotation':
				this.channels[i].node.rotation.z = (parseFloat(this.data[n])) * torad;
				break;
			case 'Xposition':
				this.channels[i].node.position.x = this.channels[i].node.offset.x + parseFloat(this.data[n]);
				break;
			case 'Yposition':
				this.channels[i].node.position.y = this.channels[i].node.offset.y + parseFloat(this.data[n]);
				break;
			case 'Zposition':
				this.channels[i].node.position.z = this.channels[i].node.offset.z + parseFloat(this.data[n]);
		}
		n++;
	}
};

function animate() {
	setTimeout(function() {

		requestAnimationFrame(animate);

	}, 1000 / 30);
	//requestAnimationFrame( animate );
	threeD.controls.update();
	threeD.renderer.render(threeD.scene, threeD.camera);
	threeD.stats.update();
	if (Bvh.play.checked) {
		var frame = ((Date.now() - Bvh.startTime) / Bvh.secsPerFrame / 1000) | 0;
		Bvh.animate(frame);
	}
}