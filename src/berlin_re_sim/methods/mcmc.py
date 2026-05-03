from __future__ import annotations

from pathlib import Path

from berlin_re_sim.methods.base import SimulationMethod, load_scenario
from berlin_re_sim.methods.markov import MarketState, MarkovChainSimulation
from berlin_re_sim.parameters import ParameterSource
from berlin_re_sim.scenario import Scenario


class MCMCStateSimulation(MarkovChainSimulation):
    """Metropolis-Hastings sampler over market-regime states."""

    method = SimulationMethod.MCMC_STATE

    @classmethod
    def from_scenario_file(
        cls, path: str | Path, seed: int | None = None, parameters: ParameterSource = None
    ) -> MCMCStateSimulation:
        return cls(load_scenario(path), seed=seed, parameters=parameters)

    @classmethod
    def from_scenario(
        cls, scenario: Scenario, seed: int | None = None, parameters: ParameterSource = None
    ) -> MCMCStateSimulation:
        return cls(scenario, seed=seed, parameters=parameters)

    def _sample_next_state(self) -> MarketState:
        target_weights = {
            MarketState(state): weight
            for state, weight in self.parameters["mcmc_target_weights"].items()
        }
        proposal = self.random.choice([state for state, _ in self.transitions[self.current_state]])
        acceptance = min(
            1.0,
            target_weights[proposal]
            / max(target_weights[self.current_state], self.parameters["mcmc_min_weight"]),
        )
        if self.random.random() <= acceptance:
            return proposal
        return self.current_state
