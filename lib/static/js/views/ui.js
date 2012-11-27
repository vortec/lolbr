var viewport;
var drag_active = false;

function adjustComponentDimensions() {
    var input_width = $('#log').width() - $('#username').width() - 25;
    $('#input').width(input_width);
}

function assignListeners() {
    adjustComponentDimensions();
    $(window).resize(adjustComponentDimensions);

    $('#input')[0].oninput = changeInputHeight;   //jQuery does not understand oninput
    $('#input').keydown(function(event) {
        switch (event.which) {
            case 13:  // enter key
                if (!event.shiftKey) {
                    submit();
                    changeInputHeight();
                    event.stopPropagation();
                    event.preventDefault();
                }
                break;

            case 38:  // up key
                if (user.backlog_pointer == -1) {
                    //user.backlog_buffer = $('#input').val();
                    user.backlog_pointer = user.backlog.length - 1;
                } else {
                    if (user.backlog_pointer > 0) {
                        user.backlog_pointer--;
                    }
                }
                $('#input').val(user.backlog[user.backlog_pointer]);
                setInputFieldCaretToEnd();
                break;

            case 40:  // down key
                if (user.backlog_pointer >= user.backlog.length - 1) {
                    if (user.backlog_pointer == user.backlog.length - 1) {
                        user.backlog_pointer++;
                    }
                    $('#input').val('');
                } else {
                    user.backlog_pointer++;
                    $('#input').val(user.backlog[user.backlog_pointer]);
                }
                break;
            // no missing } here because of switch-case
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
    // stolen from http://stackoverflow.com/a/7875/298415 and modified after
    var text = $('#input')[0];
    var min_height = 15;
    var max_height = 50;

    if (!text) {
        return;
    }

    if (text.clientHeight == text.scrollHeight) {
        $('#input').height(min_height);
        $('#bottom_bar').height(min_height);
    }

    var adjusted_height = text.clientHeight;
    if (max_height > adjusted_height) {
        adjusted_height = Math.max(text.scrollHeight, adjusted_height);
        adjusted_height = Math.min(max_height, adjusted_height);
        if (adjusted_height > text.clientHeight) {
            $('#input').height(adjusted_height);
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

function setInputFieldCaretToEnd() {
    var text = $('#input')[0];
    // TODO: timeout needed because of possible race condition?
    window.setTimeout(function() {
        text.selectionStart = text.value.length;
        text.selectionEnd = text.value.length;
    }, 1)
}

function setInputFieldFocus() {
    if((document.selection && document.selection.empty) ||
       (window.getSelection && getSelection().isCollapsed)) {
         $('#input').focus();
    }
}

