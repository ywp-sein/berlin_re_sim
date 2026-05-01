from berlin_re_sim.model import BerlinRealEstateModel


def main() -> None:
    model = BerlinRealEstateModel.from_scenario_file("data/scenarios/mitte_seed.json")
    for _ in range(12):
        model.step()

    latest = model.metrics[-1]
    print(f"tick={latest.tick}")
    print(f"median_rent_per_sqm={latest.median_rent_per_sqm:.2f}")
    print(f"median_sale_price_per_sqm={latest.median_sale_price_per_sqm:.2f}")
    print(f"vacancy_rate={latest.vacancy_rate:.2%}")
    print(f"average_displacement_stress={latest.average_displacement_stress:.2f}")


if __name__ == "__main__":
    main()
