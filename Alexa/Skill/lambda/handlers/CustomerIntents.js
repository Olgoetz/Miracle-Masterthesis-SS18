/*** Importing the api and  ***/
const customerData = require("../assets/api");
const rank = require("../assets/ranks");
const messages = require("../assets/constants");

/*** GET ALL APPOINTMENTS FROM TODAY ***/
// A handler to retrieve todays appointments
const GetAppointmentsIntent = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name ===
        "GetAppointmentsIntent"
    );
  },
  async handle(handlerInput) {
    console.log("In GETAPPOINTSMENT INTENT");
    let outputMessage = "";

    // Waiting the response of the api call
    await customerData.appointmentHelper
      .getAppointments()
      .then(function(responseContent) {
        // Transforming the result into a json object enabling an easy iterating
        let respObject = JSON.parse(responseContent);
        let totalAppointments = 0;

        // Getting all customer appointments that have a valid date
        respObject.result.forEach(customer => {
          customer.NextAppointment !== "not today"
            ? (totalAppointments += 1)
            : (totalAppointments += 0);
        });

        // Adjusting the outputmessage depending on the number of appontments
        let amount = "";
        totalAppointments === 1
          ? (amount = "appointment")
          : (amount = "appointments");
        outputMessage = `You have ${totalAppointments} ${amount} today. `;

        // Defining varaibles to control the upcoming loop
        let counter = 1;
        let appointments = "";

        // Building the final output message
        for (let customer of respObject.result) {
          appointments = `The ${rank.getRank()[counter]} appointment is with ${
            customer.FirstName
          } ${customer.LastName} at ${customer.NextAppointment}. `;
          outputMessage += appointments;
          counter++;
          // If the counter exceeds the total appointments, the function is left
          // to ensure the right number of appointments are beining sent back
          if (counter > totalAppointments) {
            break;
          }
        }
      });

    // Executing the responsbuilder to send the message to the alexa service
    return handlerInput.responseBuilder
      .speak(outputMessage)
      .reprompt(outputMessage)
      .getResponse();
  }
};

/*** GET INFORMATION ABOUT A CUSTOMER  ***/
// function to delegate the information back to Alexa if there a still empty slot slots
const InProgress_GetCustomerInformationIntent = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name ===
        "GetCustomerInformationIntent" &&
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

// function if dialogstate has been completed
const Completed_GetCustomerInformationIntent = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name ===
        "GetCustomerInformationIntent" &&
      handlerInput.requestEnvelope.request.dialogState === "COMPLETED"
    );
  },
  async handle(handlerInput) {
    // define a constant to improve readability for later reference
    const slots = handlerInput.requestEnvelope.request.intent.slots;

    console.log("In completed : ", slots);
    // get the customer id of the slot
    let customer_id = slots.CustomerID;
    customer_id = customer_id.value.toString();
    console.log(customer_id);

    try {
      console.log("In TRY of CUSTOMERINTENT");
      let responseContent = await customerData.customerHelper.getInformationById(
        customer_id
      );

      // parse the response
      response = JSON.parse(responseContent);
      response = response.customer;
      console.log(response);

      // define the gender
      let gender = "";
      response.Sex === "male" ? (gender = "He") : (gender = "She");

      // build the products partial message
      let products = partialMessage(response.Products);
      // build the outputmessage
      const outputMessage = `The customer is ${response.FirstName} ${
        response.LastName
      }. ${gender} is ${response.Age} years, 
      has an income of ${response.Income} Euro. ${gender} posses ${products}`;
      console.log("Output Message built");
      // wait for the response
      return handlerInput.responseBuilder
        .speak(outputMessage)
        .reprompt(outputMessage)
        .getResponse();
    } catch (error) {
      console.log(error);
      return handlerInput.responseBuilder
        .speak(messages.messages.NO_CUSTOMER_EXISTS)
        .reprompt(messages.messages.NO_CUSTOMER_EXISTS)
        .getResponse();
    }
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
    if (counter === resp.length) {
      console.log("in control flow length: ", products);
      products = products + `${temp}`;
    }
    console.log("The products are: ", products);
    counter++;
  });
  return products;
}

// Exporting the intents to make them available in the index.js
module.exports.GetAppointmentsIntent = GetAppointmentsIntent;
module.exports.InProgress_GetCustomerInformationIntent = InProgress_GetCustomerInformationIntent;
module.exports.Completed_GetCustomerInformationIntent = Completed_GetCustomerInformationIntent;
