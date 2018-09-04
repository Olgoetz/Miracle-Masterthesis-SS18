# IMPORT LIBRARIERS ------------------------------------------------------------------------------

# import the flask, the databasce connection driver as well as the api layer
from flask import Flask, request
from flask_pymongo import PyMongo, MongoClient
from flask_restful import Resource, Api

# import numpy to modify data
import numpy as np

# import scikit to load datamodels
from sklearn.externals import joblib

# import helpers
import helpers


# CONFIGURE THE APPLICATION -----------------------------------------------------------------------

# define the app(lication) to pass to the run method
app = Flask(__name__)

# connect the app the api layer from flask_restful
api = Api(app)

# configure access rights to the mongodb database
app.config['MONGO_DBNAME'] = "heroku_b03xg8w0"
app.config[
    "MONGO_URI"] = 'mongodb://goliver:Asdfwert7!@ds133876.mlab.com:33876/heroku_b03xg8w0'

# setup a client to make requestst and assgin the database to a variable
client = MongoClient(
    'mongodb://goliver:Asdfwert7!@ds133876.mlab.com:33876/heroku_b03xg8w0')
db = client['heroku_b03xg8w0']

# DEFINE LOGIC OF THE ENDPOINTS --------------------------------------------------------------------


# define the home adress with neither GET nor POST requests
# Endpoint: /https:/miracle-masterthesis.herokuapp.com/
class StartUp(Resource):
    def get(self):
        return "Server is running", 200


# defne the endpoint to obtain all appointments stored in the database
# Endpoint: https://miracle-masterthesis.herokuapp.com/appointments
class Appointments(Resource):
    def get(self):

        # connect to the database
        customers = db.customers

        # define an empty array as temporary data store
        output = []

        # iterate over all found customer instances and assign the values to corresponding keys
        for c in customers.find():
            output.append({
                'LastName': c['lastName'],
                'FirstName': c['firstName'],
                'Age': c['age'],
                'Income': c['income'],
                'NextAppointment': c['nextAppointment']
            })

        # test if there are customer instances in the database
        if output:

            # return the ouput in JSON format together with a correct status code
            return {'result': output}, 200
        else:

            # return an error message in JSON format together with a correct status code
            return {'message': 'There are no customers in the database'}, 404


# defne the endpoint to obtain a customer by its lastname and forename
# Endpoint: https://miracle-masterthesis.herokuapp.com/customer_byName/<string:lastName>_<string:firstName>
class Customer_byName(Resource):
    def get(self, lastName, firstName):

        # connect to the database
        customer = db.customers

        # look for the requested customer
        customer_byName = customer.find_one({
            'lastName': lastName,
            'firstName': firstName
        })

        # test if the requested customer exists
        if customer_byName:
            return outputCustomer(customer_byName)
        else:
            return errorMessage_noCustomer()


# defne the endpoint to obtain a customer by its ID
# Endpoint: https://miracle-masterthesis.herokuapp.com/<string:customer_id>
class Customer_byId(Resource):
    def get(self, customer_Id):

        # connect to the database
        customer = db.customers

        # look for the requested customer
        customer_byId = customer.find_one({'customer_id': str(customer_Id)})

        # test if the requested customer exists
        if customer_byId:
            return outputCustomer(customer_byId)
        else:
            return errorMessage_noCustomer()


# ONLY BY ID because it is easier to process
# Endpoint: https://miracle-masterthesis.herokuapp.com/prediction/<string:customer_id>
class Prediction(Resource):
    def post(self):

        json_data = request.get_json(force=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        print(json_data)
        model = json_data['model']
        # read the requested data
        if model == 'LIFE_INSURANCE':
            model = joblib.load('Life insurance - DT.sav')
        elif model == 'DAY_TO-DAY_MONEY ACCOUNT':
            model = joblib.load('Day-to-day money account - SVM.sav')
        elif model == 'HOUSING_SAVING':
            model = joblib.load('Housing saving - NB.sav')
        else:
            return {'message': 'Such model exists'}, 404

        # connect to the database
        customer = db.customers
        print('The model is :', model)
        customer_id = request.json['id']
        c = customer.find_one({'customer_id': customer_id})
        income = c['income']
        age = c['age']
        sex = c['sex']
        predictionInstance = helpers.buildPredictionInstance(
            income, sex, age)
        print(predictionInstance)

        # classify the instance, i.e. it is either 0 (no) or 1 (yes)
        predictedValue = model.predict(predictionInstance)

        # predict the probability of 0 and 1
        predictedProbability = model.predict_proba(predictionInstance)

        # cast the values from numpy to normal python datatypes to faciliate a correct json objec of the result
        predictedValue = int(predictedValue)

        # round the values within the numpy array to two decimals
        predictedProbability = np.around(predictedProbability, decimals=2)

        # convert the numpy array to a normal python array
        predictedProbability = predictedProbability.tolist()

        return {'result': {'classification': predictedValue, 'probability': predictedProbability[0]}}

# ONLY BY ID because it is easier to process
# Endpoint: https://miracle-masterthesis.herokuapp.com/recommendation/<string:customer_id>


class Recommendation(Resource):
    def post(self):

        json_data = request.get_json(force=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400

        # connect to the database
        customer = db.customers
        customer_id = request.json['id']
        print(customer_id)
        c = customer.find_one({'customer_id': customer_id})
        products = c['products']

        # get the recommendations
        rec = helpers.recommendation(comparer=products)
        print('The recommendation is: ', rec)
        if rec == None:
            return {'message': 'No rule available to make a recommendation'}, 404

        return {'result': {'recommendation': rec}}


# DEFINE THE RESTAPI ENDPOINTS -------------------------------------------------------------------------------


# add the resourcesll/routes to the api with endpoint name
api.add_resource(Customer_byName,
                 '/customer_byName/<string:lastName>_<string:firstName>')
api.add_resource(Customer_byId, '/customer_byId/<string:customer_Id>')
api.add_resource(StartUp, '/', '/server')
api.add_resource(Appointments, '/appointments')
api.add_resource(Prediction, '/prediction')
api.add_resource(Recommendation, '/recommendation')


# HELPER METHODS -------------------------------------------------------------------------------


# look for a customer in the database and assign values to corresponding keys and a correct status code
def outputCustomer(c):
    output = {
        'Customer_Id': c['customer_id'],
        'LastName': c['lastName'],
        'FirstName': c['firstName'],
        'Sex': c['sex'],
        'Age': c['age'],
        'Income': c['income'],
        'Products': c['products'],
        'NextAppointment': c['nextAppointment']
    }
    print('The customer is:', output)
    return {'customer': output}, 200


# look for a customer in the database by providing the name
def findCustomerbyName(database, lastName, firstName):
    c = database.find_one({'LastName': lastName, 'FirstName': firstName})
    if c:
        return c
    else:
        errorMessage_noCustomer()

# look for a customer in the database by providing an id


def findCustomerbyId(database, id):
    c = database.find_one({'customer_id': id})
    if c:
        return c
    else:
        errorMessage_noCustomer()


# define an error message if customer does not exists with a correct status code
def errorMessage_noCustomer():
    return {'message': 'Such a customer does not exits'}, 404


# BUILD THE APP ------------------------------------------------------------------------------

if __name__ == '__main__':
    app.run(debug=False)
