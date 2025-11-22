const fs = require("fs");
const path = require("path");

/**
 * Script to export the contract ABI to a JSON file for frontend use
 */
async function main() {
  const contractName = "Voting";
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts",
    `${contractName}.sol`,
    `${contractName}.json`
  );

  if (!fs.existsSync(artifactPath)) {
    console.error("Contract artifact not found. Please compile the contracts first:");
    console.error("  npm run compile");
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = artifact.abi;

  // Export ABI to contracts folder root
  const outputPath = path.join(__dirname, "../abi.json");
  fs.writeFileSync(outputPath, JSON.stringify(abi, null, 2));

  console.log("✅ ABI exported successfully!");
  console.log(`📄 Location: ${outputPath}`);
  console.log(`\nYou can now import this ABI in your frontend:`);
  console.log(`  import VotingABI from '../contracts/abi.json'`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

