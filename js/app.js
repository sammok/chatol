//  Qianglong Mo 2015(SukeBeta).
var chat = {};

chat.prototype = {};

// server config
chat.prototype.server = {
    server : null,

    init: function (){
        //  init Firebase
        chat.prototype.server.server = new Firebase('demo2003.firebaseio.com/web/data');

        //  sync data from remote when remote data changes
        chat.prototype.server.server.child('message').on("value", function(snapshot) {
            console.log('new data from server...', new Date());

            var localMessageList = chat.prototype.message.messageList;
            var remoteMessageList = snapshot.val();

            //  sync local data to be same with remote data
            for (x in remoteMessageList) {
                //  if remote data not in local data
                if (!localMessageList[x]) {
                    console.log('Add new', localMessageList[x]);

                    localMessageList[x] = remoteMessageList[x];
                    // insert text to page
                    chat.prototype.message.insertTextToChatPage(localMessageList[x], chat.prototype.message.scrollMessageListToBottom);
                    //  save data to local
                    chat.prototype.message.saveMessageToLocal();
                }
            }

            console.log(snapshot.val());
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    }
};

// App init config
chat.prototype.init = function (){
    //  read local message
    chat.prototype.message.readLocalMessage();

    for (x in chat.prototype.message.messageList) {
        // insert text to page
        chat.prototype.message.insertTextToChatPage(chat.prototype.message.messageList[x], chat.prototype.message.scrollMessageListToBottom);
        //console.log('local create list');
    }

    //  init server
    chat.prototype.server.init();

    //  read user
    var userName = chat.prototype.user.readUser();

    //  clear user
    $('.clearUser').click(function (){
        chat.prototype.user.clearUser();
        userName = null;
        console.log('success to clear local user.');
    });

    //  scroll to bottom
    chat.prototype.message.scrollMessageListToBottom();

    //  focus text
    $('#text')[0].focus();

    //  send message init
    chat.prototype.message.submitInit();

    //  delete message
    $('.clearMessage').click(function (){
        chat.prototype.message.clearMessage();
    });
};

//  Read user
chat.prototype.user = {
    curUser: null,

    readUser: function () {
        var localUserName = localStorage.chatUserName;

        if (localUserName) {
            userName = localUserName;
            chat.prototype.user.curUser = localUserName;
            $('.chat-people-list .list-group-item.active span').text(userName)
                .siblings('i').removeClass('hide');
        } else {
            //  create new user
            userName = '笨蛋不取名' + new String(new Date().getTime()).slice(-4, -1);
            var ask = prompt('你叫什么名字?');
            if (ask) {
                userName = ask.replace(/ /g, '');
                $('.chat-people-list .list-group-item.active span').text(userName)
                    .siblings('i').removeClass('hide');
            }
            localStorage.chatUserName = userName;
            chat.prototype.user.curUser = localStorage.chatUserName;
        }

        return chat.prototype.user.curUser;
    },

    changeUserName: function (){

    },

    clearUser: function () {
        localStorage.removeItem('chatUserName');
    }
};

//  Send message to server
chat.prototype.message = {
    messageList: {},

    saveMessageToLocal: function (){
        var localMessage = chat.prototype.message.messageList;
        if (localMessage && typeof(localMessage) == 'object') {
            localStorage.chatMessageList = JSON.stringify(localMessage);
        }
    },

    readLocalMessage: function (){
        if (localStorage.chatMessageList) {
            chat.prototype.message.messageList = JSON.parse(localStorage.chatMessageList);
        }
    },

    submitInit: function (){
        var that = this;
        //  submit text
        $('#submitText').click(function (){
            that.pushTextToServer();
            $('#text').val('').focus();
        });

        //  press enter to submit
        $(document).keydown(function (e) {
            if (e.keyCode == 13){
                $('#submitText')[0].click();
            }
        });
    },

    pushTextToServer: function () {
        var text = $('#text').val();
        if (text) {
            //  push message to server
            var msg = {
                "username": chat.prototype.user.curUser,
                "content": text,
                "pubtime": new Date().getTime()
            };

            //  send text to server
            chat.prototype.server.server.child('message')
                .push(msg, function (err){
                    //  if success send to server
                    if (err == null) {
                        chat.prototype.message.insertTextToChatPage(msg, chat.prototype.message.scrollMessageListToBottom);
                        console.log('Success to send message.');
                    }
                });
        }
    },

    //  create text dom, insert to message list
    insertTextToChatPage: function (msg, callback){
        //  create message item dom
        var message = '<li class="well"><h3>' + msg.username + '<small>' + new Date(msg.pubtime) + '</small></h3><p>' + msg.content + '</p></li>';
        $('.chat-box-list').append(message);

        //  callback
        if (callback && typeof(callback) == "function") callback();
    },

    scrollMessageListToBottom: function () {
        $('.chat-box-wrap').animate({scrollTop: 1000000000 + 'px'}, 200);
    },

    clearMessage: function () {
        localStorage.removeItem('chatMessageList');
    }
};

