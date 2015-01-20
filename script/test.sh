#!/bin/sh

# Canonical dir
cd "$(dirname $0)/../"

# Args
no_coverage=0
selenium_driver=''
fast=0

set_arg=''
for var in "$@"
do

  if [ -n "$set_arg" ]; then
    if [[ $var == --* ]]; then
      ls >/dev/null # My bash-fu is weak
    else
      eval $set_arg=$var
    fi
  fi

  set_arg=''

  if [ $var == '--no-coverage' ]; then
    no_coverage=1
  elif [ $var == '--fast' ]; then
    fast=1
  elif [ $var == '--with-selenium' ]; then
    set_arg='selenium_driver'
    selenium_driver="http://localhost:4444/wd/hub"
  else
    echo ''
    echo "Unknown option $var"
    echo ''
  fi
done

# Coverage setup
coverage_init_hook="_coverage_init_hook.js"
coverage_dir=$COVERAGE_DIR

# Use temp coverage dir if needed
if [ -z "$coverage_dir" ]; then
  coverage_dir=`mktemp -d -t vizifyXXXXXXXX`
fi

# Defaults
covreage_opts=""
export NODE_PATH=./lib

# Coverage setup
if [ $no_coverage -eq 0 ]; then

  # Generate the coverage-checking version of lib and run tests against it
  ./node_modules/.bin/istanbul instrument -x "lib/browser/*" --no-compact --complete-copy --output ./lib-cov ./lib >/dev/null
  export NODE_PATH=./lib-cov

  # Clear the coverage dir
  rm -rf ./$coverage_dir/* >/dev/null 2>&1

  # Create a temporary file that will dump coverage info
  echo "
    var fs = require('fs');
    exports.initialize = function(callback) {
      var filename = '$coverage_dir/coverage' + process.pid + '.json';
      process.on('exit', function() {
        fs.writeFileSync(filename, JSON.stringify(__coverage__), {encoding: 'utf8'});
      });
      callback();
    };
  " >$coverage_init_hook

  # Prep for coverage
  coverage_opts="-ti $PWD/$coverage_init_hook --coverage --coverage-no-regen --coverage-reporter json --coverage-file /dev/null"
fi

# Run node.js tests
test_dir=${TEST_RESULTS_DIR:-$TEST_DIR}
files=`find test -name \\*.js | grep -v '/util' | grep -v '/browser' | xargs echo`
test_opts="--concurrency 10"
if [ -n "$test_dir" ]; then
  node_modules/.bin/whiskey $coverage_opts $test_opts --test-reporter cli --independent-tests "$files" | sed "s/^[ \t]*//" | tee ${test_dir}/results.tap
else
  mode='--tests'
  if [ $fast -ne 0 ]; then
    mode='--independent-tests'
  fi
  node_modules/.bin/whiskey $coverage_opts $test_opts $mode "$files"
fi

# Kill istanbul'd lib contents
rm -rf ./lib-cov

# Wrap up the coverage work
if [ $no_coverage -eq 0 ]; then
  # Remove temp coverage file
  rm ./$coverage_init_hook

  # Run the istanbul report.  Use html output format if we're asked to
  # save the coverage output, otherwise report to console.
  mode="text"
  if [ -n "$COVERAGE_DIR" ]; then
    mode="lcov"
  fi
  ./node_modules/.bin/istanbul report --root $coverage_dir --dir $coverage_dir $mode

  # Clean up after temp coverage dir if we're using it
  if [ -z "$COVERAGE_DIR" ]; then
    rm -rf ./$coverage_dir
  else
    echo ""
    echo "Coverage output saved at $COVERAGE_DIR/index.html"
    echo ""
  fi
fi
