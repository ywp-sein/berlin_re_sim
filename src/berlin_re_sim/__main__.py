import argparse

from berlin_re_sim.methods import SimulationMethod, create_simulation


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--method",
        choices=[item.value for item in SimulationMethod],
        default=SimulationMethod.AGENT_BASED.value,
    )
    parser.add_argument("--scenario", default="data/scenarios/mitte_seed.json")
    args = parser.parse_args()

    model = create_simulation(args.method, args.scenario)
    for _ in range(12):
        model.step()

    latest = model.metrics[-1]
    print(f"method={model.method}")
    print(f"tick={latest.tick}")
    print(f"median_rent_per_sqm={latest.median_rent_per_sqm:.2f}")
    print(f"median_sale_price_per_sqm={latest.median_sale_price_per_sqm:.2f}")
    print(f"vacancy_rate={latest.vacancy_rate:.2%}")
    print(f"average_displacement_stress={latest.average_displacement_stress:.2f}")
    print(f"average_individual_income_monthly={latest.average_individual_income_monthly:.2f}")
    print(f"average_rent_burden={latest.average_rent_burden:.2%}")
    print(f"purchase_price_to_income_years={latest.purchase_price_to_income_years:.1f}")
    print(f"regulated_unit_share={latest.regulated_unit_share:.2%}")


if __name__ == "__main__":
    main()
