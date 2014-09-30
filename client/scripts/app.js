// YOUR CODE HERE:
app = {

    server: 'https://api.parse.com/1/classes/chatterbox/',

    init: function() {
      console.log('running chatterbox');
      // Get username
      app.username = window.location.search.substr(10);

      app.onscreenMessages = {};

      // cache some dom references
      app.$text = $('#message');
      app.$room_name = $('#room');

      app.loadMsgs();
      setInterval( app.loadMsgs.bind(app), 100000);

      $('#click').on('click', app.handleRoomSubmit);
      $('#send').on('submit', app.handleSubmit);
      $('a .user').on('click', app.handleUserSubmit);
    },
   
   displayUsrMessages: function(messages, usr){
      app.clearMsgs();
      for( var i = 0; i < messages.length; i++ ){
        if(messages[i].username === usr){
          app.displayMessage(messages[i]);
        }
      }
    },

    loadUsrMsgs: function(usr){
      $.ajax({
        url: app.server,
        data: { order: '-createdAt' },
        contentType: 'application/json',
        success: function(json){
          app.displayUsrMessages(json.results, usr);
        },
        complete: function(){
          app.stopSpinner();
        }
      });
    },
    handleUserSubmit: function(e){
      console.log("Here");
      app.$username = $(this).data('user');
      loadUsrMsgs(app.$username);
    },

    handleRoomSubmit: function(e){
      //e.preventDefault();

      app.$room_name = $('#room').val();
      console.log('room name:', app.$room_name)
      app.loadRoomMsgs(app.$room_name);

    },

    handleSubmit: function(e){
      e.preventDefault();

      var message = {
        username: app.username,
        text: app.$text.val(),
        roomname: 'floor6'
      };

      app.$text.val('');

      app.sendMsg(message);
    },

    renderMessage: function(message){
      // var $user = $("<div>", {class: 'user'}).text(message.username);
      var $user = $("<a>", {class: 'user', 'href': "javascript:void(0)", 'data-user': _.escape(message.username)}).text(message.username);
      var $text = $("<div>", {class: 'text'}).text(message.text);
      var $room = $("<div>", {class: 'room'}).text(message.roomname);
      var $message = $("<div>", {class: 'chat', 'data-id': message.objectId }).append($user, $text, $room);
      return $message;
    },

    displayMessage: function(message){
      if( !app.onscreenMessages[message.objectId] ){
        var $html = app.renderMessage(message);
        $('#chats').prepend($html);
        app.onscreenMessages[message.objectId] = true;
      }
    },

    displayMessages: function(messages){
      for( var i = 0; i < messages.length; i++ ){
        app.displayMessage(messages[i]);
      }
    },

    loadMsgs: function(){
      $.ajax({
        url: app.server,
        data: { order: '-createdAt' },
        contentType: 'application/json',
        success: function(json){
          app.displayMessages(json.results);
        },
        complete: function(){
          app.stopSpinner();
        }
      });
    },

   displayRoomMessages: function(messages, room){
      app.clearMsgs();
      for( var i = 0; i < messages.length; i++ ){
        if(messages[i].roomname === room){
          app.displayMessage(messages[i]);
        }
      }
    },

    loadRoomMsgs: function(room){
      $.ajax({
        url: app.server,
        data: { order: '-createdAt' },
        contentType: 'application/json',
        success: function(json){
          app.displayRoomMessages(json.results, room);
        },
        complete: function(){
          app.stopSpinner();
        }
      });
    },
    
    sendMsg: function(message){
      app.startSpinner();
      $.ajax({
        type: 'POST',
        url: app.server,
        data: JSON.stringify(message),
        contentType: 'application/json',
        success: function(json){
          message.objectId = json.objectId;
          app.displayMessage(message);
        },
        complete: function(){
          app.stopSpinner();
        }
      });
    },

    startSpinner: function(){
      $('.spinner img').show();
      $('form input[type=submit]').attr('disabled', "true");
    },

    stopSpinner: function(){
      $('.spinner img').fadeOut('fast');
      $('form input[type=submit]').attr('disabled', null);
    },

    clearMsgs: function(){
      console.log('clearMsgs');
      $('div').remove('.user');
      $('div').remove('.text');
      $('div').remove('.room');

      for(var key in app.onscreenMessages){
        delete app.onscreenMessages[key];
      }
    }
};