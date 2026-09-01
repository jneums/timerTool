import MigrationTypes "../types";
import Array "mo:base/Array";
import v0_2_0 "types";
import v0_1_0 "../v000_001_000/types";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Time "mo:base/Time";
import D "mo:base/Debug";

module {

  public func upgrade(prevmigration_state : MigrationTypes.State, args : MigrationTypes.Args, _caller : Principal, _canister : Principal) : MigrationTypes.State {
    D.print("=== IN UPGRADE TO v0_2_0 ===" # debug_show (args));
    D.print("prevmigration_state type: " # debug_show (prevmigration_state));

    // Get the previous v0_1_0 state
    let prev_state : v0_1_0.State = switch (prevmigration_state) {
      case (#v0_1_0(#data(state))) {
        D.print("Successfully matched #v0_1_0(#data(state))");
        state;
      };
      case (#v0_1_0(#id)) {
        D.trap("Got #v0_1_0(#id) - cannot upgrade from ID state");
      };
      case (#v0_0_0(_)) {
        D.trap("Got #v0_0_0 - should have been upgraded to v0_1_0 first");
      };
      case (_) {
        D.trap("Cannot upgrade from unknown state to v0_2_0");
      };
    };

    // Rebuild the time tree with v0_2_0 types
    D.print("Rebuilding time tree...");
    let newTimeTree = v0_2_0.BTree.init<v0_2_0.ActionId, v0_2_0.Action>(?32);
    var actionCount = 0;
    for ((actionId, action) in v0_1_0.BTree.entries(prev_state.timeTree)) {
      let newActionId : v0_2_0.ActionId = {
        time = actionId.time;
        id = actionId.id;
      };
      let newAction : v0_2_0.Action = {
        actionType = action.actionType;
        params = action.params;
        aSync = action.aSync;
        retries = action.retries;
      };
      ignore v0_2_0.BTree.insert(newTimeTree, v0_2_0.ActionIdCompare, newActionId, newAction);
      actionCount += 1;
    };
    D.print("Rebuilt " # debug_show (actionCount) # " actions in time tree");

    // Rebuild the action ID index
    let newActionIdIndex = v0_2_0.Map.new<Nat, v0_2_0.Time>();
    for ((id, time) in v0_1_0.Map.entries(prev_state.actionIdIndex)) {
      ignore v0_2_0.Map.put(newActionIdIndex, v0_2_0.Map.nhash, id, time);
    };

    // Migrate to v0_2_0 - add the new reconstitutionTraces field
    let state : v0_2_0.State = {
      timeTree = newTimeTree;
      actionIdIndex = newActionIdIndex;
      var nextTimer = prev_state.nextTimer;
      var lastExecutionTime = prev_state.lastExecutionTime;
      var expectedExecutionTime = prev_state.expectedExecutionTime;
      var maxExecutions = prev_state.maxExecutions;
      var timerLock = prev_state.timerLock;
      var nextActionId = prev_state.nextActionId;
      var maxExecutionDelay = prev_state.maxExecutionDelay;
      var lastActionIdReported = prev_state.lastActionIdReported;
      var lastCycleReport = prev_state.lastCycleReport;
      var nextCycleActionId = prev_state.nextCycleActionId;
      var reconstitutionTraces = [{
        timestamp = Int.abs(Time.now());
        migratedFrom = "v0_1_0";
        migratedTo = "v0_2_0";
        actionsRestored = v0_2_0.BTree.size(newTimeTree);
        timersRestored = v0_2_0.BTree.size(newTimeTree);
        validationPassed = true;
        errors = [];
      }];
    };

    D.print("=== SUCCESSFULLY CREATED v0_2_0 STATE ===");
    return #v0_2_0(#data(state));
  };

};
