# IMPORT FIXTURES AND ASSETS ------------------------------------------------------------------------------

import unittest
import helpers as hp
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.dummy import DummyClassifier
from sklearn.metrics import confusion_matrix, accuracy_score

# CONSTRUCT THE TEST CLASS ------------------------------------------------------------------------------

# define a testclass which inherits from unittest


class TestHelperMethods(unittest.TestCase):

    # for each test case initialize dummy data
    def setUp(self):

        # define training data
        self.train_X = np.random.randint(2, size=10).reshape(1, -1)
        self.train_y = np.random.randint(2, size=10).reshape(1, -1)

        # define test data
        self.test_X = np.random.randint(2, size=3).reshape(1, -1)
        self.test_y = np.random.randint(2, size=3).reshape(1, -1)

        # set dimensions of the test dataframe
        self.a1 = range(4)
        self.a2 = range(4)

        # build a test classifier
        self.classifier = DummyClassifier(strategy="most_frequent")
        self.predictions = np.random.randint(2, size=3)

        # build the test dataframe
        self.dataframe = pd.DataFrame(data=[[self.a1, self.a2]])
        self.dataframe = self.dataframe.fillna(1)

    # if necessary clean up logic is defined here
    def tearDown(self):
        pass

    # tests the correct compuation of a prediction
    def test_compute_prediction(self):
        self.assertEqual(type(hp.computePrediction(
            self.classifier, self.train_X, self.train_y, self.test_X)), np.ndarray)

    # tests the shape and content of a returnen confusion matrix
    def test_compute_confusion_matrix(self):
        self.assertEqual(
            type(hp.computeConfusionMatrix(self.test_y.reshape(-1, 1), self.predictions)), pd.DataFrame)

    # tests if the correct accuracy value is returned
    def test_compute_accuracy(self):
        self.assertEqual(hp.computeAccuracy(self.a1, self.a2), 1)
        self.assertEqual(
            type(hp.computeAccuracy(self.test_X, self.test_y)), np.float64)

    # tests the values of the probabilities
    def test_compute_probabilities(self):
        self.assertEqual(type(hp.computeProbability(
            self.classifier, self.train_X, self.train_y, self.train_X)), list)

    # tests the drawing of the confusion matrix
    def test_draw_confusionMatrix(self):

        self.assertEqual(hp.drawConfusionMatrix(
            self.dataframe, 'Test', {'fontsize': 3, 'fontweight': 100}), plt.fig)


# build the testclasss
if __name__ == "main":
    unittest.main()
