# Running PIC Tests

## Running Tests

To run all PIC tests from the root of the project:

```bash
npm test
```

Or run a specific test file:

```bash
npx jest --config pic/jest.config.ts ./pic/timerTool/timer.test.ts --forceExit
```

## Test Structure

The test suite includes:
- `timer.test.ts` - Synchronous timer operations (14 tests)
- `timer.async.test.ts` - Asynchronous timer operations (10 tests)
- `timer.utilities.test.ts` - Utility functions for tracing and cancellation (5 tests)

## General Strategies

PIC.js is great for setting up a controlled test environment with strict control over the network. You manage rounds, cycles, and system time explicitly, so avoid relying on assumptions.

### Key Points:
- If a canister needs to call another canister, you may need to run `pic.tick()` before everything settles
- Each canister gets an actor object for easy interaction
- Set identity before making calls: `canister.actor.setIdentity(admin)`
- Then call methods easily: `await canister.actor.methodName(args)`


## Setup and Tear Down

Setup and teardown before each test takes some time. Consider a more global setup if you don't need fresh state for every test, though this depends on what you're testing (still faster than dfx).

## Debugging

VS Code debugging configuration for Jest tests:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Current File",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "${fileBasenameNoExtension}",
        "--config",
        "${workspaceFolder}/pic/jest.config.ts",
        "--runInBand"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## Print/Debug Output

For getting debug print lines to output to the console, see this forum post:

https://forum.dfinity.org/t/announcing-picjs-typescript-javascript-support-for-pocketic/24479/20?u=skilesare

## Resources

- [PIC.js GitHub](https://github.com/hadronous/pic-js/tree/main)
- [PIC.js Source Code](https://github.com/hadronous/pic-js/blob/main/packages/pic/src/pocket-ic.ts) - Best documentation for available functions
- [PIC.js Examples](https://github.com/hadronous/pic-js/tree/main/examples)
