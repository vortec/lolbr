var viewport;

function adjustComponentDimensions() {
    viewport = getViewportDimensions();
    var top_bar = $('#top_bar');
    var bottom_bar = $('#bottom_bar');

    //changeInputWidth();
    changeChatlogHeight();
}

function assignListeners() {
    $('#input_text').keypress(function(event) {
        if (event.which == 13) {
            submit();
        }
    });
}

function clearInputField() {
    $('#input_text').val('');
    $('#input_text').focus();
}

function changeInputHeight() {
    var elem = $('#input_text').height(15);
}

function changeChatlogHeight() {
    // Take all vertically available space for the log div.
    $('#log').height($('#content').height());
    $('#user_list').height($('#content').height());
}

function getViewportDimensions() {
    var offset = $('body').offset();
    var height = window.innerHeight - (offset.top * 2)
    var width = window.innerWidth - (offset.left * 2)
    return [height, width];
}

function scrollToChatBottom() {
    $('#log').attr({ scrollTop: $("#log").attr("scrollHeight") });
    //scrollTop = chatlog.scrollHeight;
}

$(window).resize(adjustComponentDimensions);
