from __future__ import annotations

from enum import StrEnum
from pathlib import Path
from typing import Protocol

from berlin_re_sim.scenario import Scenario
from berlin_re_sim.schemas import MarketMetrics


class SimulationMethod(StrEnum):
    AGENT_BASED = "agent_based"
    MARKOV_CHAIN = "markov_chain"
    MCMC_STATE = "mcmc_state"


class SimulationRunner(Protocol):
    method: SimulationMethod
    tick: int
    metrics: list[MarketMetrics]

    def step(self) -> None:
        """Advance the simulation by one step."""


def load_scenario(scenario: Scenario | str | Path) -> Scenario:
    if isinstance(scenario, Scenario):
        return scenario
    return Scenario.from_file(scenario)
