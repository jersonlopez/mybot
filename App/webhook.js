'use strict'

const request = require('request')


const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN

let {
    watsonAssistantMessenger
} = require('./watson')

let conversation_id, contexid = "";


/* let handlePostback = (sender_psid, received_postback) => {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === 'yes') {
        response = {
            "text": "Thanks!"
        }
    } else if (payload === 'no') {
        response = {
            "text": "Oops, try sending another image."
        }
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
}

let callSendAPI = (sender_psid, response) => {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": {
            "access_token": PAGE_ACCESS_TOKEN
        },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}


let handleMessage = (sender_psid, received_message) => {

    let response;

    // Check if the message contains text
    if (received_message.text) {
        // Create the payload for a basic text message, which
        // will be added to the body of our request to the Send API
        response = {
            "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
        }
    } else if (received_message.attachments) {
        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Is this the right picture?",
                        "subtitle": "Tap a button to answer.",
                        "image_url": attachment_url,
                        "buttons": [{
                                "type": "postback",
                                "title": "Yes!",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "No!",
                                "payload": "no",
                            }
                        ],
                    }]
                }
            }
        }
    }

    // Sends the response message
    callSendAPI(sender_psid, response);
}


module.exports.eventReceiver = (req, res) => {
    let body = req.body;
    let text = null

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {

            // Gets the message. entry.messaging is an array, but 
            // will only ever contain one message, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }

            /* if (webhook_event.message && webhook_event.message.text) {
                text = webhook_event.message.text;
            } else if (webhook_event.postback && !text) {
                text = webhook_event.postback.payload;
            } else {
                res.sendStatus(404);
            } */

/* var params = {
                input: text,
                context: {"conversation_id": conversation_id}
            }
    
            var payload = {
                workspace_id: null
            };
    
            if (params) {
                if (params.input) {
                    params.input = params.input.replace("\n","");
                    payload.input = { "text": params.input };
                }
                if (params.context) {
                    payload.context = params.context;
                }
            }
            watsonAssistantMessenger(payload, sender_psid); 
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
} */

module.exports.tokenVerify = (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "alfabetagama"

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
}


/*************************************** Conexion con watson *****************************************/

const watson = require('watson-developer-cloud'); // watson sdk


const workspace = process.env.WORKSPACE_ID || 'workspaceId';

let w_conversation = new watson.AssistantV1({
    // If unspecified here, the ASSISTANT_USERNAME and ASSISTANT_PASSWORD env properties will be checked
    // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
    url: 'https://gateway.watsonplatform.net/conversation/api',
    username: process.env.ASSISTANT_USERNAME || '<username>',
    password: process.env.ASSISTANT_PASSWORD || '<password>',
    version: '2018-02-16'
});


module.exports.eventReceiver = (req, res) => {

    var text = null;

    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;

        if (event.message && event.message.text) {
            text = event.message.text;
        } else if (event.postback && !text) {
            text = event.postback.payload;
        } else {
            break;
        }

        var params = {
            input: text,
            // context: {"conversation_id": conversation_id}
            context: contexid
        }

        var payload = {
            workspace_id: workspace
        };

        if (params) {
            if (params.input) {
                params.input = params.input.replace("\n", "");
                payload.input = {
                    "text": params.input
                };
            }
            if (params.context) {
                payload.context = params.context;
            }
        }
        callWatson(payload, sender);
    }
    res.sendStatus(200);
};

function callWatson(payload, sender) {
    w_conversation.message(payload, function (err, convResults) {
        console.log(convResults);
        contexid = convResults.context;

        if (err) {
            return responseToRequest.send("Erro.");
        }

        if (convResults.context != null)
            conversation_id = convResults.context.conversation_id;
        if (convResults != null && convResults.output != null) {
            var i = 0;
            while (i < convResults.output.text.length) {
                sendMessage(sender, convResults.output.text[i++]);
            }
        }

    });
}

function sendMessage(sender, text_) {
    text_ = text_.substring(0, 319);
    messageData = {
        text: text_
    };

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: PAGE_ACCESS_TOKEN
        },
        method: 'POST',
        json: {
            recipient: {
                id: sender
            },
            message: messageData,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};