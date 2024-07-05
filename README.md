This cli program gets EPSS scores for a list of CVE IDs. It helps answer the question _"What is the exploit probability of high-impact vulnerabilities in our environment by threat actor 'X'?_ Provide the CVE IDs by typing/pasting or supply a path to a CSV file containing the CVE IDs.

**Features**

- Fetch EPSS scores for a list of CVE IDs.
- Determine priority based on the EPSS score.
- Append results to an existing CSV file or create a new one.
- Accept CVE IDs via direct input or a CSV file.
- Know what to fix first

**Dependencies**

- Node.js and npm
- axios: For making HTTP requests.
- fast-csv: For reading and writing CSV files.
- fs (File System): For interacting with the file system.
- path: For handling file paths.

npm install axios fast-csv

_Run it_
node cveCheck.js

_When prompted, you can either:_

- Enter CVE IDs separated by commas (e.g., CVE-2021-34527,CVE-2021-1675)
- Provide the path to a CSV file containing the CVE IDs (e.g., path/to/cve_list.csv)

Starting CVE EPSS Scores Program at 3/3/2024, 2:35:56 PM...
Enter CVE IDs (separated by commas) or provide a CSV file path:
CVE-2021-34527,CVE-2021-1675
Fetching EPSS scores...
CSV file written: epss_scores.csv
Program completed.
