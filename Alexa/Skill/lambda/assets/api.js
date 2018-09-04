/*** IMPORT FIXTURES AND ASSETS ***/
// import the libary request-promise to make http requests and resolve promises
const rp = require("request-promise");

// define the base endpoint url where the server can be reached
BASE_URL = "https://miracle-masterthesis.herokuapp.com";

/*** FUNCTIONS TO PERFORM GET AND POST HTTP REQUESTS ***/

/* PROVIDING THE APPOINTMENTS ENDPOINT */

const appointmentHelper = {
  // add a request promise property to the object
  getAppointments() {
    return rp(`${BASE_URL}/appointments`);
  }
};

/* PROVIDING THE CUSTOMER INFORMATION ENDPOINTs */

const customerHelper = {
  // add a request promise property to the object. The id determines the customer that
  // is be queried
  getInformationById(id) {
    let url = `${BASE_URL}/customer_byId/${id}`;
    console.log("The URL is: ", url);
    return rp(url);
  },

  getInformationbyName(lastname, firstname) {
    let url = `${BASE_URL}/customer_byName/${lastname}_${firstname}`;
    return rp(url);
  }
};

/*** PROVIDING THE DATASCIENCE ENDPOINTs ***/

const datascienceHelper = {
  // add a request promise property to the object. The id is being sent to the server and a prediction
  // is being conducted

  doPrediction(options) {
    return rp(options);
  },

  doRecommendation(options) {
    return rp(options);
  }
};

function setPostOptions(endpoint, body) {
  const options = {
    method: "POST",
    uri: `${BASE_URL}/${endpoint}`,
    body: body,
    json: true
  };
  return options;
}

/*** READ OUT USER INFORMATION ***/

const getAccountInfo = (endpoint, token, attr) => {
  const options = {
    uri: `${endpoint}/v2/accounts/~current/settings/Profile.${attr}`,
    auth: {
      bearer: token
    },
    headers: {
      "Content-Type": "application/json"
    },
    json: true // Automatically parses the JSON string in the response
  };
  const result = rp(options);
  console.log(result);
  return result;
};

// exporting functions, i.e. make them accesible as properties for other modules
module.exports.appointmentHelper = appointmentHelper;
module.exports.customerHelper = customerHelper;
module.exports.datascienceHelper = datascienceHelper;
module.exports.setPostOptions = setPostOptions;
module.exports.getAccountInfo = getAccountInfo;
