from __future__ import annotations

from pathlib import Path

from berlin_re_sim.methods.base import SimulationMethod, load_scenario
from berlin_re_sim.model import BerlinRealEstateModel
from berlin_re_sim.parameters import ParameterSource
from berlin_re_sim.scenario import Scenario


class AgentBasedSimulation(BerlinRealEstateModel):
    """Mesa-backed agent-based simulation method."""

    method = SimulationMethod.AGENT_BASED

    @classmethod
    def from_scenario_file(
        cls, path: str | Path, seed: int | None = None, parameters: ParameterSource = None
    ) -> AgentBasedSimulation:
        return cls(load_scenario(path), seed=seed, parameters=parameters)

    @classmethod
    def from_scenario(
        cls, scenario: Scenario, seed: int | None = None, parameters: ParameterSource = None
    ) -> AgentBasedSimulation:
        return cls(scenario, seed=seed, parameters=parameters)
