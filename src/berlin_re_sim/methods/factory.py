from __future__ import annotations

from pathlib import Path

from berlin_re_sim.methods.base import SimulationMethod, SimulationRunner, load_scenario
from berlin_re_sim.scenario import Scenario


def create_simulation(
    method: SimulationMethod | str,
    scenario: Scenario | str | Path,
    seed: int | None = None,
) -> SimulationRunner:
    method_name = SimulationMethod(method)
    loaded_scenario = load_scenario(scenario)

    if method_name == SimulationMethod.AGENT_BASED:
        from berlin_re_sim.methods.abm import AgentBasedSimulation

        return AgentBasedSimulation.from_scenario(loaded_scenario, seed=seed)
    if method_name == SimulationMethod.MARKOV_CHAIN:
        from berlin_re_sim.methods.markov import MarkovChainSimulation

        return MarkovChainSimulation.from_scenario(loaded_scenario, seed=seed)
    if method_name == SimulationMethod.MCMC_STATE:
        from berlin_re_sim.methods.mcmc import MCMCStateSimulation

        return MCMCStateSimulation.from_scenario(loaded_scenario, seed=seed)

    raise ValueError(f"Unsupported simulation method: {method}")
