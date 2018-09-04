const messages = require("../assets/constants");
const PERMISSIONS = require("../assets/constants");
const api = require("../assets/api");

// hanlde the start of the skill
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    console.log(
      "STARTE: ",
      JSON.stringify(handlerInput.requestEnvelope.request.type)
    );
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  async handle(handlerInput) {
    console.log("IN LAUNCH REQUEST");
    // define constants to reduce writing amount
    const { requestEnvelope, responseBuilder } = handlerInput;
    const system = requestEnvelope.context.System;

    // get the attributesManager object to access different scopes of attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // check if permissions are available for first name reading
    const consentToken =
      requestEnvelope.context.System.user.permissions &&
      requestEnvelope.context.System.user.permissions.consentToken;
    if (!consentToken) {
      console.log("No constentoken");
      return responseBuilder
        .speak(messages.messages.NOTIFY_MISSING_PERMISSIONS)
        .withAskForPermissionsConsentCard(PERMISSIONS.permissions)
        .getResponse();
    }

    // try to retrieve the user name if permissions have been granted
    // catch if no permissions have been granted yet
    try {
      console.log("in try");
      attributes.userName = await api.getAccountInfo(
        system.apiEndpoint,
        system.apiAccessToken,
        "givenName"
      );
    } catch (error) {
      return responseBuilder
        .speak(messages.NO_USERNAME)
        .reprompt(messages.NO_USERNAME)
        .getResponse();
    }
    // set the attributes
    handlerInput.attributesManager.setSessionAttributes(attributes);

    // set the output message
    const welcomeSpeech = `Hi ${
      attributes.userName
    } and welcome to MIRACLE, you can ask for customer information, appointments or predictions as well as recommendations.
    For example, you can say what are my apppointments for today or I need a prediction`;
    const reprompt =
      "You can say what are my apppointments for today or I need a prediction";

    return responseBuilder
      .speak(welcomeSpeech)
      .reprompt(reprompt)
      .getResponse();
  }
};

module.exports.LaunchRequestHandler = LaunchRequestHandler;
