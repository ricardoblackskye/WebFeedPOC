#!/bin/bash
set -e

# Test that the JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE regex in .mega-linter.yml matches the Wix and Stripe files that should be excluded.

# Extract the regex from .mega-linter.yml
# The line looks like: JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE: "(?i).*(wix|stripe).*\\.js$"
# We want to extract the pattern inside the quotes, but note that the backslashes are escaped in the YAML.
# We'll use sed to get the value after the colon and then trim spaces and quotes.

if [ ! -f ".mega-linter.yml" ]; then
    echo ".mega-linter.yml not found"
    exit 1
fi

# Get the line containing JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE
pattern_line=$(grep '^JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE:' .mega-linter.yml)
if [ -z "$pattern_line" ]; then
    echo "JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE not found in .mega-linter.yml"
    exit 1
fi

# Extract the value after the colon, remove leading/trailing spaces, and remove the surrounding quotes.
# The value may have escaped quotes inside, but we assume the pattern is simple.
pattern=$(echo "$pattern_line" | sed -e 's/^JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE: //' -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"//' -e 's/"$//')

# Now we have the pattern as a string. The pattern may contain (?i) for case-insensitive.
# We'll remove the (?i) and use grep -i for case-insensitive matching.
# Remove the (?i) prefix if present.
case_insensitive=0
if [[ "$pattern" =~ ^\\\\?\\(?i\\)(.*) ]]; then
    pattern=${BASH_REMATCH[1]}
    case_insensitive=1
fi

# List of files that should be excluded (from the linting issues)
files_to_exclude=(
    "src/hooks/useWixCart.js"
    "src/hooks/useWixContent.js"
    "src/hooks/useWixProducts.js"
    "src/services/stripeService.js"
    "src/services/stripeService.test.js"
)

all_match=0
for file in "${files_to_exclude[@]}"; do
    if [ $case_insensitive -eq 1 ]; then
        if ! echo "$file" | grep -E -i "$pattern" > /dev/null; then
            echo "File '$file' does not match the exclusion pattern '$pattern' (case-insensitive)"
            all_match=1
        fi
    else
        if ! echo "$file" | grep -E "$pattern" > /dev/null; then
            echo "File '$file' does not match the exclusion pattern '$pattern'"
            all_match=1
        fi
    fi
done

if [ $all_match -ne 0 ]; then
    echo "JS exclusion test failed: some files do not match the pattern."
    exit 1
fi

echo "JS exclusion test passed: all files match the exclusion pattern."
exit 0
