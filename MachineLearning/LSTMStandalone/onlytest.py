import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt
from math import sqrt
from datetime import datetime,timedelta
from sklearn import metrics 



class LSTM(nn.Module):
    def __init__(self, input_size=1, hidden_layer_size=100, output_size=1):
        super().__init__()
        self.hidden_layer_size = hidden_layer_size

        self.lstm = nn.LSTM(input_size, hidden_layer_size)

        self.linear = nn.Linear(hidden_layer_size, output_size)

        self.hidden_cell = (torch.zeros(1,1,self.hidden_layer_size),
                            torch.zeros(1,1,self.hidden_layer_size))

    def forward(self, input_seq):
        lstm_out, self.hidden_cell = self.lstm(input_seq.view(len(input_seq) ,1, -1), self.hidden_cell)
        predictions = self.linear(lstm_out.view(len(input_seq), -1))
        return predictions[-1]
    
def create_inout_sequences(input_data, tw):
    inout_seq = []
    L = len(input_data)
    print(L,tw)
    for i in range(L-tw):
        train_seq = input_data[i:i+tw]
        train_label = input_data[i+tw:i+tw+1]
        inout_seq.append((train_seq ,train_label))
    return inout_seq

def load_data(train_window):
    fulldata=pd.read_csv("./2001.csv")
    all_data=fulldata['BusCommuters'].values.astype(float)

    test_data_size = 56

    train_data = all_data[:-test_data_size]
    print(train_data[-1])
    test_data = all_data[-test_data_size:]

    scaler = MinMaxScaler(feature_range=(-1, 1))
    train_data_normalized = scaler.fit_transform(train_data .reshape(-1, 1))

    train_data_normalized = torch.FloatTensor(train_data_normalized).view(-1)
    
    return fulldata,scaler,train_data_normalized,create_inout_sequences(train_data_normalized, train_window)

if __name__== "__main__":
    model = LSTM()
    model.load_state_dict(torch.load('/Users/prajwalnadagouda/projects/federated/modelweight.pth'))
    train_window = 28   
    epochs = 150

    fulldata,scaler,train_data_normalized,train_inout_seq = load_data(train_window)

    fut_pred = 56
    test_inputs = train_data_normalized[-train_window:].tolist()

    model.eval()

    for i in range(fut_pred):
        seq = torch.FloatTensor(test_inputs[-train_window:])
        with torch.no_grad():
            model.hidden = (torch.zeros(1, 1, model.hidden_layer_size),
                            torch.zeros(1, 1, model.hidden_layer_size))
            test_inputs.append(model(seq).item())

    test_inputs[fut_pred:]


    actual_predictions = scaler.inverse_transform(np.array(test_inputs[train_window:] ).reshape(-1, 1))


    x = np.arange(len(fulldata)-fut_pred, len(fulldata), 1)
    plt.grid(True)
    plt.autoscale(axis='x', tight=True)
    plt.plot(fulldata['BusCommuters'],label="Actual")
    plt.plot(x,actual_predictions,label="Predicted")
    # current= datetime(2002,11,6)
    # for i in range(len(actual_predictions)):
    #     next= current+timedelta(days=i)
    #     print(next.weekday(),",",int(actual_predictions[i][0]))
    print(fulldata['BusCommuters'])
    # current= datetime(2002,11,6)
    # for i in range(len(actual_predictions)):
    #     next= current+timedelta(days=i)
    #     print(next.weekday(),",",int(fulldata['BusCommuters'][len(fulldata)-fut_pred+i]))
    plt.xlabel("Days")
    plt.ylabel("Passengers")
    plt.legend(loc="upper left")
    plt.xlim(xmin=0)
    plt.show()
    

    plt.figure(figsize=(7, 7))

    y_test=fulldata['BusCommuters'][-fut_pred:]
    y_pred_test=actual_predictions
 
    print("LSTMmodel accuracy(variance):", sqrt(metrics.mean_absolute_percentage_error(y_test, y_pred_test)))


    plt.scatter(y_test, y_pred_test, alpha=0.5, color='red', label='Test')
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'k--', lw=2)
    plt.xlabel('Actual')
    plt.ylabel('Predicted')
    plt.title('LSTM - Test Data: Actual vs Predicted')
    plt.legend()

    plt.show()

