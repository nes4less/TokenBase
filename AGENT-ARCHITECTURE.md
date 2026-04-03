# Agent Orchestration Architecture

> **This file is reference context, not a task.** Defines how messages flow from User → Agent → CLIs.

## The Flow

```
User sends message
    ↓
Agent (orchestrator) receives it
    ├── Acknowledges to User ("Got it, working on it")
    ├── Parses into task list
    ├── Evaluates: can tasks be parallelized across CLIs?
    │   ├── Yes → split into subtasks, assign to available CLIs
    │   └── No → assign to one idle CLI
    ├── Monitors task execution
    │   ├── CLI asks question → Agent sends alert to User
    │   ├── CLI completes → Agent collects result
    │   └── CLI fails → Agent decides: retry? reassign? report?
    └── All tasks done → Agent summarizes and replies to User
```

## Roles

### User
- Sends natural language messages
- Optionally locks project scope (which repos can be edited)
- Receives alerts for questions, status updates, results
- Never talks to CLIs directly

### Agent (Orchestrator)
- Owns the task queue
- Parses messages into structured tasks
- Evaluates task complexity — single CLI or distribute?
- Tracks CLI availability (busy/idle/locked)
- Assigns tasks to idle CLIs
- Relays CLI questions to User as alerts
- Collects results and summarizes for User
- Manages the middle — User never sees raw CLI output

### CLI (Worker)
- Dumb executor — runs what it's told, reports back
- Reports: started, progress, question, complete, failed
- Doesn't decide what to work on — Agent assigns
- Can be locked by a user (reserved for their tasks only)

## Task Lifecycle

```
Message received
    ↓
QUEUED      → Agent parsed it, sitting in queue
    ↓
EVALUATING  → Agent deciding: split? which CLI?
    ↓
ASSIGNED    → Assigned to a specific CLI
    ↓
RUNNING     → CLI is executing
    ↓
WAITING     → CLI asked a question, waiting for User response
    ↓
COMPLETE    → CLI finished, Agent collecting result
  or FAILED → CLI errored, Agent deciding next step
    ↓
REPORTED    → Agent sent summary to User
```

## Queue Agent Behavior

1. **Priority ordering**: urgent > normal > low
2. **FIFO within priority**: first in, first out at same priority
3. **Availability check**: only assign to CLIs where `status = 'idle'`
4. **Locked CLIs**: if a CLI is locked by a user, only that user's tasks get assigned
5. **Task splitting**: if a message contains independent subtasks AND multiple CLIs are idle, distribute. Otherwise, send all to one CLI sequentially.
6. **Stale detection**: if a CLI hasn't heartbeated in 60s, mark it offline and reassign its tasks

## What Changes

### Compose Modal (App)
- Remove CLI selector
- Remove Agent selector  
- Keep: project scope (optional), message body
- "To" is always the Agent — implicit, not shown

### Task Pipeline (App)
- Stop creating `gsd_tasks` directly
- Just create the message — Agent handles the rest

### Daemon
- Agent logic runs in the daemon (or as a separate process)
- Daemon's poll loop becomes: check for assigned tasks for THIS device only
- CLI registration includes capacity (how many concurrent tasks)

### Database
- `gsd_tasks` gets new statuses: queued, evaluating, assigned, waiting, reported
- `gsd_tasks` gets: `assignedCliId`, `parentTaskId` (for subtasks), `queuePosition`
- `gsd_devices` gets: `lockedByUserId`, `maxConcurrent`, `currentLoad`

## Future: Teams & Locking

- Users belong to teams (via Relationship records)
- A team shares a pool of CLIs
- A user can "lock" a CLI — reserves it for their tasks only
- Unlocked CLIs are available to anyone on the team
- Invites: existing team member creates a Handshake → new user accepts → Relationship created

## Phase 1 (Build Now)

1. Simplify compose modal (remove CLI/agent pickers)
2. Agent queue logic in daemon — parse, queue, assign to idle CLI
3. CLI availability tracking (busy/idle based on task status)
4. Sequential assignment (no task splitting yet)
5. Agent acknowledgment message to User
6. Agent summary message on completion

## Phase 2 (Build Later)

1. Task splitting — evaluate independent subtasks
2. Multi-CLI parallel distribution
3. CLI locking per user
4. Team invites and shared CLI pools
5. Agent retry/reassign on failure
