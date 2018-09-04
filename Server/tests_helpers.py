# IMPORT FIXTURES AND ASSETS ------------------------------------------------------------------------------

# import the flask app for testing
import helpers as hp

# import a unittest library
import unittest

# CONSTRUCT THE TEST CASES ------------------------------------------------------------------------------

# define a testclass which inherits from unittest


class HelpersTestCase(unittest.TestCase):

    # the code in here is executed prior each test case
    def setUp(self):
        self.income_1 = 1500
        self.income_2 = 0
        self.sex_1 = 'female'
        self.sex_2 = 'male'
        self.age = 55
        self.dict_1 = {"0": "val_1", "1": "val_2"}
        self.dict_2 = {"0": "corres_val_1", "1": "corres_val_2"}
        self.comparer = "val_2"

    # this function contains clean up logic after each test case
    def tearDown(self):
        pass

    def test_getCategory(self):
        self.assertEqual(hp.getCategory(self.income_1), 2)
        self.assertEqual(hp.getCategory(self.income_2), 15)

    def test_getSex(self):
        self.assertEqual(hp.getSex(self.sex_1), 0)
        self.assertEqual(hp.getSex(self.sex_2), 1)

    def test_buildPredictionInstance(self):

        # array size must be 18 because the first 16 digits represent the normalized income subvector
        # and the 17th and 18th are reserved for sex respectively age
        self.assertEqual(
            hp.buildPredictionInstance(self.income_1, self.sex_1,
                                       self.age).size, 18)

    def test_recommendation(self):

        # function must return corres_val_2 since comparer=val_2 which has in dict_1 key 1
        self.assertEqual(
            hp.recommendation(self.dict_1, self.dict_2, self.comparer), "corres_val_2")


# BUILD THE UNITTEST CLASS ------------------------------------------------------------------------------


if __name__ == '__main__':
    unittest.main()
