# IMPORT FIXTURES AND ASSETS ------------------------------------------------------------------------------

# import the flask app for testing
import app

# import a unittest library
import unittest

# import a helpter to process json formatted data
import json

# import the mongodb connection tools
from flask_pymongo import PyMongo, MongoClient

# CONSTRUCT THE TEST CASES --------------------------------------------------------------------------------


# define a testclass which inherits from unittest
class AppTestCase(unittest.TestCase):

    # the code in here is executed prior each test case
    def setUp(self):

        # setup a test client
        app.app.testing = True
        self.app = app.app.test_client()

        # configure access rights to the mongodb testdatabase
        app.app.config['MONGO_DBNAME'] = "testdatabase"
        app.app.config[
            "MONGO_URI"] = 'mongodb://test:Asdfwert7!@ds237770.mlab.com:37770/testdatabase'

        # configure connection to the testdatabase
        app.client = MongoClient(
            'mongodb://test:Asdfwert7!@ds237770.mlab.com:37770/testdatabase')
        app.db = app.client['testdatabase']

        app.db.drop_collection('customers')
        # create a test collection called 'customers'
        app.db.create_collection('customers')
        customers = app.db.get_collection('customers')

        # insert test customers
        customers.insert_one(
            insertCustomer('12345', 'Krueger', 'Freddy', 63, 2000, '9:30'))
        customers.insert_one(
            insertCustomer('56789', 'Vorhees', 'Jason', 45, 9000, '12:00'))

    # this function contains clean up logic after each test case
    def tearDown(self):

        # drop the 'customers' collection and release ressources
        app.db.drop_collection('customers')
        app.client.close()

        # test the server start up
    def test_server_startup(self):
        request = self.app.get('/')
        self.assertEqual(request.data, b'"Server is running"\n')
        self.assertEqual(request.status_code, 200)

    # test the '/customers' endpoint
    def test_get_allCustomers(self):
        d = self.app.get('/customers')
        data = json.loads(d.data)

        # test if exact two customers are sent back because two are initialized
        self.assertEqual(d.status_code, 200)
        self.assertEqual(len(data['result']), 2)

    # test the '/customer/<string:lastName>_<string:firstName>
    def test_get_customer_byName(self):
        d = self.app.get('/customer_byName/Krueger_Freddy')
        data = json.loads(d.data)

        # test if the correct names are sent back
        self.assertEqual(data['customer']['LastName'], 'Krueger')
        self.assertEqual(data['customer']['FirstName'], 'Freddy')
        self.assertEqual(d.status_code, 200)

    # test the '/customer/<string:customer_id' endpoint
    def test_get_customer_byId(self):
        d = self.app.get('/customer_byId/12345')
        data = json.loads(d.data)

        # test if the corret id is sent back
        self.assertEqual(data['customer']['Customer_Id'], '12345')
        self.assertEqual(d.status_code, 200)

    # test an endpoint if neither names nor an id exisits
    def test_errorMessage_noCustomer(self):
        d1 = self.app.get('/customer_byName/Meyers_Michael')
        d2 = self.app.get('/customer_byId/00123')

        # test if an error code is provided when a customer does not exist
        self.assertEqual(d1.status_code, 404)
        self.assertEqual(d2.status_code, 404)

    # test the '/custsomer


# HELPER METHODS -------------------------------------------------------------------------------


# define a function to insert a test customer into the testdatabase
def insertCustomer(customer_id, lastname, firstname, age, income,
                   nextAppointment):
    customer = {
        'customer_id': customer_id,
        'lastName': lastname,
        'firstName': firstname,
        'age': age,
        'income': income,
        'nextAppointment': nextAppointment
    }
    return customer


# BUILD THE UNITTEST CLASS -----------------------------------------------------------------------

if __name__ == '__main__':
    unittest.main()
