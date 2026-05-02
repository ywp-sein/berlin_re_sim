(function () {
  const scenario = window.SCENARIO_CONTENT?.scenario;

  function adaptScenario(rawScenario) {
    if (!rawScenario) {
      return {
        scenarioName: "Missing scenario",
        neighborhoods: [],
        owners: [],
        units: [],
        influences: [],
      };
    }

    const parcelsById = Object.fromEntries(rawScenario.parcels.map((parcel) => [parcel.id, parcel]));
    const buildingsById = Object.fromEntries(
      rawScenario.buildings.map((building) => [building.id, building]),
    );
    const householdsById = Object.fromEntries(
      rawScenario.households.map((household) => [household.id, household]),
    );

    return {
      scenarioName: rawScenario.name,
      sourcePath: window.SCENARIO_CONTENT?.source_path || "data/scenarios/mitte_seed.json",
      neighborhoods: rawScenario.neighborhoods.map((area) => ({
        id: area.id,
        name: area.name,
        demandPressure: area.demand_pressure,
        incomeMix: area.income_mix,
      })),
      owners: rawScenario.owners.map((owner) => ({
        id: owner.id,
        kind: owner.kind,
        riskTolerance: owner.risk_tolerance,
        socialMission: owner.social_mission,
      })),
      units: rawScenario.units.map((unit) => {
        const building = buildingsById[unit.building_id];
        const parcel = building ? parcelsById[building.parcel_id] : null;
        const household = unit.household_id ? householdsById[unit.household_id] : null;
        return {
          id: unit.id,
          neighborhoodId: parcel?.neighborhood_id || household?.neighborhood_preference || "",
          ownerId: parcel?.owner_id || "",
          sqm: unit.sqm,
          rent: unit.monthly_rent,
          baseRent: unit.monthly_rent,
          salePrice: unit.estimated_sale_price,
          baseSalePrice: unit.estimated_sale_price,
          regulated: unit.regulated,
          vacant: unit.vacant,
          household: household
            ? {
                income: household.income_monthly,
                size: household.size,
                tolerance: household.rent_burden_tolerance,
                stress: household.displacement_stress || 0,
              }
            : null,
          convertedToSale: false,
        };
      }),
      influences: (rawScenario.influence_edges || []).map((edge) => ({
        from: edge.from,
        to: edge.to,
        weight: edge.weight,
        kind: edge.kind,
      })),
    };
  }

  const adapted = adaptScenario(scenario);
  window.BerlinScenario = {
    raw: scenario,
    seed: adapted,
    influences: adapted.influences,
  };
})();
