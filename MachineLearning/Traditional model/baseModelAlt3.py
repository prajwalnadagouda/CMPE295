
from sklearn import linear_model
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn import metrics 
from math import sqrt
import matplotlib.pyplot as plt


fulldata=pd.read_csv("2001.csv")
fulldata['Date']=pd.to_datetime(fulldata['Date'])
y=fulldata['BusCommuters']
x=fulldata.drop(["BusCommuters","Date"],axis="columns")
x=fulldata['DayOfWeek'].to_frame()
x_train, x_test, y_train, y_test = train_test_split(x, y)
x_train, x_test, y_train, y_test = x[:len(x)-28],x[-28:],y[:len(x)-28],y[-28:]

clf = linear_model.Lasso(alpha=0.1)
clf.fit(x_train, y_train) 

y_pred = clf.predict(x_test) 

print("Lasso model accuracy(variance):", sqrt(metrics.mean_absolute_percentage_error(y_test, y_pred)))

y_pred_train = clf.predict(x_train)
y_pred_test = clf.predict(x_test)

plt.figure(figsize=(14, 7))

plt.subplot(1, 2, 1)
plt.scatter(y_train, y_pred_train, alpha=0.5, color='blue', label='Train')
plt.plot([y_train.min(), y_train.max()], [y_train.min(), y_train.max()], 'k--', lw=2)
plt.xlabel('Actual')
plt.ylabel('Predicted')
plt.title('Training Data: Actual vs Predicted')
plt.legend()

plt.subplot(1, 2, 2)
plt.scatter(y_test, y_pred_test, alpha=0.5, color='red', label='Test')
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'k--', lw=2)
plt.xlabel('Actual')
plt.ylabel('Predicted')
plt.title('Test Data: Actual vs Predicted')
plt.legend()

plt.show()



plt.figure(figsize=(7, 7))
plt.scatter(y_test, y_pred_test, alpha=0.5, color='red', label='Test')
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'k--', lw=2)
plt.xlabel('Actual')
plt.ylabel('Predicted')
plt.title('Lasso - Test Data: Actual vs Predicted')
plt.legend()
plt.show()
