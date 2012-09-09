var viewport;

function adjustComponentDimensions() {
    viewport = getViewportDimensions();
    changeInputWidth();
    changeChatlogHeight();
}

function assignListeners() {
    $('#input').keypress(function(event) {
        if (event.which == 13) {
            submit();
        }
    });
}

function clearInputField() {
    $('#input').val('');
    $('#input').focus();
}

function changeInputWidth() {
    $('#input').width('100%');
}

function changeInputHeight() {
    var elem = $('#input').height(15);
}

function changeChatlogHeight() {
    // Take all vertically available space for the log div.
    var chatlog = $('#log');
    var depends_on = $('#user_input');
    chatlog.height(viewport[0] - depends_on.height() - 26);
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
