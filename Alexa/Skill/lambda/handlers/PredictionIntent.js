/* IMPORTANT CONSTANTS */

const GetState = require("../assets/constants");
const api = require("../assets/api");
const mailer = require("../assets/mailer");
const evaluation_messages = require("../assets/constants");

const PERMISSIONS = require("../assets/constants");
const messages = require("../assets/constants");

/* SKILL LOGIC TO HANDLE PREDICTION INTENTS */

/*** HANDLE THE BEHAVIOUR IF THE DIALOG HAS NOT BEEN COMPLETED YET ***/
const InProgress_PredictionIntent = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "PredictionIntent" &&
      handlerInput.requestEnvelope.request.dialogState !== "COMPLETED"
    );
  },
  handle(handlerInput) {
    console.log("In progress ");
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  }
};

/*** HANDLE THE BEHAVIOUR IF THE DIALOG HAS BEEN COMPLETED ***/
const Completed_PredictionIntent = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "PredictionIntent"
    );
  },

  // asynchronous call enables to call the REST Api, i.e. the server as well as database
  async handle(handlerInput) {
    console.log("INSIDE - PREDICTION HANDLER");

    // define constants
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    console.log("The slots are: ", slots);
    console.log("The attributes are: ", attributes);

    // get the current state attribute
    attributes.state = GetState.getState().PREDICTION;
    console.log("The state is: ", attributes.state);

    // set the attributes
    handlerInput.attributesManager.setSessionAttributes(attributes);

    // get the model value from the slot
    let model = slots.Model.value;
    // transform the slot value, e.g. from 'life insurance' to 'LIFE_INSURANCE' which is necessary for
    // a mapping on the server
    console.log("Not transformed model is: ", model);
    model = model.replace(" ", "_");
    model = model.replace("-", "_");
    model = model.toUpperCase();
    console.log("The transformed model is:", model);

    // initialize the outputmessage as empty string
    let outputmessage = "";

    // get the customer id of the slot
    let customer_id = slots.CustomerID;
    customer_id = customer_id.value.toString();

    // get the user name from the database
    let _firstName = "";
    let _lastName = "";
    try {
      await api.customerHelper
        .getInformationById(customer_id)
        .then(function(responseContent) {
          let response = JSON.parse(responseContent);
          console.log(responseContent);
          console.log("Inside customerHelper:", response);
          _firstName = response.customer["FirstName"];
          _lastName = response.customer["LastName"];
        });
    } catch (error) {
      // build an appropriate outputmessage if the user does not exist
      return handlerInput.responseBuilder
        .speak(messages.messages.NO_CUSTOMER_EXISTS)
        .reprompt(messages.messages.NO_CUSTOMER_EXISTS)
        .getResponse();
    }

    // set the payload for the POST request in doPrediction
    const options = api.setPostOptions(
      "prediction",
      (body = { id: customer_id, model: model })
    );
    // get the result for the prediction
    await api.datascienceHelper.doPrediction(options).then(
      function(responseContent) {
        // get the classification value
        // 0 --> no, i.e. the forecast is negative, the customer wouldn't buy
        // 1 --> yes, i.e. the forecast is positive, the cusotmer would buy
        let classification = responseContent.result["classification"];
        // get the probability respectively to the binary value
        console.log("The response is: ", responseContent.result);
        // get the percentage valued
        let probability = responseContent.result["probability"][1] * 100;
        // round the value to two digits
        probability = probability.toFixed(2);
        console.log(classification, probability);

        // get the prodcut form the slot value
        let product = slots.Model;
        product = product.value;

        // assign variables to session attributes
        attributes.customer_id = customer_id;
        attributes.result = [product, probability];
        attributes.firstName = _firstName;
        attributes.lastName = _lastName;

        // build different output messages regarding the result of the classification
        if (classification === 0) {
          outputmessage = `The customer with <say-as interpret-as="characters">${customer_id}</say-as> is ${_firstName} ${_lastName}. Based on my knowledge, the customer will buy the product
          with a probability of ${probability} percent. So, I predict, that the offer will not be successful for ${product}. Do you want to receive an email with this information?`;
        } else {
          let _eval = evaluation(probability, product);
          outputmessage = `The customer with <say-as interpret-as="characters">${customer_id}</say-as> is ${_firstName} ${_lastName}. ${_eval} Do you want to receive an email with this information?`;
        }
      },
      function(error) {
        outputmessage = `I am sorry. This model does not exist. Please start again the process with I need a prediction`;
      }
    );

    // set the attributes
    handlerInput.attributesManager.setSessionAttributes(attributes);

    return handlerInput.responseBuilder
      .speak(outputmessage)
      .reprompt(outputmessage)
      .getResponse();
  }
};

