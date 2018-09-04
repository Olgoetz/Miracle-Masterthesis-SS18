import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.metrics import confusion_matrix, accuracy_score

# compute predictions for the trainingdata


def computePrediction(classifier, input_TrainingData, output_TrainingData, input_TestData):

    # assign input values to the classifier
    classifier.fit(input_TrainingData, output_TrainingData)

    # classify testdata
    predictions = classifier.predict(input_TestData)

    return predictions


# compute the confusion matrix for a classifier
def computeConfusionMatrix(output_TestData, predictions):

    # compute the confusion matrix
    cm = confusion_matrix(output_TestData, predictions)

    # format the confusion matrix into a DataFrame object
    df = pd.DataFrame(cm,  index=['no', 'yes'], columns=['no', 'yes'])
    return df


# compute the accuray for a classifier
def computeAccuracy(output_True, predictions):
    score = accuracy_score(output_True, predictions)
    return score


# compute probabilities of the predictions
def computeProbability(classifier, input_TrainingData, output_TrainingData, input_TestData):

    classifier.fit(input_TrainingData, output_TrainingData)

    # check if a classifier has 'decision function' attribute. Depending on the result, choose the proper method
    if hasattr(classifier, "decision function"):
        probabilities = classifier.decision_function(input_TestData)
    else:
        probabilities = classifier.predict_proba(input_TestData)

    return probabilities

# draw a confusion matrix


def drawConfusionMatrix(dataframe, name, styleDics, cmap):

    # initzilize a canvas to draw on
    fig, ax = plt.subplots()

    # use seaborn to draw a heatmap
    cmap = sns.dark_palette("purple", as_cmap=True)
    sns.heatmap(dataframe, annot=True, ax=ax, cmap=cmap)

    # add title
    ax.set_title(name, fontdict={
                 'fontsize': styleDics[0]['title'], 'fontweight': styleDics[1]['title']})

    # assign labels to the axis
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
