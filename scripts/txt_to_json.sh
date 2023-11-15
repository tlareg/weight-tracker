#!/bin/bash
#
# txt_to_json.sh
#
# This Bash script takes a text file containing date-weight pairs, reads the data, and transforms it into a JSON file.
#
# Input file format:
# Each line in the input file should contain a date and a weight separated by a space.
# Example:
#   2016-04-25 11.1
#   2016-04-26 22.2
#   2016-04-27 33.3
#
# Output file format:
# The script generates a JSON file with the following structure:
# {
#   "timeline": [
#     {
#       "date": "2016-04-25",
#       "weight": "11.1"
#     },
#     {
#       "date": "2016-04-26",
#       "weight": "22.2"
#     },
#     {
#       "date": "2016-04-27",
#       "weight": "33.3"
#     }
#   ]
# }
#
# Usage:
#   ./txt_to_json.sh <input_file>
#
# Arguments:
#   <input_file>: The path to the input text file containing date-weight pairs.
#
# Example:
#   ./txt_to_json.sh input.txt
#
# The script will create an output.json file with the formatted JSON content.

if [ $# -ne 1 ]; then
    echo "Usage: $0 <input_file>"
    exit 1
fi

input_file=$1
output_file="output.json"

# Check if the input file exists
if [ ! -f "$input_file" ]; then
    echo "Error: File $input_file not found."
    exit 1
fi

# Start creating the JSON content
json_content="{\"timeline\": ["

# Read each line from the input file and format it into JSON
while IFS=' ' read -r date weight; do
    json_content+="\n  {"
    json_content+="\n    \"date\": \"$date\","
    json_content+="\n    \"weight\": \"$weight\""
    json_content+="\n  },"
done < "$input_file"

# Remove the trailing comma from the last entry
json_content="${json_content%,}"

# Complete the JSON content
json_content+="\n]}"

# Write the JSON content to the output file
echo -e "$json_content" > "$output_file"

echo "Conversion successful. JSON content written to $output_file"
