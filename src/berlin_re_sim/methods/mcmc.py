from __future__ import annotations

from pathlib import Path

from berlin_re_sim.methods.base import SimulationMethod, load_scenario
from berlin_re_sim.methods.markov import (
    TRANSITIONS,
    MarketState,
    MarkovChainSimulation,
)
from berlin_re_sim.scenario import Scenario


TARGET_WEIGHTS: dict[MarketState, float] = {
    MarketState.STABLE_AFFORDABLE: 0.16,
    MarketState.RENT_PRESSURE: 0.18,
    MarketState.PURCHASE_PRESSURE: 0.16,
    MarketState.VACANCY_PRESSURE: 0.10,
    MarketState.DISPLACEMENT_PRESSURE: 0.14,
    MarketState.SPECULATIVE_CONVERSION: 0.14,
    MarketState.PUBLIC_STABILIZED: 0.12,
}


class MCMCStateSimulation(MarkovChainSimulation):
    """Metropolis-Hastings sampler over market-regime states."""

    method = SimulationMethod.MCMC_STATE

    @classmethod
    def from_scenario_file(
        cls, path: str | Path, seed: int | None = None
    ) -> MCMCStateSimulation:
        return cls(load_scenario(path), seed=seed)

    @classmethod
    def from_scenario(
        cls, scenario: Scenario, seed: int | None = None
    ) -> MCMCStateSimulation:
        return cls(scenario, seed=seed)

    def _sample_next_state(self) -> MarketState:
        proposal = self.random.choice([state for state, _ in TRANSITIONS[self.current_state]])
        acceptance = min(
            1.0,
            TARGET_WEIGHTS[proposal] / max(TARGET_WEIGHTS[self.current_state], 0.0001),
        )
        if self.random.random() <= acceptance:
            return proposal
        return self.current_state
