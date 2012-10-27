var crypto = require('crypto')
  , fs = require('fs')
  , im = require('imagemagick')

module.exports.decodeBase64 = function(base64) {
    return new Buffer(base64, 'base64').toString('binary');
}

module.exports.infoFromBrowserFile = function(browser_file_string) {
    var divided = browser_file_string.split(',');
    var mime = divided[0].split(':')[1];
    var type = mime.split('/')[0];
    var ret = {
        mime_type: mime,
        type: type,
        base64: divided[1]
    }
    return ret;
}

module.exports.md5 = function(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

module.exports.makeThumbnailFromMemory = function(image, callback) {
    im.resize({
        srcData: image,
        width: 256
    }, callback
    );
}
