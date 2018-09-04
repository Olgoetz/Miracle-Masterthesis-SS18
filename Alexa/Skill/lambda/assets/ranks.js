/**
 * DEFINE RANKS TO BUILD A NICE OUTPUTMESSAGE FOR THE APPOINTMENTS
 */

// define ranks for linguistic output
const ranks = {
  1: "first",
  2: "second",
  3: "third",
  4: "fourth",
  5: "fifth",
  6: "sixt",
  7: "seventh",
  8: "eight",
  9: "ninth",
  10: "tenth"
};

// get the rank
const getRank = function() {
  return ranks;
};

// exporting functions, i.e. make them accesible as properties for other modules
module.exports.getRank = getRank;
