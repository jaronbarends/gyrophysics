(function($) {

	'use strict';

	var $fsLog = $('#log'),
		$fsBlock = $('#block'),
		$fsArea = $('#area'),
		fsAreaW = $fsArea.width(),
		fsAreaH = $fsArea.height(),
		fsBlockW = $fsBlock.outerWidth(),
		fsBlockH = $fsBlock.outerHeight();
	
	var fsMass = 5,//mass in kg
		fsG = 9.85,//gravity
		fsFv = fsMass*fsG,//vertical force
		fsFriction = 0,//friction coefficient
		fsBounceAbsorption = 0.2,
		fsDistanceFactor = 0.2,//
		fsX = {
			pos: 0,
			speed: 0,
			size: 0,
			maxPos: fsAreaW - fsBlockW
		},
		fsY = {
			pos: 0,
			speed: 0,
			size: 0,
			maxPos: fsAreaH - fsBlockH
		},
		fsSpeedX = 0,
		fsSpeedY = 0;

	var fsGyroPollingFrequency = 50,//polling frequency in ms
		fsDt = fsGyroPollingFrequency/1000;//frequency in sec


	/**
	* original demo code; kept for reference
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var originalDemoCode = function() {
		gyro.startTracking(function(o) {
			var b = documetn.getElementById('example'),
					f = document.getElementById('features');
			f.innerHTML = gyro.getFeatures();
			b.innerHTML = "<p> x = " + o.x + "</p>" +
										"<p> y = " + o.y + "</p>" +
										"<p> z = " + o.z + "</p>" +
										"<p> alpha = " + o.alpha + "</p>" +
										"<p> beta = " + o.beta + "</p>" +
										"<p> gamma = " + o.gamma + "</p>";
		});
	};


	/**
	* format degrees
	* @param {number} deg Description
	* @returns {string} formatted degrees
	*/
	var formatDegrees = function(deg) {
		deg = Math.round(10*deg)/10;
		return deg;
	};


	/**
	* convert angle in degrees to angle in radians
	* @param {number} degrees Angle in degrees
	* @returns {number} angle in radians
	*/
	var toRadians = function(deg) {
		return deg * (Math.PI / 180);
	};
	


	/**
	* get resulting force in a direction
	* @param {number} degrees Rotation along axis in degrees
	* @returns {undefined}
	*/
	var getResultingForce = function(deg) {
		var rad = toRadians(Math.abs(deg)),//calculate with absolute value for degrees
			force = fsFv*(Math.sin(rad) - fsFriction*Math.cos(rad));

		force = Math.max(0, force);

		if (deg < 0) {
			force = -force;
		}

		return force;
	};


	/**
	* calculate the distance corresponding to speed
	* @param {object} obj The object for current direction
	* @param {number} dSpeed The object for current direction
	* @returns {number} The distance traveled within polling frequency
	*/
	var getNewPos = function(obj) {

		var distance = obj.speed*fsDt;

		distance *= fsDistanceFactor;

		var newPos = obj.pos + distance;
		if (newPos < 0 || newPos > obj.maxPos) {
			if (newPos < 0) {
				newPos = 0;
			} else {
				newPos = obj.maxPos;
			}
			obj.speed = -fsBounceAbsorption*obj.speed;
			newPos = getNewPos(obj);
		}


		return newPos;
	};
	


	/**
	* update the properties in a given direction based on rotation
	* @param {number} deg Rotation in degrees
	* @param {object} obj Object containing info for specific direction (x or y)
	* @returns {undefined}
	*/
	var updateProperties = function(deg, obj) {
		
		var force = getResultingForce(deg),//resulting force along plane
			a = force/fsMass,//resulting acceleration along plane (in m/sec^2)
			dSpeed = a/fsDt;

		obj.speed += dSpeed;

		var distance = obj.speed*fsDt;
		distance *= fsDistanceFactor;

		var newPos = obj.pos + distance;
		if (newPos < 0 || newPos > obj.maxPos) {
			if (newPos < 0) {
				newPos = 0;
			} else {
				newPos = obj.maxPos;
			}
			obj.speed = -fsBounceAbsorption*obj.speed;
		}

		obj.pos = newPos;
	};
	
	
	


	/**
	* handle gyro input
	* @param {object} obj Object with gyroscopic data
	* @returns {undefined}
	*/
	var gyroHandler = function(obj) {
		var h = '<p>beta (rond y-as):'+formatDegrees(obj.beta)+'</p>';
		h += '<p>gamma (rond x-as):'+formatDegrees(obj.gamma)+'</p>';

		var xDeg = obj.gamma,
			yDeg = obj.beta;

		updateProperties(xDeg, fsX),
		updateProperties(yDeg, fsY);

		updateBlockPosition();
	};


	/**
	* 
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var updateBlockPosition = function() {
		var x = fsX.pos+'px',
			y = fsY.pos+'px',
			transform = 'translate('+x+','+y+')';

		$fsBlock.css({
			transform:transform
		});

	};


	/**
	* initialize viewport
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var initDimensions = function() {
		console.log(fsAreaW)	;
	};
	
	
	


	/**
	* initialize everything
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var init = function() {
		initDimensions();
		updateBlockPosition();
		gyro.frequency = fsGyroPollingFrequency;
		gyro.startTracking(gyroHandler);
	};
	

	init();
	

})(jQuery);