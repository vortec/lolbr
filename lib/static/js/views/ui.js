var viewport;
var drag_active = false;

function adjustComponentDimensions() {
    viewport = getViewportDimensions();
    var top_bar = $('#top_bar');
    var bottom_bar = $('#bottom_bar');

    //changeInputWidth();
    changeChatlogHeight();
}

function assignListeners() {
    $('#input').keypress(function(event) {
        if (event.which == 13) {
            submit();
        }
    });

    $('#log').click(setInputFieldFocus);
}

function clearInputField() {
    $('#input').val('');
    setInputFieldFocus();
}

function setInputFieldFocus() {
    if((document.selection && document.selection.empty) ||
       (window.getSelection && getSelection().isCollapsed)) {
         $('#input').focus();
    }
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
