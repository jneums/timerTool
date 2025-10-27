export const idlFactory = ({ IDL }) => {
  const Time = IDL.Nat;
  const ActionId = IDL.Record({ 'id' : IDL.Nat, 'time' : Time });
  const Action = IDL.Record({
    'aSync' : IDL.Opt(IDL.Nat),
    'actionType' : IDL.Text,
    'params' : IDL.Vec(IDL.Nat8),
    'retries' : IDL.Nat,
  });
  const ArgList = IDL.Record({
    'nextCycleActionId' : IDL.Opt(IDL.Nat),
    'maxExecutions' : IDL.Opt(IDL.Nat),
    'nextActionId' : IDL.Nat,
    'lastActionIdReported' : IDL.Opt(IDL.Nat),
    'lastCycleReport' : IDL.Opt(IDL.Nat),
    'initialTimers' : IDL.Vec(IDL.Tuple(ActionId, Action)),
    'expectedExecutionTime' : Time,
    'lastExecutionTime' : Time,
  });
  const Args = IDL.Opt(ArgList);
  const ActionRequest = IDL.Record({
    'actionType' : IDL.Text,
    'params' : IDL.Vec(IDL.Nat8),
  });
  const ActionDetail = IDL.Tuple(ActionId, Action);
  const TimerId = IDL.Nat;
  const Stats = IDL.Record({
    'timers' : IDL.Nat,
    'maxExecutions' : IDL.Nat,
    'minAction' : IDL.Opt(ActionDetail),
    'cycles' : IDL.Nat,
    'nextActionId' : IDL.Nat,
    'nextTimer' : IDL.Opt(TimerId),
    'expectedExecutionTime' : IDL.Opt(Time),
    'lastExecutionTime' : Time,
  });
  const ActionFilter = IDL.Variant({
    'All' : IDL.Null,
    'ByActionId' : IDL.Nat,
    'ByType' : IDL.Text,
    'ByTimeRange' : IDL.Tuple(Time, Time),
    'ByRetryCount' : IDL.Nat,
  });
  const CancellationResult = IDL.Record({
    'cancelled' : IDL.Vec(ActionId),
    'errors' : IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Text)),
    'notFound' : IDL.Vec(IDL.Nat),
  });
  const ReconstitutionTrace = IDL.Record({
    'errors' : IDL.Vec(IDL.Text),
    'actionsRestored' : IDL.Nat,
    'timestamp' : Time,
    'migratedTo' : IDL.Text,
    'migratedFrom' : IDL.Text,
    'timersRestored' : IDL.Nat,
    'validationPassed' : IDL.Bool,
  });
  const TimerDiagnostics = IDL.Record({
    'pendingActions' : IDL.Nat,
    'totalActions' : IDL.Nat,
    'overdueActions' : IDL.Nat,
    'lockStatus' : IDL.Opt(Time),
    'currentTime' : Time,
    'lastExecutionDelta' : IDL.Int,
    'nextExecutionDelta' : IDL.Opt(IDL.Int),
    'systemTimerStatus' : IDL.Opt(TimerId),
  });
  const TimerTool = IDL.Service({
    '__timer_tool_init_' : IDL.Func([], [], []),
    'add_action' : IDL.Func(
        [IDL.Nat, ActionRequest],
        [
          IDL.Record({
            'timerStats' : Stats,
            'currentCounter' : IDL.Nat,
            'actionId' : ActionId,
          }),
        ],
        [],
      ),
    'add_action_async' : IDL.Func(
        [IDL.Nat, ActionRequest],
        [
          IDL.Record({
            'timerStats' : Stats,
            'currentCounter' : IDL.Nat,
            'actionId' : ActionId,
          }),
        ],
        [],
      ),
    'cancel_action' : IDL.Func(
        [IDL.Nat],
        [
          IDL.Record({
            'result' : IDL.Opt(IDL.Nat),
            'timerStats' : Stats,
            'currentCounter' : IDL.Nat,
          }),
        ],
        [],
      ),
    'cancel_actions_by_filter' : IDL.Func(
        [ActionFilter],
        [CancellationResult],
        [],
      ),
    'cancel_actions_by_ids' : IDL.Func(
        [IDL.Vec(IDL.Nat)],
        [CancellationResult],
        [],
      ),
    'clear_reconstitution_traces' : IDL.Func([], [], []),
    'emergency_clear_all_timers' : IDL.Func([], [IDL.Nat], []),
    'force_release_lock' : IDL.Func([], [IDL.Opt(IDL.Nat)], []),
    'force_system_timer_cancel' : IDL.Func([], [IDL.Bool], []),
    'get_actions_by_filter' : IDL.Func(
        [ActionFilter],
        [IDL.Vec(ActionDetail)],
        ['query'],
      ),
    'get_counter' : IDL.Func([], [IDL.Nat], ['query']),
    'get_lastActionIdReported' : IDL.Func([], [IDL.Opt(IDL.Nat)], ['query']),
    'get_latest_reconstitution_trace' : IDL.Func(
        [],
        [IDL.Opt(ReconstitutionTrace)],
        ['query'],
      ),
    'get_reconstitution_traces' : IDL.Func(
        [],
        [IDL.Vec(ReconstitutionTrace)],
        ['query'],
      ),
    'get_stats' : IDL.Func([], [Stats], ['query']),
    'get_timer_diagnostics' : IDL.Func([], [TimerDiagnostics], ['query']),
    'hello' : IDL.Func([], [IDL.Nat], ['query']),
    'hello_world' : IDL.Func([], [IDL.Text], []),
    'incremote' : IDL.Func([IDL.Nat], [], []),
    'trap' : IDL.Func([], [], []),
    'update_collector' : IDL.Func([IDL.Text], [], []),
    'update_max_executions' : IDL.Func([IDL.Nat], [], []),
    'validate_timer_state' : IDL.Func([], [IDL.Vec(IDL.Text)], []),
  });
  return TimerTool;
};
export const init = ({ IDL }) => {
  const Time = IDL.Nat;
  const ActionId = IDL.Record({ 'id' : IDL.Nat, 'time' : Time });
  const Action = IDL.Record({
    'aSync' : IDL.Opt(IDL.Nat),
    'actionType' : IDL.Text,
    'params' : IDL.Vec(IDL.Nat8),
    'retries' : IDL.Nat,
  });
  const ArgList = IDL.Record({
    'nextCycleActionId' : IDL.Opt(IDL.Nat),
    'maxExecutions' : IDL.Opt(IDL.Nat),
    'nextActionId' : IDL.Nat,
    'lastActionIdReported' : IDL.Opt(IDL.Nat),
    'lastCycleReport' : IDL.Opt(IDL.Nat),
    'initialTimers' : IDL.Vec(IDL.Tuple(ActionId, Action)),
    'expectedExecutionTime' : Time,
    'lastExecutionTime' : Time,
  });
  const Args = IDL.Opt(ArgList);
  return [Args];
};
