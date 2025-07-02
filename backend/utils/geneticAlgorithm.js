export function runGA(timeMatrix, coordinates) {
  const POP_SIZE = 100;
  const GENERATIONS = 200;
  const MUTATION_RATE = 0.1;

  const initialIndex = 0;
  const totalPoints = coordinates.length;
  // index semua rute kecuali titik awal
  const routeIndices = Array.from({ length: totalPoints }, (_, i) => i).filter(
    (i) => i !== initialIndex
  );

  function getFitness(route) {
    let total = 0;
    const visitedPickup = new Set();
    const deliveredItems = new Set();

    // Kapasitas 1 delivery bag = 60x40x40 (cm^3). Ada 2 delivery bag.
    const MAX_CAPACITY = 192000;
    let currentVolume = 0;

    for (let i = 0; i < route.length - 1; i++) {
      const from = route[i];
      const to = route[i + 1];
      total += timeMatrix[from][to];

      const point = coordinates[to];

      if (point.type === "pickup") {
        if (!visitedPickup.has(point.order_id)) {
          visitedPickup.add(point.order_id);
          currentVolume += point.volume;

          if (currentVolume > MAX_CAPACITY) {
            total += 9999; // penalti jika melebihi kapasitas delivery bag
          }
        }
      }

      if (point.type === "delivery") {
        if (!visitedPickup.has(point.order_id)) {
          total += 9999; // penalti jika delivery sebelum pickup
        } else if (!deliveredItems.has(point.id)) {
          deliveredItems.add(point.id);
          currentVolume -= point.volume;
        }
      }
    }

    return total;
  }

  function generateRandomRoute() {
    // random semua rute kecuali titik awal
    const shuffled = [...routeIndices].sort(() => Math.random() - 0.5);
    return [initialIndex, ...shuffled];
  }

  function crossover(parent1, parent2) {
    const start = Math.floor(Math.random() * (parent1.length - 1)) + 1;
    const end = Math.floor(Math.random() * (parent1.length - start)) + start;

    const middle = parent1.slice(start, end);
    const seen = new Set(middle);
    const rest = parent2.filter(
      (item) => !seen.has(item) && item !== initialIndex
    );

    const child = [
      initialIndex,
      ...rest.slice(0, start - 1),
      ...middle,
      ...rest.slice(start - 1),
    ];

    return child;
  }

  function mutate(route) {
    const newRoute = [...route];
    if (Math.random() < MUTATION_RATE) {
      const i = Math.floor(Math.random() * (newRoute.length - 1)) + 1;
      const j = Math.floor(Math.random() * (newRoute.length - 1)) + 1;
      // single point mutation
      [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
    }
    return newRoute;
  }

  function fixDuplicates(route) {
    const seen = new Set();
    const missing = [];

    // cari titik yang tidak muncul
    for (let i = 1; i < totalPoints; i++) {
      if (!route.includes(i)) {
        missing.push(i);
      }
    }

    const fixed = [initialIndex];
    for (let i = 1; i < route.length; i++) {
      const val = route[i];
      if (val === initialIndex || seen.has(val)) {
        fixed.push(missing.shift());
      } else {
        seen.add(val);
        fixed.push(val);
      }
    }

    return fixed;
  }

  function rouletteSelection(population, fitnesses) {
    const inverted = fitnesses.map((f) => 1 / f);
    const total = inverted.reduce((acc, val) => acc + val, 0);
    const probs = inverted.map((val) => val / total);

    const rand = Math.random();
    let acc = 0;
    for (let i = 0; i < probs.length; i++) {
      acc += probs[i];
      if (rand <= acc) {
        return population[i];
      }
    }
    return population[population.length - 1];
  }

  // INITIALIZE
  let population = Array.from({ length: POP_SIZE }, generateRandomRoute);
  let bestTime = Infinity;
  let bestRoute = null;

  for (let gen = 0; gen < GENERATIONS; gen++) {
    const fitnesses = population.map(getFitness);
    const bestIdx = fitnesses.indexOf(Math.min(...fitnesses));

    const currentBest = population[bestIdx];
    const currentBestTime = fitnesses[bestIdx];
    const currentWorstTime = Math.max(...fitnesses);

    console.log(
      `Generation ${
        gen + 1
      }: Best = ${currentBestTime}s, Worst = ${currentWorstTime}s`
    );

    if (currentBestTime < bestTime) {
      bestTime = currentBestTime;
      bestRoute = currentBest;
    }

    const newPopulation = [];

    while (newPopulation.length < POP_SIZE) {
      const parent1 = rouletteSelection(population, fitnesses);
      const parent2 = rouletteSelection(population, fitnesses);
      let child = crossover(parent1, parent2);
      child = mutate(child);
      child = fixDuplicates(child);
      newPopulation.push(child);
    }

    population = newPopulation;
  }

  return {
    bestRoute,
    bestTime,
  };
}
