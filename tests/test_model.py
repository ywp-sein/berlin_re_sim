from berlin_re_sim.model import BerlinRealEstateModel
from berlin_re_sim.methods import SimulationMethod, create_simulation


def test_mitte_seed_runs_for_one_year() -> None:
    model = BerlinRealEstateModel.from_scenario_file("data/scenarios/mitte_seed.json", seed=7)

    for _ in range(12):
        model.step()

    assert len(model.metrics) == 13
    assert model.metrics[-1].median_rent_per_sqm > model.metrics[0].median_rent_per_sqm
    assert 0 <= model.metrics[-1].vacancy_rate <= 1
    assert model.metrics[-1].average_individual_income_monthly > 0
    assert 0 <= model.metrics[-1].average_rent_burden <= 1
    assert model.metrics[-1].purchase_price_to_income_years > 0


def test_markov_chain_method_runs_for_one_year() -> None:
    model = create_simulation(
        SimulationMethod.MARKOV_CHAIN,
        "data/scenarios/mitte_seed.json",
        seed=7,
    )

    for _ in range(12):
        model.step()

    assert len(model.metrics) == 13
    assert model.method == SimulationMethod.MARKOV_CHAIN
    assert model.metrics[-1].average_individual_income_monthly > 0
    assert 0 <= model.metrics[-1].vacancy_rate <= 1


def test_mcmc_state_method_runs_for_one_year() -> None:
    model = create_simulation(
        SimulationMethod.MCMC_STATE,
        "data/scenarios/mitte_seed.json",
        seed=7,
    )

    for _ in range(12):
        model.step()

    assert len(model.metrics) == 13
    assert model.method == SimulationMethod.MCMC_STATE
    assert model.metrics[-1].average_individual_income_monthly > 0
    assert 0 <= model.metrics[-1].average_displacement_stress <= 1