/*** HANDLE THE YES ANSWER  ***/
// this intent is only fired when the state is _PREDICTION
const YesIntent_Prediction = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    return (
      request.type === "IntentRequest" &&
      request.intent.name === "AMAZON.YesIntent" &&
      attributes.state === "_PREDICTION"
    );
  },
  async handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const { requestEnvelope, responseBuilder } = handlerInput;
    console.log("INSIDE PREDICTION YES INTENT");
    // check if permissions are available for email reading
    const consentToken =
      requestEnvelope.context.System.user.permissions &&
      requestEnvelope.context.System.user.permissions.consentToken;
    if (!consentToken) {
      return responseBuilder
        .speak(messages.messages.NOTIFY_MISSING_PERMISSIONS)
        .withAskForPermissionsConsentCard(PERMISSIONS.permissions)
        .getResponse();
    }

    let email;
    try {
      const system = requestEnvelope.context.System;

      // query the user email adress
      email = await api.getAccountInfo(
        system.apiEndpoint,
        system.apiAccessToken,
        "email"
      );
    } catch (error) {
      console.log("The error is: ", error);
      if (error.name !== "ServiceError") {
        const response = responseBuilder
          .speak(
            "Uh Oh. Looks like something went wrong. Please restart the skill"
          )
          .getResponse();
        return response;
      }
      throw error;
    }

    // set the mailing options and pass the attributes for customised email content
    const mailOptions = mailer.setOptions(
      (from = "your.result.from.alexa@gmail.com"),
      (to = email),
      (subject = `ALEXA Query Result for Customer ${attributes.customer_id}`),
      (html = mailer.buildHtml(
        attributes.userName,
        attributes.firstName,
        attributes.lastName,
        attributes.customer_id,
        attributes.result
      ))
    );

    // send out the mail
    try {
      await mailer.sendEmail(mailOptions);
      outputmessage = "The email has been sent. What else can I do for you?";
    } catch (error) {
      outputmessage =
        "The email has not been sent. Please check the permissions in your alexa account and start the process again.";
      console.log(error);
    }
    // send the outputmessage to the alexa service
    return handlerInput.responseBuilder
      .speak(outputmessage)
      .reprompt(outputmessage)
      .getResponse();
  }
};

/*** HANDLE THE NO ANSWER  ***/
// this intent is only fired when the state is _PREDICTION
const NoIntent_Prediction = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    return (
      request.type === "IntentRequest" &&
      request.intent.name === "AMAZON.NoIntent" &&
      attributes.state == "_PREDICTION"
    );
  },
  handle(handlerInput) {
    console.log("In NO-Handler: ", handlerInput);
    let outputmessage = "Ok. What else can I do for you?";
    return handlerInput.responseBuilder
      .speak(outputmessage)
      .reprompt(outputmessage)
      .getResponse();
  }
};

/* HELPER FUNCTION TO EVALUATE THE PROBABILITY */
function evaluation(probability, product) {
  console.log("The probabilitiy is:", parseFloat(probability));
  let _prob = parseFloat(probability);
  _prob = _prob.toFixed(2);
  console.log("The type of probabilitiy is:", typeof _prob, _prob);

  switch (true) {
    case _prob > 50.0 && _prob <= 55.0:
      return evaluation_messages.acceptable(_prob, product);
      break;
    case _prob > 55.0 && _prob <= 70.0:
      return evaluation_messages.good(_prob, product);
      break;
    case 70.0 < _prob <= 85.0:
      return evaluation_messages.high(_prob, product);
      break;
    case 85.0 < _prob <= 100.0:
      return evaluation_messages.very_high(_prob, product);
      break;
    default:
      console.log("The type of probabilitiy is:", typeof _prob, _prob);
      return "Something went wrong. Try again!";
      break;
  }
}

/* EXPORT THE FUNCTIONS AS CONTANTS TO USE THEM IN THE INDEX.JS */

module.exports.InProgess_PredictionIntent = InProgress_PredictionIntent;
module.exports.Completed_PredictionIntent = Completed_PredictionIntent;
module.exports.YesIntent_Prediction = YesIntent_Prediction;
module.exports.NoIntent_Prediction = NoIntent_Prediction;
