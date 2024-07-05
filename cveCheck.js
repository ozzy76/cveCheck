const csv = require('fast-csv'); // Import the fast-csv library for handling CSV files
const axios = require('axios'); // Import axios for making HTTP requests
const fs = require('fs'); // Import the fs (File System) module for reading and writing files
const path = require('path'); // Import path module for handling file paths

// Verbosely log program activities to a log file
console.log(`Starting CVE EPSS Scores Program at ${new Date().toLocaleString()}...`);
fs.appendFileSync('log.txt', `Starting CVE EPSS Scores Program at ${new Date().toLocaleString()}...\n`);

// Function to get EPSS score for a given CVE ID
async function getEpssScore(cveId) {
  try {
    // Make an HTTP GET request to the EPSS API
    const response = await axios.get(`https://api.first.org/data/v1/epss?cve=${cveId}`);
    if (response.data && response.data.data && response.data.data.length > 0) {
      // Return the EPSS data for the CVE ID
      return response.data.data[0];
    } else {
      // Throw an error if no data is found
      throw new Error(`No data found for CVE: ${cveId}`);
    }
  } catch (err) {
    // Log and return null if there is an error in the request
    console.error(`Error fetching EPSS for ${cveId}:`, err.message);
    fs.appendFileSync('log.txt', `Error fetching EPSS for ${cveId}: ${err.message}\n`);
    return null;
  }
}

// Main function to handle the program's workflow
async function main() {
  try {
    // Prompt the user to enter CVE IDs or provide a CSV file
    console.log('Enter CVE IDs (separated by commas) or provide a CSV file path:');
    fs.appendFileSync('log.txt', 'Prompted user for CVE IDs or CSV file path...\n');

    // Wait for the user to enter the CVE IDs or CSV file path
    const input = await getUserInput();

    let cveData = [];
    let cves = [];

    if (input.endsWith('.csv')) {
      // If the input is a CSV file path, read the CSV file
      cves = await readCvesFromCsv(input);
    } else {
      // If the input is a string of CVE IDs, split it into an array
      cves = input.split(',');
    }

    // Iterate over each CVE ID entered by the user
    for (let cve of cves) {
      // Get the EPSS score for each CVE ID
      let epssData = await getEpssScore(cve.trim());
      if (epssData) {
        // Determine the priority message based on the EPSS score
        const priority = epssData.epss >= 0.50
          ? "The probability of exploitation is 50 percent or greater. Examine the asset(s) exposure to threat actors and potential for data loss"
          : "";

        // Add the CVE data to the array
        cveData.push({
          CVE: epssData.cve,
          EPSS: epssData.epss,
          Percentile: epssData.percentile,
          Date: epssData.date,
          Priority: priority
        });
      }
    }

    const csvFilePath = 'epss_scores.csv';
    // Check if the CSV file already exists
    if (fs.existsSync(csvFilePath)) {
      let existingData = [];
      // Read the existing CSV file
      fs.createReadStream(csvFilePath)
        .pipe(csv.parse({ headers: true }))
        .on('data', row => existingData.push(row))
        .on('end', () => {
          // Update the existing data with new data
          cveData.forEach(newData => {
            let index = existingData.findIndex(item => item.CVE === newData.CVE);
            if (index !== -1) {
              existingData[index] = newData;
            } else {
              existingData.push(newData);
            }
          });

          // Write the updated data back to the CSV file
          writeCsv(csvFilePath, existingData);
        });
    } else {
      // If the CSV file does not exist, create it with the new data
      writeCsv(csvFilePath, cveData);
    }
  } catch (err) {
    // Log any errors that occur in the main function
    console.error('Error in main function:', err.message);
    fs.appendFileSync('log.txt', `Error in main function: ${err.message}\n`);
  }
}

// Function to write data to a CSV file
function writeCsv(filePath, data) {
  const ws = fs.createWriteStream(filePath);
  // Use fast-csv to write the data to the CSV file
  csv.write(data, { headers: true }).pipe(ws);
  ws.on('finish', () => {
    console.log(`CSV file written: ${filePath}`);
    fs.appendFileSync('log.txt', `CSV file written: ${filePath}\n`);
  });
}

// Function to prompt the user for CVE IDs or a CSV file path and handle the input
async function getUserInput() {
  return new Promise((resolve, reject) => {
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (input) => {
      let userInput = input.toString().trim();
      if (userInput.length > 0) {
        // Resolve the promise with the entered input
        resolve(userInput);
      } else {
        // Prompt the user again if the input is invalid
        console.log("Please enter valid CVE IDs separated by commas or provide a valid CSV file path.");
        fs.appendFileSync('log.txt', "Invalid input entered. Prompting again...\n");
        getUserInput().then(resolve).catch(reject);
      }
    });

    process.stdin.on('error', (err) => {
      // Reject the promise if there is an error with the input stream
      reject(err);
    });

    setTimeout(() => {
      // Reject the promise if the user does not enter input within the timeout period
      reject(new Error('Timeout: No input received.'));
    }, 50000);
  });
}

// Function to read CVE IDs from a CSV file
async function readCvesFromCsv(filePath) {
  return new Promise((resolve, reject) => {
    let cves = [];
    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: false }))
      .on('data', row => cves.push(row[0])) // Assume CVE IDs are in the first column
      .on('end', () => resolve(cves))
      .on('error', err => reject(err));
  });
}

// Start the main program
main().then(() => {
  console.log('Program completed.');
  fs.appendFileSync('log.txt', 'Program completed.\n');
}).catch((err) => {
  console.error('Unhandled error:', err.message);
  fs.appendFileSync('log.txt', `Unhandled error: ${err.message}\n`);
});
