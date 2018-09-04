from flask import Flask, jsonify, request
from flask_pymongo import PyMongo, MongoClient

from sklearn.externals import joblib

# create objebt of the server
app = Flask(__name__)

# configure access rights to the mongodb database
app.config['MONGO_DBNAME'] = "heroku_b03xg8w0"
app.config[
    "MONGO_URI"] = 'mongodb://goliver:Asdfwert7!@ds133876.mlab.com:33876/heroku_b03xg8w0'

# setup a client to make requestst and assgin the database to a variable
client = MongoClient(
    'mongodb://goliver:Asdfwert7!@ds133876.mlab.com:33876/heroku_b03xg8w0')
db = client['heroku_b03xg8w0']

# build the connection between flask and mongodb
mongo = PyMongo(app, config_prefix='MONGO')

testdata = [{'name': 'test', 'items': [{'name': 'itemtest', 'price': 5}]}]

testdata2 = [{'name': 'test2'}]


@app.route('/')
def home():
    return "Welcome to the server"


@app.route('/<string:name>')
def get_test(name):
    return jsonify({'testdata': testdata})


@app.route('/customers', methods=['Get'])
def get_all_customers():
    customers = db.customers
    output = []
    print(customers)
    for c in customers.find():
        output.append({
            'LastName': c['lastName'],
            'FirstName': c['firstName'],
            'Age': c['age'],
            'Income': c['income'],
            'Job': c['job'],
            'Region': c['region'],
            'NextAppointment': c['nextAppointment']
        })
    return jsonify({'result': output})


@app.route('/customer/<lastName>_<firstName>', methods=['Get'])
def get_one_customer(lastName, firstName):
    customer = db.customers
    c = customer.find_one({'lastName': lastName, 'firstName': firstName})
    print(c)
    if c:
        output = {
            'LastName': c['lastName'],
            'FirstName': c['firstName'],
            'Age': c['age'],
            'Income': c['income'],
            'Job': c['job'],
            'Region': c['region'],
            'NextAppointment': c['nextAppointment']
        }
    else:
        output = "No such name"
    return jsonify({'result': output})


@app.route('/prediction', methods=['POST'])
def predict_Value():
    print('I am in prediction mode')
    print(request.json)
    clf = joblib.load('NB.pkl')  # load the classifier
    customer = db.customers
    lastName = request.json['lastName']
    firstName = request.json['firstName']
    c = customer.find_one({'lastName': lastName, 'firstName': firstName})
    predictedValue = clf.predict([[c['age'], c['income']]])
    print('almost at the end')
    return jsonify({'result': str(predictedValue[0])})


@app.route('/recommendation', methods=['POST'])
def recommendProduct():
    print('I am in recommendation mode')
    print('The request in the recommendation mode is: ' + request.json)
    customer = db.customers
    lastName = request.json['lastName']
    firstName = request.json['firstName']
    c = customer.find_one({'lastName': lastName, 'firstName': firstName})


@app.route('/customer', methods=['POST'])
def add_customer():
    customer = db.customers
    lastName = request.json['lastName']
    firstName = request.json['firstName']
    customer_id = customer.insert({
        'lastName': lastName,
        'firstName': firstName
    })
    new_customer = customer.find_one({'_id': customer_id})
    output = {
        'lastName': new_customer['lastName'],
        'firstName': new_customer['firstName']
    }
    return jsonify({'result': output})


if __name__ == '__main__':
    app.run(port=5000, debug=True)
