const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(handlerInput) {
    // format the outpumessage into a string if the sessions has ended
    console.log(
      `Session ended with reason: ${JSON.stringify(
        handlerInput.requestEnvelope.request,
        null,
        4
      )}`
    );

    console.log(handlerInput.requestEnvelope.request);

    return handlerInput.responseBuilder.getResponse();
  }
};

module.exports.SessionEndedRequestHandler = SessionEndedRequestHandler;
