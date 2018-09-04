/**
 * THIS FILE IS TEST-FRAMEWORK TO TEST ALEXA'S REQUESTS TO THE REST API
 *
 * It utilizes the the async/await construct and has counters for passed and failed tests
 */

const restApi = require("./api");
const mailer = require("./mailer");

let passed = 0;
let failed = 0;

// sequence to test if appointments get properly fetched
async function test_appointmentHelper() {
  await restApi.appointmentHelper.getAppointments().then(
    function(response) {
      let apiResponse = JSON.parse(response);

      console.log(":: APPOINTMENTHELPER - getAppointments ... PASSED");
    },
    function(error) {
      console.log(":: APPOINTMENTHELPER - getAppointments ... FAILED ", error);
    }
  );
  passed += 1;
}

// sequence to test if a customer is correctly returned
async function test_customerHelper() {
  // query a customer by id
  await restApi.customerHelper.getInformationById("12345").then(
    function(response) {
      let apiResponse = JSON.parse(response);

      console.log(":: CUSTOMERHELPER - getInfortmationById ... PASSED");
    },
    function(error) {
      console.log(":: APPOINTMENTHELPER - getAppointments ... FAILED ", error);
    }
  );
  passed += 1;

  // query a customer by name
  await restApi.customerHelper.getInformationbyName("Wick", "Brian").then(
    function(response) {
      let apiResponse = JSON.parse(response);

      if (Object.keys(apiResponse).length === 1) {
        passed += 1;
        console.log(":: CUSTOMERHELPER - getInformationByName ... PASSED");
      } else {
        console.log();
      }
    },
    function(error) {
      console.log(
        ":: APPOINTMENTHELPER - getInformationByName ... FAILED ",
        error
      );
    }
  );
}

// sequence to test prediction and recommendation
async function test_datascienceHelper() {
  // set dummy values for the prediction
  const pred_options = restApi.setPostOptions(
    "prediction",
    (body = { id: "12345", model: "LIFE_INSURANCE" })
  );

  // test the prediction endpoint
  await restApi.datascienceHelper.doPrediction(pred_options).then(
    function(response) {
      let apiResponse = response;
      let x = apiResponse.result["probability"];
      console.log(":: DATASCIENCEHELPER - doPrediction ... PASSED");
      passed += 1;
    },
    function(error) {
      console.log(
        ":: DATASCIENCEHELPER - doPrediction ... FAILED",
        error.message
      );
      failed += 1;
    }
  );

  // test the recommendation endpoint
  await restApi.datascienceHelper.doRecommendation(pred_options).then(
    function(response) {
      let apiResponse = response;
      let x = apiResponse.result["probability"];
      console.log(":: DATASCIENCEHELPER - doRecommendation ... PASSED");
      passed += 1;
    },
    function(error) {
      console.log(
        ":: DATASCIENCEHELPER - doRecommendation ... FAILED",
        error.message
      );
      failed += 1;
    }
  );
}

// sequence to test the mailer
async function test_mailer() {
  // set mailing options
  const mailOptions = mailer.setOptions(
    (from = "goetzoliver89@gmail.com"),
    (to = "goetzoliver89@gmail.com"),
    (subject = "test"),
    (text = "worked")
  );
  await mailer.transporter
    .sendMail(mailOptions)
    .then(mailerResponse => {
      console.log(":: MAILER - sendMail ... PASSED");
      passed += 1;
    })
    .catch(error => {
      console.log(":: MAILER - sendMail ... FAILED", error.message);
      failed += 1;
    });
}

