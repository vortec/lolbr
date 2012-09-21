var Log = function(elem) {
    var self = this;
    this.elem = elem;
    this.css_event_prefix = '';
    this.css_value_prefix = ''

    this.write = function(text) {
        self.elem.append(text + '<br/>');
    }

    this.log = function(xevent, data) {
        var template = event_texts[xevent];
        var text = '<div class="' + self.css_event_prefix + xevent + '">' + template + '</div>';
        for (var key in data) {
            var value = data[key];
            var replacement = '<span class="' + self.css_value_prefix + key + '">' + value + '</span>';
            text = text.replace('{' + key + '}', replacement);
        }
        self.write(text);
        self.scrollDown();
    }

    this.scrollDown = function() {
        self.elem.attr({
            scrollTop: $('#log').attr('scrollHeight')
        });
    }

    this.encode_utf8 = function(text) {
        return unescape(encodeURIComponent(text));
    }

    this.decode_utf8 = function(text) {
        return decodeURIComponent(escape(text));
    }
}