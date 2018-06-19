//Firebase
var functions = require('firebase-functions');
var admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
var wrotedata;

///////////INIT => PUSH NOTIFICATIONS///////////
//Create a firebase function
exports.PushNotification = functions.database.ref('Chats/{currentUser}/{friendUser}')
.onWrite((event) => {
    wrotedata = event.data.val();
    const currentUser = event.params.currentUser;
    console.log(currentUser);
    admin.database().ref('Tokens/' + currentUser)
        .orderByChild('fcmToken').once('value').then((alltokens) => {
            var rawtokens = alltokens.val();
            console.log("exec 1");
            console.log(rawtokens);
            var tokens = [];
            
            processtokens(rawtokens).then((processedtokens) => {

                for (var token of processedtokens) {
                    console.log("exec");
                    console.log("Token: " + token);
                    console.log(token.fcmToken);
                    tokens.push(token.fcmToken);
                }

                var payload = {
                    "notification":{
                        "title": "Nova mensagem",
                        "body": "Você possui uma nova mensagem.",
                        "sound" : "default",
                        "icon": 'fcm_push_icon',
                    },
                }

                return admin.messaging().sendToDevice(tokens, payload).then((response) => {
                    console.log('Success => Push notification');
                }).catch((err) => {
                    console.log(err);
                })
            })
         })
    })


function processtokens(rawtokens) {
    var promise = new Promise((resolve, reject) => {
         var processedtokens = []
    for (var token in rawtokens) {
        processedtokens.push(rawtokens[token]);
    }
    resolve(processedtokens);
    })
    return promise;

}
