from typing import List, Tuple
import flwr as fl
from flwr.common import Metrics, Parameters
import os
import pickle
import torch

total_rounds=3



def save_model_parameters(parameters: Parameters, round: int) -> None:
    os.makedirs("model_weights", exist_ok=True)
    file_path = f"model_weights/round-{round}.pkl"
    if(round==total_rounds):
        file_path = f"model_weights/modelweight.pth"
        torch.save(parameters.__dict__, file_path)
    with open(file_path, "wb") as f:
        pickle.dump(parameters, f)

class SaveModelFedAvg(fl.server.strategy.FedAvg):
    def aggregate_fit(self, rnd: int, results, failures):
        aggregated_result = super().aggregate_fit(rnd, results, failures)
        if aggregated_result is not None:
            aggregated_parameters, _ = aggregated_result
            save_model_parameters(aggregated_parameters, rnd)
        return aggregated_result

def weighted_average(metrics: List[Tuple[int, Metrics]]) -> Metrics:
    accuracies = [num_examples * m["accuracy"] for num_examples, m in metrics]
    examples = [num_examples for num_examples, _ in metrics]
    return {"accuracy": sum(accuracies) / sum(examples)}

strategy = SaveModelFedAvg(evaluate_metrics_aggregation_fn=weighted_average)

fl.server.start_server(
    server_address="0.0.0.0:8080",
    config=fl.server.ServerConfig(num_rounds=total_rounds),
    strategy=strategy
)
