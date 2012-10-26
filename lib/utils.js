var crypto = require('crypto')
  , im = require('node-imagemagick')
  , fs = require('fs')

module.exports.md5 = function(text) {
	return crypto.createHash('md5').update(text).digest('hex');
}

module.exports.decodeBase64 = function(base64) {
	var divided = base64.split(',');
	var decoded = new Buffer(divided[1], 'base64').toString('binary');
	var mime_type = divided[0].split(':')
	return [mime_type[1], decoded];
}
