var log, room, socket, user, userlist;

$(window).ready(function() {
    log = new Log($('#log'));
    userlist = new Userlist($('#user_list_elem'));

    var roomname = window.location.pathname.split('/')[1];
    room = new Room(roomname);

    assignListeners();
    connect();

    initializeNotifications();
});

$(window).resize(function() {
    log.scrollDown();
});


function connect() {
    var host = window.location.hostname;
    socket = io.connect('http://' + host);
    for (var event in handlers) {
        socket.on(event, handlers[event]);
    }
}

function dropFile(e) {
    var files = e.dataTransfer.files;

    /*for (var i=0,f; f=files[i]; i++) {
        var imageReader = new FileReader();
        imageReader.onload = (function(aFile) {
            return function(e) {
                console.info(e.target.result);
            };
        })(f);
        imageReader.readAsDataURL(f);
      }*/

    if (files.length <= 5) {
        for (var i=0; i < files.length; i++) {
            var file = files[i];
            var file_reader = new FileReader();

            file_reader.onload = (function(file) {
                return function(e) {
                    var filename = file.name;
                    var content = e.target.result;
                    var data = {
                        file: content,
                        filename: filename
                    }
                    log.log('UPLOADING', data)
                    socket.emit('FILE', data);
                }
            })(file);
            file_reader.readAsDataURL(file);
        }
    }
    setInputFieldFocus();
    e.stopPropagation();
    e.preventDefault();
}

function submit() {
    var text = $('#input').val();
    user.push('MESSAGE', {'text': text});
    clearInputField();
    user.backlog_pointer = user.backlog.length;
}

