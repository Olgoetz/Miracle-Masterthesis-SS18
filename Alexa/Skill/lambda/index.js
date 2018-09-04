"use strict";

/* The index.js represents the lambda function and 
handles the routes to the different handlers/intents accordingly. */

// Import handlers that are necessary to start the skill
const LaunchRequestHandler = require("./handlers/LaunchRequestHandler");
const SessionEndedRequestHandler = require("./handlers/SessionEndedRequestHandler");
const ErrorHandler = require("./handlers/ErrorHandler");

// Import custom handlers to fullfill special use cases
const BuiltInIntents = require("./handlers/BuiltInIntents");
const CustomerIntents = require("./handlers/CustomerIntents");
const PredictionIntent = require("./handlers/PredictionIntent");
const RecommendationIntent = require("./handlers/RecommendationIntent");

// Import the core alexa module
const Alexa = require("ask-sdk");

const AWS = require("aws-sdk");
AWS.config.logger = console;

// Export of all handlers
const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler.LaunchRequestHandler,
    CustomerIntents.GetAppointmentsIntent,
    CustomerIntents.InProgress_GetCustomerInformationIntent,
    CustomerIntents.Completed_GetCustomerInformationIntent,
    PredictionIntent.InProgess_PredictionIntent,
    PredictionIntent.Completed_PredictionIntent,
    PredictionIntent.YesIntent_Prediction,
    PredictionIntent.NoIntent_Prediction,
    RecommendationIntent.InProgess_RecommendationIntent,
    RecommendationIntent.Completed_RecommendationIntent,
    RecommendationIntent.YesIntent_Recommendation,
    RecommendationIntent.NoIntent_Recommendation,
    BuiltInIntents.HelpIntentHandler,
    BuiltInIntents.ExitHandler,
    BuiltInIntents.FallBackHandler,
    BuiltInIntents.UnhandledIntent,
    SessionEndedRequestHandler.SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler.ErrorHandler)
  .lambda();
