How to run test?
===================
To run test run command "npm test" in terminal 

Different ways to run tests
============================
There are following ways to run the tests:
"npm test": 
    Use this command when you just want to run the tests and don't want any debug output.
    This does not provide any debugging information.
"npm run-script verboseTest": 
    When you want to see the console output in terminal. This also gives more debugging information
     for your investigation. Use this when tests are failing and you want to investigate it.
"npm run-script failFirstTest":
    With this command the jest will stop on the first test suite which has failing tests. Use this
    when you have many test failures and you want to debug it one by one. This also have verbose output.
    This work per testsuite basis and not per test basis hence if first tests from the testsuite fails
    it still run all the remaining tests from the same testsuite.


POINT TO NOTE
==============
- We only run tests from "./tests/" folder, if you want to run tests from other folder then you need to
  change commands [test, verboseTest etc.] from package.json and "jest":{"testPathIgnorePatterns"} 
  configuration in package.json.
- 
