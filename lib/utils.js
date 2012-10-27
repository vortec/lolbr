var crypto = require('crypto')
  , fs = require('fs')

module.exports.md5 = function(text) {
    return crypto.createHash('md5').update(text).digest('hex');
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

module.exports.decodeBase64 = function(base64) {
    return new Buffer(base64, 'base64').toString('binary');
}
