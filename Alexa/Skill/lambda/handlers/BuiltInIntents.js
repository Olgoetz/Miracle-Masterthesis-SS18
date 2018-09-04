/** DEFINE CONSTANTS **/

const messages = require("../assets/constants");

/** OUTPUTMESSAGE IF THE USER NEEDS HELP **/
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speechText = messages.messages.HELP;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

/** FALLBACK IF NO INTENT IS MATCHED **/
const FallBackHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name ===
        "AMAZON.FallbackIntent"
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(messages.messages.HELP)
      .reprompt(messages.messages.HELP)
      .getResponse();
  }
};

/** HANDLE UNMATCHED UTTERANCES **/
const UnhandledIntent = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    const outputSpeech = messages.messages.HELP;
    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .getResponse();
  }
};

/** GOODBYE MESSAGE **/
const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return (
      request.type === "IntentRequest" &&
      (request.intent.name === "AMAZON.CancelIntent" ||
        request.intent.name === "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const goodByeSpeech = "Good bye. Have a nice day.";

    return handlerInput.responseBuilder.speak(goodByeSpeech).getResponse();
  }
};

module.exports.HelpIntentHandler = HelpIntentHandler;
module.exports.ExitHandler = ExitHandler;
module.exports.FallBackHandler = FallBackHandler;
module.exports.UnhandledIntent = UnhandledIntent;
