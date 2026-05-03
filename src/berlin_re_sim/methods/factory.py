from __future__ import annotations

from pathlib import Path

from berlin_re_sim.methods.base import SimulationMethod, SimulationRunner, load_scenario
from berlin_re_sim.parameters import ParameterSource, load_parameters
from berlin_re_sim.scenario import Scenario


def create_simulation(
    method: SimulationMethod | str,
    scenario: Scenario | str | Path,
    seed: int | None = None,
    parameters: ParameterSource = None,
) -> SimulationRunner:
    method_name = SimulationMethod(method)
    loaded_scenario = load_scenario(scenario)
    loaded_parameters = load_parameters(parameters)

    if method_name == SimulationMethod.AGENT_BASED:
        from berlin_re_sim.methods.abm import AgentBasedSimulation

        return AgentBasedSimulation.from_scenario(
            loaded_scenario, seed=seed, parameters=loaded_parameters
        )
    if method_name == SimulationMethod.ANALYTICAL:
        from berlin_re_sim.methods.analytical import AnalyticalSimulation

        return AnalyticalSimulation.from_scenario(
            loaded_scenario, seed=seed, parameters=loaded_parameters
        )
    if method_name == SimulationMethod.MARKOV_CHAIN:
        from berlin_re_sim.methods.markov import MarkovChainSimulation

        return MarkovChainSimulation.from_scenario(
            loaded_scenario, seed=seed, parameters=loaded_parameters
        )
    if method_name == SimulationMethod.MCMC_STATE:
        from berlin_re_sim.methods.mcmc import MCMCStateSimulation

        return MCMCStateSimulation.from_scenario(
            loaded_scenario, seed=seed, parameters=loaded_parameters
        )

    raise ValueError(f"Unsupported simulation method: {method}")
