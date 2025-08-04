const TEST_PORTS = [6326, 6327, 6328]; // basline -  тестовые закрытые порты
const PORTS = [80, 443, 3000, 5000, 8080, 9222];
const TIMEOUT = 5000; // от утечки памяти
const CHECK_SAMPLES = 3; // количество замеров
const THRESHOLD_FACTOR = 1.5; // примерная разница между открытыми и закрытыми портами

function measureResponseTime(port) {
  return new Promise((resolve) => {
    const img = new Image();
    const start = performance.now();

    img.src = `http://localhost:${port}/favicon.ico?timestamp=${Date.now()}`;

    const timeoutId = setTimeout(() => {
      resolve({ port, time: TIMEOUT, status: "timeout" });
    }, TIMEOUT);

    img.onload = () => {
      clearTimeout(timeoutId);
      resolve({
        port,
        time: performance.now() - start,
        status: "open",
      });
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve({
        port,
        time: performance.now() - start,
        status: "closed",
      });
    };
  });
}

async function measurePort(port) {
  let totalTime = 0;

  for (let i = 0; i < CHECK_SAMPLES; i++) {
    const { time } = await measureResponseTime(port);
    totalTime += time;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return totalTime / CHECK_SAMPLES;
}

async function baseline(testPorts) {
  let baseline = 0;
  let validSamples = 0;

  for (const port of testPorts) {
    const avgTime = await measurePort(port);
    console.log(`avgTime for test ${port}: ${avgTime}ms`);
    if (avgTime < TIMEOUT) {
      baseline += avgTime;
      validSamples++;
    }
  }

  const avg = baseline / validSamples;
  console.log(
    `%cBaseline: ${avg}ms (${validSamples} из ${testPorts.length} тестовых портов)`,
    "color: orange;",
  );
  return avg;
}

function renderResult(port, status, time) {
  const resultsDiv = document.getElementById("results");
  const div = document.createElement("div");
  // div.textContent = `localhost:${port} - ${status} (${time}ms)`; for dev
  div.textContent = `localhost:${port} - ${status}`; //for prod
  div.className = status === "open" ? "open" : "closed";
  resultsDiv.appendChild(div);
}

export async function scanPorts() {
  const resultsDiv = document.getElementById("results");

  const statusSpan = document.createElement("span");
  statusSpan.textContent = "Scanning...";
  resultsDiv.appendChild(statusSpan);

  const baselineTime = await baseline(TEST_PORTS);

  for (const port of PORTS) {
    const avgTime = await measurePort(port);
    const isOpen = avgTime >= baselineTime * THRESHOLD_FACTOR;
    const status = isOpen ? "open" : "closed";

    console.log(`localhost:${port} - ${status} (${avgTime}ms)`);

    renderResult(port, status, avgTime);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  statusSpan.textContent = "Finish!";
}
