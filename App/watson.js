'use strict'

const watson = require('watson-developer-cloud'); // watson sdk
const request = require('request')

const {
  informationModel,
  userModel
} = require('./db/model')
const {
  validate,
  greet
} = require('./validations')

let assistant = new watson.AssistantV1({
  // If unspecified here, the ASSISTANT_USERNAME and ASSISTANT_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  username: process.env.ASSISTANT_USERNAME || '<username>',
  password: process.env.ASSISTANT_PASSWORD || '<password>',
  version: '2018-02-16'
});

let watsonAssistant = (req, res) => {

  let workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  if (!workspace || workspace === '<workspace-id>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }

  let payload = {
    workspace_id: workspace,
    context: req.body.context || {},
    input: req.body.input || {}
  };

  assistant.message(payload, async function (err, data) {
    if (err) {
      return res.status(err.code || 500).json(err);
    }

    let result = await updateMessage(payload, data)
    console.log(result.output.text)
    return res.json(result);
  });
}

let watsonAssistantMessenger = (payload, sender) => {

  let workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  if (!workspace || workspace === '<workspace-id>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }

  payload.workspace_id = workspace

  assistant.message(payload, function (err, convResults) {

    console.log(convResults);

    if (err) {
      return responseToRequest.send("Error");
    }

    if (convResults.context != null) payload.context = convResults.context.conversation_id;

    if (convResults != null && convResults.output != null) {
      let i = 0;
      while (i < convResults.output.text.length) {
        sendMessage(sender, convResults.output.text[i++]);
      }
    }

  });

  /* assistant.message(payload, async function (err, data) {
    if (err) {
      return res.status(err.code || 500).json(err);
    }

    let result = await updateMessage(payload, data)
    return result.output.text
  }); */
}

async function updateMessage(input, response) {
  let responseText = null;
  if (!response.output) {
    response.output = {};
  } else {
    if (response.context.saludo) {
      response.context.saludo = false
      response.output.text = await greet(response)
    }
    if (response.context.aceptar_datos) {
      response.context.aceptar_datos = false
      let validations = await validate(response.context)

      response.output.text = validations
      let newChat = new informationModel({
        "name": "Jerson Lopez Castaño",
        "pid": response.context.cedula,
        "income": response.context.ingresos,
        "expenses": response.context.egresos,
        "type_contract": response.context.tipo_contrato,
        "antique": response.context.antiguedad,
        "phone": response.context.telefono
      })

      /* newChat.save((err, succ) => {
        if (err) {
          console.log(`Hubo un erro alacenando los datos \n ${err}`)
        } else {
          console.log(`Chat almacenado con exito \n ${succ}`)
        }
      }) */
    }
    return response;
  }
  if (response.intents && response.intents[0]) {
    let intent = response.intents[0];
    // Depending on the confidence of the response the app can return different messages.
    // The confidence will vary depending on how well the system is trained. The service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
    // user's intent . In these cases it is usually best to return a disambiguation message
    // ('I did not understand your intent, please rephrase your question', etc..)
    if (intent.confidence >= 0.75) {
      responseText = 'I understood your intent was ' + intent.intent;
    } else if (intent.confidence >= 0.5) {
      responseText = 'I think your intent was ' + intent.intent;
    } else {
      responseText = 'I did not understand your intent';
    }
  }
  response.output.text = responseText;
  return response;
}

let sendMessage = (sender, text_) => {
  text_ = text_.substring(0, 319);
  let messageData = {
    text: text_
  };

  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender
    },
    "message": messageData
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": {
      "access_token": process.env.PAGE_ACCESS_TOKEN
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
};

let saveUser = (req, res) => {
  let user = new userModel({
    "name": req.body.name,
    "pid": req.body.pid
  }).save((err, succ) => {
    if (!err) {
      res.send(succ)
    }
  })
}

let pong = (req, res) => {
  res.send("pong")
}

module.exports = {
  watsonAssistant,
  watsonAssistantMessenger,
  saveUser,
  pong
}