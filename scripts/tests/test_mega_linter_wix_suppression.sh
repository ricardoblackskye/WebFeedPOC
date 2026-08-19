#!/bin/bash

# Test to check if the standard linter is configured to suppress Wix-related files

EXPECTED='JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE: ".*wix.*\\.js$"'

if ! grep -q "$EXPECTED" .mega-linter.yml; then
  echo "Test failed: expected $EXPECTED in .mega-linter.yml"
  exit 1
fi