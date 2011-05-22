var SocialApiWrapper = function(driver, params, callback) {
	// default settings
	params = jQuery.extend({
		// env settings
		api_path: 'api/',
		wrapperName: 'socialWrapper',

		// init wrapper settings
		init_user: false,
		init_friends: false,

		// resize
		init_resize_canvas: false,
		min_height: 1000,
		define_height_fn: function() {
			var height = jQuery(document.body).outerHeight(true);
			return height > params.min_height ? height : params.min_height;
		},
		resize_interval: 500
	}, params);
	
	// чтобы удобно обращаться к wrap
	var wrap = function() {
		return window[params.wrapperName];
	};

	// private
	var resolveApiName = function(driverName) {
		switch (driverName.toLowerCase()) {
			// @todo: переписать
			case 'vk': case 'vkontakte':
				return 'VkSocialApi';
				break;
			case 'mm': case 'mir': case 'mail': case 'mailru':
				return 'MmSocialApi';
				break;
			case 'fb': case 'facebook':
				return 'FbSocialApi';
				break;
			case 'ok': case 'odnoklassniki': case 'odkl':
				return 'OkSocialApi';
				break;
		}
		return false;
	};

	var unifyProfileFields = function(profile) {

	};

	var moduleExport = {
		initResizeCanvas: function() {
			window.setInterval(function() {
				wrap().resizeCanvas({height: params.define_height_fn()});
			}, params.resize_interval);
		},
		initContext: function(localParams, callback) {
			// сюда сохраняем, чтоб потом вернуть
			var context = {};

			var friendsCallback = function(friends) {
				context.friends = friends;
				wrap().getAppFriends(function(appFriends) {
					context.appFriends = appFriends;
					callback ? callback(context) : null;
				});
			};
			var currentUserCallback = function(user) {
				context.current = user;
				localParams.init_friends ? wrap().getFriends(friendsCallback) : friendsCallback({});
			};
			localParams.init_user ? wrap().getCurrentUser(currentUserCallback) : currentUserCallback({});
		},
		getApiName: function() {
			var full = arguments[0] || false;
			switch (driverName) {
				// @todo: переписать
				case "VkSocialApi": return full?'vkontakte':'vk';
				case "MmSocialApi": return full?'mail':'mm';
				case "FbSocialApi": return full?'facebook':'fb';
				case "OkSocialApi": return full?'odnoklassniki':'ok';
			}
		}
	};

	var driverName = resolveApiName(driver);
	if (!driverName) {
		return false;
	}

	// constructor
	jQuery.getScript(params.api_path + driverName + '.js', function() {
		// create local wrapper
		var privateSocialWrapper = new window[driverName](params, function() {

			// creating global wrapper variable
			window[params.wrapperName] = jQuery.extend(moduleExport, privateSocialWrapper.moduleExport);
			// immediately delete unnecessary global variable created inside **SocialApi
			delete window[driverName];

			// init resize
			if (params.init_resize_canvas) {
				wrap().initResizeCanvas();
			}
			// init context data
			wrap().initContext({init_friends: params.init_friends, init_user: params.init_user}, callback);
		});
	});
};
