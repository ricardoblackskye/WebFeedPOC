#!/bin/bash
set -e

files=(
    ".github/workflows/ci.yml"
    ".github/workflows/mega-linter.yml"
    ".mega-linter.yml"
)

for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "File $file not found"
        exit 1
    fi
    if ! head -1 "$file" | grep -q '^---$'; then
        echo "File $file does not start with '---'"
        exit 1
    fi
done

# Check for duplicate key in .mega-linter.yml
if [ -f ".mega-linter.yml" ]; then
    count=$(grep -c '^JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE:' .mega-linter.yml)
    if [ $count -ne 1 ]; then
        echo "Expected exactly one JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE key in .mega-linter.yml, found $count"
        exit 1
    fi
fi

echo "YAML checks passed"
exit 0