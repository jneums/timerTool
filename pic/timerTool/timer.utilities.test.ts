import { IDL } from "@dfinity/candid";

import {
  PocketIc,
  createIdentity,
} from "@dfinity/pic";

import type {
  CanisterFixture
} from "@dfinity/pic";

import {idlFactory as timersIDLFactory,
  init as timerInit } from "../../src/declarations/timer/timer.did.js";
import type {
  _SERVICE as TimerService,
  ActionRequest,
  ActionFilter } from "../../src/declarations/timer/timer.did.d";

const sub_WASM_PATH = ".dfx/local/canisters/timer/timer.wasm";

let pic: PocketIc;
let timer_fixture: CanisterFixture<TimerService>;

const admin = createIdentity("admin");
const OneMinute = BigInt(60000000000); // 1 minute in Nanoseconds

describe("test timer utilities - reconstitution tracing", () => {
  beforeAll(async () => {
    pic = await PocketIc.create(process.env.PIC_URL);

    await pic.setTime(new Date(2024, 1, 30).getTime());
    await pic.tick();
    await pic.tick();

    timer_fixture = await pic.setupCanister<TimerService>({
      idlFactory: timersIDLFactory,
      wasm: sub_WASM_PATH,
      arg: IDL.encode(timerInit({IDL}), [[]]),
    });
  });

  afterAll(async () => {
    await pic?.tearDown();
  });

  it('should track reconstitution traces for fresh initialization', async () => {
    timer_fixture.actor.setIdentity(admin);

    // Get reconstitution traces
    const traces = await timer_fixture.actor.get_reconstitution_traces();
    console.log("Reconstitution traces:", traces);

    expect(traces.length).toBeGreaterThan(0);
    expect(traces[0].migratedFrom).toBe("v0_0_0");
    expect(traces[0].migratedTo).toBe("v0_1_0");
    expect(traces[0].validationPassed).toBe(true);
    expect(traces[0].actionsRestored).toBe(0n);
  });

  it('should validate timer state successfully', async () => {
    timer_fixture.actor.setIdentity(admin);

    const validationErrors = await timer_fixture.actor.validate_timer_state();
    console.log("Validation errors:", validationErrors);

    expect(validationErrors).toEqual([]);
  });

  it('should get timer diagnostics', async () => {
    timer_fixture.actor.setIdentity(admin);

    const diagnostics = await timer_fixture.actor.get_timer_diagnostics();
    console.log("Timer diagnostics:", diagnostics);

    expect(diagnostics.totalActions).toBe(0n);
    expect(diagnostics.pendingActions).toBe(0n);
    expect(diagnostics.overdueActions).toBe(0n);
  });
});

describe("test timer utilities - cancellation", () => {
  beforeAll(async () => {
    pic = await PocketIc.create(process.env.PIC_URL);

    await pic.setTime(new Date(2024, 1, 30).getTime());
    await pic.tick();

    timer_fixture = await pic.setupCanister<TimerService>({
      idlFactory: timersIDLFactory,
      wasm: sub_WASM_PATH,
      arg: IDL.encode(timerInit({IDL}), [[]]),
    });
  });

  afterAll(async () => {
    await pic?.tearDown();
  });

  it('should cancel actions by filter', async () => {
    timer_fixture.actor.setIdentity(admin);

    let currentTime = BigInt(Math.floor((await pic.getTime())) * 1000000);

    // Add some test actions
    const action1: ActionRequest = {
      actionType: "inc",
      params: new Uint8Array(IDL.encode([IDL.Nat], [10]))
    };
    const action2: ActionRequest = {
      actionType: "test_action",
      params: new Uint8Array(IDL.encode([IDL.Nat], [20]))
    };

    await timer_fixture.actor.add_action(currentTime + OneMinute, action1);
    await timer_fixture.actor.add_action(currentTime + OneMinute * 2n, action2);

    await pic.tick();

    // Get stats before cancellation
    const statsBefore = await timer_fixture.actor.get_stats();
    expect(statsBefore.timers).toBe(2n);

    // Cancel actions by type filter
    const filter: ActionFilter = { ByType: "inc" };
    const result = await timer_fixture.actor.cancel_actions_by_filter(filter);
    
    console.log("Cancellation result:", result);
    expect(result.cancelled.length).toBe(1);
    expect(result.notFound.length).toBe(0);

    // Check stats after cancellation
    const statsAfter = await timer_fixture.actor.get_stats();
    expect(statsAfter.timers).toBe(1n);
  });

  it('should perform emergency clear of all timers', async () => {
    timer_fixture.actor.setIdentity(admin);

    let currentTime = BigInt(Math.floor((await pic.getTime())) * 1000000);

    // Add multiple actions
    for (let i = 0; i < 3; i++) {
      const action: ActionRequest = {
        actionType: "inc",
        params: new Uint8Array(IDL.encode([IDL.Nat], [i]))
      };
      await timer_fixture.actor.add_action(currentTime + OneMinute * BigInt(i + 1), action);
    }

    await pic.tick();

    // Verify actions were added (plus 1 remaining from previous test)
    const statsBefore = await timer_fixture.actor.get_stats();
    expect(statsBefore.timers).toBe(4n);

    // Emergency clear
    const clearedCount = await timer_fixture.actor.emergency_clear_all_timers();
    console.log("Cleared count:", clearedCount);
    expect(clearedCount).toBe(4n);

    // Verify all timers are cleared
    const statsAfter = await timer_fixture.actor.get_stats();
    expect(statsAfter.timers).toBe(0n);
  });
});