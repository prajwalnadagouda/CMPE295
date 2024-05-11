"""Flower client example using PyTorch for CIFAR-10 image classification."""

import argparse
from collections import OrderedDict
from typing import Dict, List, Tuple

import numpy as np
import torch
import requests
from datasets.utils.logging import disable_progress_bar
from torch.utils.data import DataLoader

import supportLSTM
import flwr as fl

import pandas as pd
import requests

disable_progress_bar()


USE_FEDBN: bool = True

DEVICE = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")


class CifarClient(fl.client.NumPyClient):
    """Flower client implementing CIFAR-10 image classification using PyTorch."""

    def __init__(
        self,
        model: supportLSTM.LSTM,
        trainloader: DataLoader,
        testloader: DataLoader,
    ) -> None:
        self.model = model
        self.trainloader = trainloader
        self.testloader = testloader

    def get_parameters(self, config: Dict[str, str]) -> List[np.ndarray]:
        self.model.train()
        if USE_FEDBN:
            return [
                val.cpu().numpy()
                for name, val in self.model.state_dict().items()
                if "bn" not in name
            ]
        else:
            return [val.cpu().numpy() for _, val in self.model.state_dict().items()]

    def set_parameters(self, parameters: List[np.ndarray]) -> None:
        self.model.train()
        if USE_FEDBN:
            keys = [k for k in self.model.state_dict().keys() if "bn" not in k]
            params_dict = zip(keys, parameters)
            state_dict = OrderedDict({k: torch.tensor(v) for k, v in params_dict})
            self.model.load_state_dict(state_dict, strict=False)
        else:
            params_dict = zip(self.model.state_dict().keys(), parameters)
            state_dict = OrderedDict({k: torch.tensor(v) for k, v in params_dict})
            self.model.load_state_dict(state_dict, strict=True)

    def fit(
        self, parameters: List[np.ndarray], config: Dict[str, str]
    ) -> Tuple[List[np.ndarray], int, Dict]:
        self.set_parameters(parameters)
        supportLSTM.train(self.model, self.trainloader, epochs=10)
        return self.get_parameters(config={}), len(self.trainloader), {}

    def evaluate(
        self, parameters: List[np.ndarray], config: Dict[str, str]
    ) -> Tuple[float, int, Dict]:
        return float(1), len(self.trainloader), {"accuracy": float(1)}


def main() -> None:
    trainloader= supportLSTM.load_data(28)

    model = supportLSTM.LSTM().to(DEVICE).train()

    client = CifarClient(model, trainloader, trainloader)
    fl.client.start_numpy_client(server_address="127.0.0.1:8080", client=client)
    try:
        file_path = '2001.csv'

        df = pd.read_csv(file_path)
        zip_totals = df.groupby('ZipCode')['BusCommuters'].mean()
        zip_rank = dict(zip_totals.sort_values(ascending=False))

        total_sum = sum(zip_rank.values())

        percentages = {int(zip_code): (value / total_sum) * 100 for zip_code, value in zip_rank.items()}
        print(percentages)

        url = 'http://127.0.0.1:8000/update'

        x = requests.post(url, json = percentages)
    except:
        print("server")



if __name__ == "__main__":
    main()