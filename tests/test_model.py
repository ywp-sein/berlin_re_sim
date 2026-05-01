from berlin_re_sim.model import BerlinRealEstateModel


def test_mitte_seed_runs_for_one_year() -> None:
    model = BerlinRealEstateModel.from_scenario_file("data/scenarios/mitte_seed.json", seed=7)

    for _ in range(12):
        model.step()

    assert len(model.metrics) == 13
    assert model.metrics[-1].median_rent_per_sqm > model.metrics[0].median_rent_per_sqm
    assert 0 <= model.metrics[-1].vacancy_rate <= 1
