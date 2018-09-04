/* IMPORTANT CONSTANTS */

const GetState = require("../assets/constants");
const api = require("../assets/api");
const mailer = require("../assets/mailer");

const PERMISSIONS = require("../assets/constants");
const messages = require("../assets/constants");

/* SKILL LOGIC TO HANDLE PREDICTION INTENTS */

/*** HANDLE THE BEHAVIOUR IF THE DIALOG HAS NOT BEEN COMPLETED YET ***/
const InProgress_RecommendationIntent = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name ===
        "RecommendationIntent" &&
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
const Completed_RecommendationIntent = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name ===
        "RecommendationIntent" &&
      handlerInput.requestEnvelope.request.dialogState === "COMPLETED"
    );
  },

  // asynchronous call enables to call the REST Api, i.e. the server as well as database
  async handle(handlerInput) {
    console.log("INSIDE - RECOMMENDATION HANDLER");

    // define constants
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    console.log("The slots are: ", slots);
    console.log("The attributes are: ", attributes);

    // get the current state attribute
    attributes.state = GetState.getState().RECOMMENDATION;
    console.log("The state is: ", attributes.state);

    // set the attributes
    handlerInput.attributesManager.setSessionAttributes(attributes);

    // initialize the outputmessage as empty string
    let outputmessage = "";

    // get the customer id of the slot
    let customer_id = slots.CustomerID;
    customer_id = customer_id.value.toString();

    // get the user name from the database
    let _firstName = "";
    let _lastName = "";
    let response;
    try {
      // wait the for the customer
      await api.customerHelper
        .getInformationById(customer_id)
        .then(function(responseContent) {
          response = JSON.parse(responseContent);
          response = response.customer;
          console.log(responseContent);
          console.log("Inside customerHelper:", response);

          // assign the firstname and lastname to a temporary variable
          _firstName = response.FirstName;
          _lastName = response.LastName;
        });
    } catch (error) {
      // build an appropriate outputmessage if the user does not exist
      console.log("no customer: ", error);
      return handlerInput.responseBuilder
        .speak(messages.messages.NO_CUSTOMER_EXISTS)
        .reprompt(messages.messages.NO_CUSTOMER_EXIST)
        .getResponse();
    }

    // define the gender at adjust variables
    let gender = "";
    let gender_2 = "";
    response.Sex === "male" ? (gender = "He") : (gender = "She");
    response.Sex === "male" ? (gender_2 = "him") : (gender_2 = "her");

    // build a partial outputmessage regarding the products the customer owns
    let products = partialMessage(response.Products);

    // set the payload for the POST request in doPrediction
    const options = api.setPostOptions(
      "recommendation",
      (body = { id: customer_id })
    );

    // get the result for the recommendation and build a corresponding outputmessage
    let recommendation;
    await api.datascienceHelper.doRecommendation(options).then(
      function(responseContent) {
        // get the recommendation and inject it into the outputmessage
        recommendation = responseContent.result.recommendation;
        console.log("The recommendation is: ", recommendation);
        outputmessage = `The customer with <say-as interpret-as="characters">${customer_id}</say-as> is ${_firstName} ${_lastName}. ${gender} posses ${products}.
        Based on my knowlege I recommend offering ${gender_2} our ${recommendation} product. Do you want to receive an email with this information?`;
      },
      function(error) {
        console.log("Error for wrong id: ", error);
        outputmessage = `I am sorry. At the moment, for this customer I cannot recommend anything since I do not have enough data for the moment.
        Please start again the process with I need a recommendation and choose another customer id.`;
      }
    );

    // assign variables to session attributes
    attributes.customer_id = customer_id;
    attributes.firstName = _firstName;
    attributes.lastName = _lastName;
    attributes.result = recommendation;

    // set the attributes
    handlerInput.attributesManager.setSessionAttributes(attributes);

    return handlerInput.responseBuilder
      .speak(outputmessage)
      .reprompt(outputmessage)
      .getResponse();
  }
};

/*** HANDLE THE YES ANSWER  ***/
// this intent is only fired when the state is _Recommendation
const YesIntent_Recommendation = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    return (
      request.type === "IntentRequest" &&
      request.intent.name === "AMAZON.YesIntent" &&
      attributes.state === "_RECOMMENDATION"
    );
  },
  async handle(handlerInput) {
    const { requestEnvelope, responseBuilder } = handlerInput;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    console.log("INSIDE RECOMMENDATION YES INTENT");
    // check if permissions are available for email reading
    const consentToken =
      requestEnvelope.context.System.user.permissions &&
      requestEnvelope.context.System.user.permissions.consentToken;
    if (!consentToken) {
      return responseBuilder
        .speak(messages.message.NOTIFY_MISSING_PERMISSIONS)
        .withAskForPermissionsConsentCard(PERMISSIONS.permissions)
        .getResponse();
    }

    // get the email adress from the account
    let email;
    try {
      const system = requestEnvelope.context.System;
      // wait for the email adress
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

    // send the outputmessage to the alexa serivce
    return handlerInput.responseBuilder
      .speak(outputmessage)
      .reprompt(outputmessage)
      .getResponse();
  }
};

/*** HANDLE THE NO ANSWER  ***/

// this intent is only fired when the state is _RECOMMENDATION
const NoIntent_Recommendation = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    return (
      request.type === "IntentRequest" &&
      request.intent.name === "AMAZON.NoIntent" &&
      attributes.state === "_RECOMMENDATION"
    );
  },
  handle(handlerInput) {
    console.log("In NO-Handler: ", handlerInput);

    // build an adequate outputmessage and send it to the alexa service
    let outputmessage = "Ok. What else can I do for you?";
    return handlerInput.responseBuilder
      .speak(outputmessage)
      .reprompt(outputmessage)
      .getResponse();
  }
};

/*** HELPER TO BUILD PARTIAL MESSAGE FOR PRODUCTS ***/

// the function returns a message corresponding to the number of products of a customer
function partialMessage(resp) {
  let products = "";
  let temp = "";
  let counter = 1;

  // run through the products list
  resp.forEach(prod => {
    console.log(prod);
    // if there is only one product then exist the loop
    if (resp.length === 1) {
      products = prod;
      return products;
    } else {
      temp = prod;
    }

    // concatenate the message with 'and' as long as there is an item in the products list
    if (counter !== resp.length) {
      console.log("in control flow not length: ", products);

      products = products + `${temp} and `;
    }

    // if the counter equals the array length then adjust the outputmessage accordingly
    if (counter === resp.length) {
      console.log("in control flow length: ", products);
      products = products + `${temp}`;
    }
    console.log("The products are: ", products);
    counter++;
  });
  return products;
}

/* EXPORT THE FUNCTIONS AS CONTANTS TO USE THEM IN THE INDEX.JS */

module.exports.InProgess_RecommendationIntent = InProgress_RecommendationIntent;
module.exports.Completed_RecommendationIntent = Completed_RecommendationIntent;
module.exports.YesIntent_Recommendation = YesIntent_Recommendation;
module.exports.NoIntent_Recommendation = NoIntent_Recommendation;
