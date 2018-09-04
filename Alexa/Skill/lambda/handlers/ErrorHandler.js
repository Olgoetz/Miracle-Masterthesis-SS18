// if any error occurs this handler is fired and the user gets further instructions
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(
      `Original Request was: ${JSON.stringify(
        handlerInput.requestEnvelope.request,
        null,
        2
      )}`
    );
    let _error = JSON.stringify(error);
    console.log(_error);
    console.log(`Error handled: ${error}`);

    const outputSpeech =
      "Sorry, something went wrong. Please start again the process you just asked for";

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .getResponse();
  }
};

module.exports.ErrorHandler = ErrorHandler;
