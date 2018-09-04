# IMPORT FIXTURES AND ASSETS ------------------------------------------------------------------------------

# import numpy librariers
import numpy as np

# initialize the categories as array of size 16
categories = [['1250-1499 €', 1],
              ['5000-5999 €', 10],
              ['2000-2499 €', 4],
              ['3000-3499 €', 6],
              ['750-999 €', 12],
              ['4000-4999 €', 8],
              ['under 500 €', 15],
              ['1500-1749 €', 2],
              ['1750-1999 €', 3],
              ['500-749 €', 9],
              ['1000-1249 €', 0],
              ['2500-2999 €', 5],
              ['7500-9999 €', 13],
              ['6000-7499 €', 11],
              ['3500-3999 €', 7],
              ['above 10000 €', 14]]

# DEFINE THE TRANSFORMATION METHODS ------------------------------------------------------------------------------

# get the income category for a numerical income value


def getCategory(income):

    # iterate over all entries in the categories array
    for index, entry in enumerate(categories):

        # convert entry to a list for further processing
        entry = list(categories[index])
        # convert the first positioned element in entry into a string to enable a comparison
        string = entry[0]

        # handle the two special categories since they contain words
        if string == 'under 500 €':
            value_1 = 0
            value_2 = 500

        elif string == 'above 10000 €':
            value_1 = 10000
            value_2 = value_1 * 10

        # extract the values of each entry, cast them to integers and remove '€'
        else:
            value = string.split(sep='-')
            value_1 = int(value[0])
            value_2 = int(value[1].strip(' €'))

        # perform the compararion, assign the correc category and exit the function
        if (income >= value_1) & (income <= value_2):
            category = entry[1]
            return category


# transform the gender string into a corresponding integer
def getSex(str):
    return 1 if str == 'male' else 0

# build the prediction intance for feeding into the model


def buildPredictionInstance(income, sex, age):

    # make sure that the income is greater than 0
    assert (income > 0), "Income mustn't be below 0"

    # get the categore and the gender
    category = getCategory(income)
    gender = getSex(sex)

    # span an empty array filled with 16 zeros
    arr = np.zeros(16)

    # since the category is an integer it can be used as index
    # the number 1 one must be casted to a float so that the model accepts the input
    arr[category] = float(1)

    # build the final model input array by adding the codified gender and age value
    arr = np.append(arr, [gender, age])
    return arr.reshape(1, -1)


# DEFINE CONSTANTS AND METHODS TO CONDUCHT THE RECOMMENDATION ----------------------------------

antecedants = {
    "0": ["credit card", "giro account"],
    "1": "life insurance",
    "2": "housing saving",
    "3": ["day to day money account", "giro account"],
    "4": ["riester pension", "giro account"]
}

consequents = {
    "0": "day-to-day-money account",
    "1": "housing saving",
    "2": "life insurance",
    "3": "credit card",
    "4": "credit card"
}


# compute the recommendation for an input coming from the database
def recommendation(antecedants=antecedants, consequents=consequents, comparer=None):

    # check if the input is a list
    if isinstance(comparer, list):

        # convert each element in the list to a lower case string
        comparer = [val.lower() for val in comparer]
    else:
        # convert the inpunt value into a lower case string
        comparer = comparer.lower()

    # compare the input value with the antecedants and derive the corresponding consequent
    for key, element in antecedants.items():

        # if the input equals an element of antecedants then return the consequent of the same inde position
        if element == comparer:
            rec = consequents[key]
            return rec


#y = recommendation(comparer='sdaf')
# print(y)


# x = buildPredictionInstance(5247, 'female', 68)
# from sklearn.externals import joblib
# file = 'Housing saving - NB.sav'
# loaded_model = joblib.load(file)
# predictions = loaded_model.predict(x)
# prob = loaded_model.predict_proba(x)
# print(predictions, prob[0])
# print(x)
