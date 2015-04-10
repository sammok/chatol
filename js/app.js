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

            if (remoteMessageList == null) {
                //  when remote data are empty, clean the local data
                chat.prototype.message.clearMessage();
            } else {
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
            }
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    }
};

// App init config
chat.prototype.init = function (){
    //  read local message
    chat.prototype.message.readLocalMessage();

    //  insert local message to page
    for (x in chat.prototype.message.messageList) {
        chat.prototype.message.insertTextToChatPage(chat.prototype.message.messageList[x], chat.prototype.message.scrollMessageListToBottom);
    }

    //  init server
    chat.prototype.server.init();

    //  read user
    var userName = chat.prototype.user.readUser();

    //  focus text
    chat.prototype.utils.textFocus();

    //  scroll to bottom
    chat.prototype.message.scrollMessageListToBottom();

    //  send message init
    chat.prototype.message.submitInit();

    //  delete local message
    $('.clearMessage').click(function (){
        chat.prototype.message.clearMessage();
    });

    //  clear user
    $('.clearUser').click(function (){
        chat.prototype.user.clearUser();
        userName = null;
        console.log('success to clear local user.');
    });

    //  change user name
    $('.editName').click(function (){
        chat.prototype.user.changeUserName();
    });
};

//  Read user
chat.prototype.user = {
    curUser: null,

    readUser: function () {
        var localUserName = localStorage.chatUserName;
        //  update
        chat.prototype.user.updateUserName(localUserName);

        if (localUserName) {
            chat.prototype.user.curUser = localUserName;
            $('.chat-people-list .list-group-item.active span').text(userName)
                .siblings('i').removeClass('hide');
        } else {
            //  create new user
            var userName = '笨蛋不取名' + new String(new Date().getTime()).slice(-4, -1);

            chat.prototype.utils.floatWindow.inputWindow.open('.chat-floatwindow-input', '说说你的名字, 让大家认识你', '快点自豪的说出你的名字吧!', function (thisWindow){
                //  confirm
                thisWindow.find('.confirm').click(function (){
                    //  get name from input
                    var name = thisWindow.find('.text').val();
                    if (name) {
                        userName = name.replace(/ /g, '');
                        $('.chat-people-list .list-group-item.active span').text(userName)
                            .siblings('i').removeClass('hide');
                        chat.prototype.user.updateUserName(userName);
                    }

                    // close
                    chat.prototype.utils.floatWindow.inputWindow.close('.chat-floatwindow-input');
                    chat.prototype.utils.textFocus();
                });

                //  cancel
                thisWindow.find('.cancel').click(function (){
                    chat.prototype.utils.floatWindow.inputWindow.close('.chat-floatwindow-input');
                    chat.prototype.utils.textFocus();
                });

                //  key helpful
                $('.chat-floatwindow-input').keydown(function (e) {
                    e.stopPropagation();
                    //  press enter to continu
                    if (e.keyCode == 13){
                        $('.chat-floatwindow-input .confirm')[0].click();
                    } else if (e.keyCode == 27) {
                        //  press esc to continu
                        $('.chat-floatwindow-input .cancel')[0].click();
                    }
                });
            });

            //  update
            chat.prototype.user.updateUserName(userName);
        }

        return chat.prototype.user.curUser;
    },

    updateUserName: function (userName) {
        localStorage.chatUserName = userName;
        chat.prototype.user.curUser = localStorage.chatUserName;
        $('.chat-people-list .list-group-item.active span').text(chat.prototype.user.curUser);
    },

    changeUserName: function (){
        chat.prototype.utils.floatWindow.inputWindow.open('.chat-floatwindow-input', '想改名字了啊? 好吧, 狼哥哥给你这个机会', '输入你的新名字, 改多了妈妈都会不认识你哦!', function (thisWindow){
            //  confirm
            thisWindow.find('.confirm').click(function (){
                //  get userName from input
                var userName = thisWindow.find('.text').val();
                if (userName) {
                    userName = userName.replace(/ /g, '');
                    $('.chat-people-list .list-group-item.active span').text(userName)
                        .siblings('i').removeClass('hide');
                    //  update
                    chat.prototype.user.updateUserName(userName);
                }

                // close
                chat.prototype.utils.floatWindow.inputWindow.close('.chat-floatwindow-input');
                chat.prototype.utils.textFocus();
            });

            //  cancel
            thisWindow.find('.cancel').click(function (){
                chat.prototype.utils.floatWindow.inputWindow.close('.chat-floatwindow-input');
                chat.prototype.utils.textFocus();
            });

            //  key helpful
            $('.chat-floatwindow-input').keydown(function (e) {
                e.stopPropagation();
                //  press enter to continu
                if (e.keyCode == 13){
                    $('.chat-floatwindow-input .confirm')[0].click();
                } else if (e.keyCode == 27) {
                    //  press esc to continu
                    $('.chat-floatwindow-input .cancel')[0].click();
                }
            });
        });
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
            $('.chat-input .text').val('');
            chat.prototype.utils.textFocus();
        });

        //  press enter to submit
        $(document).keydown(function (e) {
            e.stopPropagation();
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
        $('.chat-box-wrap').stop().animate({scrollTop: $('.chat-box-list').outerHeight() + 'px'}, 200);
    },

    clearMessage: function () {
        localStorage.removeItem('chatMessageList');
    }
};

//  utils, provides some helpful module
chat.prototype.utils = {
    textFocus: function (){
        $('.chat-input .text')[0].focus();
    },
    floatWindow: {
        inputWindow: {
            open: function (inputWindow, title, description, callback){
                var inputWindow = $(inputWindow);
                $('.layout').addClass('blur');

                inputWindow.find('.panel-title span').text(title);
                inputWindow.find('.text').attr('placeholder', description);

                // pass current window in callback
                if (callback) callback(inputWindow);
                $(inputWindow).fadeIn(function (){
                    $(this).find('.text')[0].focus();
                });
            },

            close: function (inputWindow, callback){
                var inputWindow = $(inputWindow);
                $('.layout').removeClass('blur');

                inputWindow.fadeOut(function (){
                    // pass current window in callback
                    if (callback) callback(inputWindow);
                    inputWindow.find('.panel-title span').val('...');
                    inputWindow.find('.text').attr('placeholder', '').val('');
                });
            }
        }
    }
};



