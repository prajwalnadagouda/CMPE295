import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from datetime import datetime, timedelta


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

def getpredictions():
    model = LSTM()
    model.load_state_dict(torch.load('./modelweight.pth'))
    train_window = 28   
    fut_pred = 8
    model.eval()

    current_date = datetime.now().date()
    yesterday_date = current_date - timedelta(days=1)
    df = pd.read_csv("./nextpredict.csv", parse_dates=['Date'], dayfirst=False)
    idx=df.index[df['Date'] == str(yesterday_date)].tolist()[0]
    test_inputs = df['BusCommuters'].iloc[(idx-train_window+1):idx+1].to_numpy()
    test_write=test_inputs.tolist()
    print(test_write)
    
    scaler = MinMaxScaler(feature_range=(-1, 1))
    train_data_normalized = scaler.fit_transform(test_inputs .reshape(-1, 1))
    train_data_normalized = torch.FloatTensor(train_data_normalized).view(-1)
    test_inputs = train_data_normalized[-train_window:].tolist()
    for i in range(fut_pred):
        seq = torch.FloatTensor(test_inputs[-train_window:])
        with torch.no_grad():
            model.hidden = (torch.zeros(1, 1, model.hidden_layer_size),
                            torch.zeros(1, 1, model.hidden_layer_size))
            test_inputs.append(model(seq).item())

    test_inputs[fut_pred:]


    actual_predictions = scaler.inverse_transform(np.array(test_inputs[train_window:] ).reshape(-1, 1))
    print(actual_predictions)

    with open("nextpredict.csv", 'w') as python_file:
        python_file.write("BusCommuters,Date\n")
        for i in range(len(test_write)):
            python_file.write(str(test_write[i])+","+str((current_date-timedelta(days=(len(test_write)-i))).strftime('%m/%d/%Y'))+"\n")


        for i in range(len(actual_predictions)):
            python_file.write(str(int(actual_predictions[i][0]))+","+str((current_date+timedelta(days=i)).strftime('%m/%d/%Y'))+"\n")
