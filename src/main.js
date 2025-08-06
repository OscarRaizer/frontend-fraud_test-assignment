import { testMdnsFileAccess } from "./localIpScanner.js";
import { scanPorts } from "./localHostScanner.js";

async function runTests() {
  await scanPorts();
  await testMdnsFileAccess();
}

runTests();
