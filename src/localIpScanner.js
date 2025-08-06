const TEST_FILE = "My%20Files/IMAGES/1733147053_31781492.jpg";
const NON_EXISTENT_FILE = "nonexistent/fake/file.jpg";
const PORT = 3000;
const FILE_TEST_TIMEOUT = 150000;
const RTC_TIMEOUT = 10000;

function renderResult(address, port, result, time, status) {
  const resultsDiv = document.getElementById("ipScanner");
  const div = document.createElement("div");
  div.textContent = `${address}:${port} - ${result} (${time.toFixed(2)}ms)`;
  div.className = status === "success" ? "open" : "closed";
  resultsDiv.appendChild(div);
}

async function testFile(address, port, filePath) {
  return new Promise((resolve) => {
    const img = new Image();
    const start = performance.now();

    img.src = `http://${address}:${port}/${filePath}?timestamp=${Date.now()}`;

    const timeoutId = setTimeout(() => {
      resolve({
        address,
        port,
        time: performance.now() - start,
        status: "timeout",
        result: "TIMEOUT",
      });
    }, FILE_TEST_TIMEOUT);

    img.onload = () => {
      clearTimeout(timeoutId);
      resolve({
        address,
        port,
        time: performance.now() - start,
        status: "success",
        result: "✅ FILE EXISTS",
      });
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve({
        address,
        port,
        time: performance.now() - start,
        status: "error",
        result: "❌ FILE NOT FOUND",
      });
    };
  });
}

async function testAddress(address) {
  const existingResult = await testFile(address, PORT, TEST_FILE);
  renderResult(
    address,
    PORT,
    `${existingResult.result} [existing file]`,
    existingResult.time,
    existingResult.status,
  );

  const nonExistentResult = await testFile(address, PORT, NON_EXISTENT_FILE);
  renderResult(
    address,
    PORT,
    `${nonExistentResult.result} [non-existent file]`,
    nonExistentResult.time,
    nonExistentResult.status,
  );

  return {
    address,
    behavesLikeLocal:
      existingResult.status === "success" &&
      nonExistentResult.status === "error",
  };
}

export async function getLocalIP() {
  return new Promise((resolve, reject) => {
    const rtc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    rtc.createDataChannel("test");
    const candidates = [];

    rtc.onicecandidate = (event) => {
      if (event.candidate && event.candidate.candidate) {
        const candidateStr = event.candidate.candidate;
        const match = candidateStr.match(/(\S+\.local)/);
        if (match) {
          candidates.push(match[1]);
        }
      } else {
        const uniqueCandidates = [...new Set(candidates)];
        resolve({ candidates: uniqueCandidates, rtc });
      }
    };

    rtc
      .createOffer()
      .then((offer) => rtc.setLocalDescription(offer))
      .catch(reject);

    setTimeout(() => {
      const uniqueCandidates = [...new Set(candidates)];
      resolve({ candidates: uniqueCandidates, rtc });
    }, RTC_TIMEOUT);
  });
}

export async function testMdnsFileAccess() {
  const resultsDiv = document.getElementById("ipScanner");
  resultsDiv.innerHTML = "<h3>Testing mDNS File Access:</h3>";

  const { candidates: mdnsAddresses, rtc } = await getLocalIP();
  console.log("Found mDNS addresses:", mdnsAddresses);

  if (!mdnsAddresses || mdnsAddresses.length === 0) {
    resultsDiv.innerHTML += "<p>❌ No mDNS addresses found!</p>";
    rtc.close();
    return;
  }

  // Test localhost first for comparison
  const localhostResult = await testAddress("localhost");
  if (localhostResult.behavesLikeLocal) {
    console.log("localhost behaves as expected");
  }

  // Test mDNS addresses
  for (const address of mdnsAddresses) {
    const result = await testAddress(address);
    if (result.behavesLikeLocal) {
      const successDiv = document.createElement("div");
      successDiv.innerHTML = `<strong style="color: green;"> ${address} behaves like localhost - this is your local IP!</strong>`;
      resultsDiv.appendChild(successDiv);
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  rtc.close();
}
