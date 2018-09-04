/*** DEFINE STATE CONSTANTS ***/

// the skill can take to types of states to facilitate a proper routing of the YES-Intent
const states = {
  PREDICTION: "_PREDICTION",
  RECOMMENDATION: "_RECOMMENDATION"
};

// set the state in the application
const getState = function() {
  return states;
};

/*** DEFINE OUTPUTMESSAGES FOR THE PREDICTION INTENT ***/

// define 4 different outputmessages regarding the computed probability
const acceptable = (probability, product) => {
  let message = `The buying probability for ${product} is ${probability} percent which is acceptable. So, I would ask the customer for more background information to underpin my classification.`;
  return message;
};

const good = (probability, product) => {
  let message = `The buying probability is ${probability} percent which is good. After having a good start in the conversation, you should offer our ${product} product.`;
  return message;
};

const high = (probability, product) => {
  let message = `The buying probability is ${probability} percent which is high. This probability accounts for a high interest in the product ${product}.`;
  return message;
};

const very_high = (probability, product) => {
  let message = `The buying probability is ${probability} percent which is very high. Definitely offer our ${product} product.`;
  return message;
};

// set reoccurring messages
const messages = {
  NOTIFY_MISSING_PERMISSIONS:
    "Please enable firstname and email permissions in the Amazon Alexa app and then restart the skill",
  NO_ADDRESS:
    "It looks like you don't have an address set. You can set your address from the companion app.",
  ADDRESS_AVAILABLE: "Here is your full address: ",
  ERROR: "Uh Oh. Looks like something went wrong.",
  NO_USERNAME:
    "You have forgotten to give me permissions to read your first name. Please activate it in the alexa app.",
  GOODBYE: "Bye! Thanks for using the Sample Device Address API Skill!",
  UNHANDLED: "This skill doesn't support that. Please ask something else.",
  NO_CUSTOMER_EXISTS:
    "Sorry, but the customer does not exist. You can start the process again with another id.",
  HELP:
    "You can use this skill by asking something like: What are my appointments for today? Or you say I need customer information, or a prediction or a recommendation",
  STOP: "Bye! Thanks for using the Sample Device Address API Skill!"
};

// set the permissions
const permissions = [
  "alexa::profile:email:read",
  "alexa::profile:given_name:read"
];

// exporting functions, i.e. make them accesible as properties for other modules
module.exports.getState = getState;
module.exports.acceptable = acceptable;
module.exports.good = good;
module.exports.high = high;
module.exports.very_high = very_high;
module.exports.messages = messages;
module.exports.permissions = permissions;