async function test_accountLinking() {
  const base = `https://api.amazonalexa.com`;
  // to get the token open Miracle in the developer test environment
  const token = `yJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJhdWQiOiJodHRwczovL2FwaS5hbWF6b25hbGV4YS5jb20iLCJpc3MiOiJBbGV4YVNraWxsS2l0Iiwic3ViIjoiYW16bjEuYXNrLnNraWxsLmUwY2Q3MjZkLWY1M2MtNDc2OS05NjdjLThjYWNkODg2MmE4MCIsImV4cCI6MTUzNTgyNjk4NSwiaWF0IjoxNTM1ODIzMzg1LCJuYmYiOjE1MzU4MjMzODUsInByaXZhdGVDbGFpbXMiOnsiY29uc2VudFRva2VuIjoiQXR6YXxJd0VCSU1Ea1FtTEhJRmotdWk3MmVBZ2JLLXJtbHlkSTh5YkM1NEx5dnpxcnlNNk1vN05xcjBIejRfSXowMjZwSWYwWG02ZUhNSHdHNHNoWWF6OGlsWk82QTlGS1hlN0lhV3RySGd1bDR4enRGQmhDTFRaek04SjRPcDlIM0JNRmJPY2JMSDFzempSUi1BMi1rRVQ4SVRyQ0Q0Yk42QWwyNERnRnBIel82R3FmNUstWE9jWGxtd2ViZm5CQjlEX1I4T2NZdHdXS3lta3RWLTlsT1hPemRGQnZwR1RuaXNocl91VXZZbFhjcTJuU2VtNkxGYlRpZC1CYmtHUGppdzBuRk5jQzNIM3d2VkxJSHZoMFdiMEtSaVNxeGR6Y0J1ODdnMFQ5VDhZSU5IZXJZTUVZWGRESnF5VC1VaWVaY3NzamNwWlc4RnhQeDdWX1Nfb3QwbHJ1Wk5MODgtWXRqdkd6ZWtveHMteTdUSnlwc2pRYWM4bk4weTltbDFtR0Z3aWZNVmY4VnF4WnlFU1BlOTB4OFFsX2d3bGpmOHZyWW14MHpVN2Q3MW5icUhRdmdHWjNMN05MekRVcDhNQlhBbHdVWDBoYUIxQ09XcGV2OHZ1Wm9iZFlVUWRNVXZOR2hCWUdzLXp5WnFwMk1DUlZEVmNpTHVjVlZRMVpCRWdHbnRST0xhNDdGMUhsdTFSUUYydVU5UTVsNnFpcS15SXZhZXNfaHhVWDI5VDNWRmMxVE92R3p3IiwiZGV2aWNlSWQiOiJhbXpuMS5hc2suZGV2aWNlLkFGVkQ1UFQzN0FTMjNCS0RYTEU2WTJONU9YRUlCRFBESERIV0UyNDI0RkdCNUNGRVZZV0c1WENGNjRWUDJWUldUVkJGWDVVTkg1R1g0NVNUUDRKM1dKRTcyNFFNUk1TS0hTNjZZSlJHM0hPTTZWM09ZS0wyNDdIRVpHNEI0VEpGQTI1WjRFM0s1WUVKVE5EQ0VCNUpLSFQyR0tKWVEyUlU1U1NQQUZNQk5NWFdBWk9IQ0ZHMzIiLCJ1c2VySWQiOiJhbXpuMS5hc2suYWNjb3VudC5BSDc3SUwyUzZSMkU0V0JPQlVPRVhaQ0RKQk5VQjVPQlRQTUxGTFVWVVBKQ1dHUElGVDdYN0U3QktTRzZMVjZOSUxCS1Y2NlMyWFFWSkJPR0ZORlBPTlc1T1JaR1dFV1NVRTc0WVg3WktDNEI0S01PU1BUQ0VOVElGSTdNS0dCVk9aQ1VON0UySFFCVUdGUjJNRTcyUVpUNVFPR0lBQ042RVBEVEZFVFFQN1FPUFk2UURCSFI1TEtOVVo3Nk82T1hOUTdFT1BYQVQyN05JNEkifX0.Foywok3OQU0hvMaoI0d1nkLnVsIn7f3_XXaKOgsOgQg4y5XLuzFyuOeHG0diyOk18pG7m9pNXYdjonKUcy1EuBtlMELDBhnVTvZ6HpEbW4PFG3176qZA-Meh1s4ADZ1FIy6G_q1IrdZk6kwlyWp0-Hc3vcmljl7br2ZaKjC2DkJhfKQuV--MUrdbBujg5him_U1knE99MikfAV_FwxDTzNrH-RzHugGSO91VYL_AYUNeXELcM11hJqUB2d9Q4ZTDsGjdvS4_Z0L7U4H52GygybpqBQ5wEM7XIeThS3aoBaxdEDbqTHAkSTUkP3VlCTA1-9DxbVxFaMEgr7NQ1Celzg`;

  try {
    let res;
    res = await restApi.getAccountInfo(base, token, "givenName");

    if (res !== undefined) {
      passed = passed + 1;
    } else {
      failed = failed + 1;
    }
    console.log(res);
    return res;
  } catch (error) {
    console.log("Failed", error.error);
  }
}

// output summary of the test procedures to the console
async function outputter() {
  console.log("Alexa unit tests started: ");
  console.time(" Tests finished after: ");
  await test_appointmentHelper();
  await test_customerHelper();
  await test_datascienceHelper();
  await test_mailer();
  await test_accountLinking();
  console.log("----------------------------------------");
  console.log(" The number of passed tests is: ", passed);
  console.log(" The number of failed tests is: ", failed);
  console.timeEnd(" Tests finished after: ");
  console.log("----------------------------------------");
}

outputter();
