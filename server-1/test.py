import csv
import re

input_file = r"C:\Users\patty\Downloads\voters_csv.csv"
output_file = r"C:\Users\patty\Downloads\clean_voters.csv"

precinct = None
rows = []

with open(input_file, "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    for row in reader:
        # Flatten row (remove empty cells)
        values = [v.strip() for v in row if v.strip()]
        if not values:
            continue

        # Detect precinct line (e.g., "Prec : 0927A")
        if values[0].startswith("Prec"):
            match = re.search(r"(\d+[A-Z])", values[0])
            if match:
                precinct = match.group(1)
            continue

        # Skip header lines like "No."
        if values[0].startswith("No"):
            continue

        # Handle voter rows
        if precinct and values[0].isdigit():
            category = ""
            # Extract flags (*, B, C, BC)
            possible_flags = [v for v in values[1:-1] if v in ["*", "B", "C", "BC"]]
            if possible_flags:
                category = possible_flags[0]

            # Name and address
            name = values[-2] if len(values) >= 3 else ""
            address = values[-1] if len(values) >= 2 else ""

            rows.append([precinct, name, address, category])

# Write clean CSV with headers + double quotes
with open(output_file, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f, quoting=csv.QUOTE_ALL)
    writer.writerow(["voter_precinct", "voter_name", "voter_address", "voter_category"])
    writer.writerows(rows)

print(f"✅ Saved {len(rows)} rows with precinct + headers to {output_file}")
