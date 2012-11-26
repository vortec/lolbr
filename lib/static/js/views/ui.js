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
    $('#input')[0].oninput = changeInputHeight;   //jQuery does not understand oninput
    $('#input').keypress(function(event) {
        if (event.which == 13  && !event.shiftKey) {
            submit();
            changeInputHeight();
            event.stopPropagation();
            event.preventDefault();
        }
    });

    $('#log').click(setInputFieldFocus);
}

function clearInputField() {
    $('#input').val('');
    setInputFieldFocus();
}

function changeChatlogHeight() {
    // Take all vertically available space for the log div.
    // (not used atm, CSS does it)
}

function changeInputHeight() {
    var text = $('#input')[0];
    var min_height = 15;
    var max_height = 50;

    if (!text) {
        return;
    }

    if (text.clientHeight == text.scrollHeight) {
        text.height(min_height);
        $('#bottom_bar').height(min_height);
    }

    var adjusted_height = text.clientHeight;
    if (max_height > adjusted_height) {
        adjusted_height = Math.max(text.scrollHeight, adjusted_height);
        adjusted_height = Math.min(max_height, adjusted_height);
        if (adjusted_height > text.clientHeight) {
            text.height(adjusted_height);
            $('#bottom_bar').height(adjusted_height);
        }
    }
}

function getViewportDimensions() {
    var offset = $('body').offset();
    var height = window.innerHeight - (offset.top * 2)
    var width = window.innerWidth - (offset.left * 2)
    return [height, width];
}

function scrollToChatBottom() {
    $('#log').attr({
        scrollTop: $("#log").attr("scrollHeight")
    });
}

function setInputFieldFocus() {
    if((document.selection && document.selection.empty) ||
       (window.getSelection && getSelection().isCollapsed)) {
         $('#input').focus();
    }
}

$(window).resize(adjustComponentDimensions);
