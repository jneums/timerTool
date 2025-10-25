import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Action {
  'aSync' : [] | [bigint],
  'actionType' : string,
  'params' : Uint8Array | number[],
  'retries' : bigint,
}
export type ActionDetail = [ActionId, Action];
export type ActionFilter = { 'All' : null } |
  { 'ByActionId' : bigint } |
  { 'ByType' : string } |
  { 'ByTimeRange' : [Time, Time] } |
  { 'ByRetryCount' : bigint };
export interface ActionId { 'id' : bigint, 'time' : Time }
export interface ActionRequest {
  'actionType' : string,
  'params' : Uint8Array | number[],
}
export interface ArgList {
  'nextCycleActionId' : [] | [bigint],
  'maxExecutions' : [] | [bigint],
  'nextActionId' : bigint,
  'lastActionIdReported' : [] | [bigint],
  'lastCycleReport' : [] | [bigint],
  'initialTimers' : Array<[ActionId, Action]>,
  'expectedExecutionTime' : Time,
  'lastExecutionTime' : Time,
}
export type Args = [] | [ArgList];
export interface CancellationResult {
  'cancelled' : Array<ActionId>,
  'errors' : Array<[bigint, string]>,
  'notFound' : Array<bigint>,
}
export interface ReconstitutionTrace {
  'errors' : Array<string>,
  'actionsRestored' : bigint,
  'timestamp' : Time,
  'migratedTo' : string,
  'migratedFrom' : string,
  'timersRestored' : bigint,
  'validationPassed' : boolean,
}
export interface Stats {
  'timers' : bigint,
  'maxExecutions' : bigint,
  'minAction' : [] | [ActionDetail],
  'cycles' : bigint,
  'nextActionId' : bigint,
  'nextTimer' : [] | [TimerId],
  'expectedExecutionTime' : [] | [Time],
  'lastExecutionTime' : Time,
}
export type Time = bigint;
export interface TimerDiagnostics {
  'pendingActions' : bigint,
  'totalActions' : bigint,
  'overdueActions' : bigint,
  'lockStatus' : [] | [Time],
  'currentTime' : Time,
  'lastExecutionDelta' : bigint,
  'nextExecutionDelta' : [] | [bigint],
  'systemTimerStatus' : [] | [TimerId],
}
export type TimerId = bigint;
export interface TimerTool {
  '__timer_tool_init_' : ActorMethod<[], undefined>,
  'add_action' : ActorMethod<
    [bigint, ActionRequest],
    { 'timerStats' : Stats, 'currentCounter' : bigint, 'actionId' : ActionId }
  >,
  'add_action_async' : ActorMethod<
    [bigint, ActionRequest],
    { 'timerStats' : Stats, 'currentCounter' : bigint, 'actionId' : ActionId }
  >,
  'cancel_action' : ActorMethod<
    [bigint],
    {
      'result' : [] | [bigint],
      'timerStats' : Stats,
      'currentCounter' : bigint,
    }
  >,
  'cancel_actions_by_filter' : ActorMethod<[ActionFilter], CancellationResult>,
  'cancel_actions_by_ids' : ActorMethod<[Array<bigint>], CancellationResult>,
  'clear_reconstitution_traces' : ActorMethod<[], undefined>,
  'emergency_clear_all_timers' : ActorMethod<[], bigint>,
  'force_release_lock' : ActorMethod<[], [] | [bigint]>,
  'force_system_timer_cancel' : ActorMethod<[], boolean>,
  'get_actions_by_filter' : ActorMethod<[ActionFilter], Array<ActionDetail>>,
  'get_counter' : ActorMethod<[], bigint>,
  'get_lastActionIdReported' : ActorMethod<[], [] | [bigint]>,
  'get_latest_reconstitution_trace' : ActorMethod<
    [],
    [] | [ReconstitutionTrace]
  >,
  'get_reconstitution_traces' : ActorMethod<[], Array<ReconstitutionTrace>>,
  'get_stats' : ActorMethod<[], Stats>,
  'get_timer_diagnostics' : ActorMethod<[], TimerDiagnostics>,
  'hello' : ActorMethod<[], bigint>,
  'hello_world' : ActorMethod<[], string>,
  'incremote' : ActorMethod<[bigint], undefined>,
  'trap' : ActorMethod<[], undefined>,
  'update_collector' : ActorMethod<[string], undefined>,
  'update_max_executions' : ActorMethod<[bigint], undefined>,
  'validate_timer_state' : ActorMethod<[], Array<string>>,
}
export interface _SERVICE extends TimerTool {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
