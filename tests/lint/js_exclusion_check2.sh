#!/bin/bash
set -e

# Test that the JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE regex in .mega-linter.yml matches the Wix and Stripe files that should be excluded.

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

# Extract the value inside the double quotes.
# The line looks like: JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE: "(?i).*(wix|stripe).*\\.js$"
# We want to remove the leading key and the colon, then trim spaces, then remove the surrounding double quotes.
pattern=$(echo "$pattern_line" | sed -e 's/^JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE: //' -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"//' -e 's/"$//')

echo "Extracted pattern: '$pattern'"

# Now we have the pattern as a string. We need to use it as a regex in bash.
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
    if [[ ! "$file" =~ $pattern ]]; then
        echo "File '$file' does not match the exclusion pattern '$pattern'"
        all_match=1
    fi
done

if [ $all_match -ne 0 ]; then
    echo "JS exclusion test failed: some files do not match the pattern."
    exit 1
fi

echo "JS exclusion test passed: all files match the exclusion pattern."
exit 0