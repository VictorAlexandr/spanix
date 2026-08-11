# spanix

**A local profiler for AI agents.** One line, no account, no server.

An agent SDK reports cost, tokens and duration on every message it streams.
It reports them exactly once, and the caller's `for` loop throws them away.
spanix stops throwing them away.

```python
from claude_agent_sdk import query
from spanix import watch, last_run

stream = query(prompt=p, options=opts)

async for msg in watch(stream, run="nightly"):
    handle(msg)

print(last_run().summary())
```

```
spanix · nightly  22.6s
  cost      $0.6512
  tokens    206,431 (in 184,220 · out 8,911 · cache 13,300)
  turns     11
  messages  38
  tools     Read ×1, WebFetch ×5, Grep ×1
```

The message is yielded untouched, so the loop around it does not change.

## Design

**It never breaks your agent.** Every recording path is wrapped in its own
`try`, and the message is always yielded. A profiler that takes down production
is a profiler nobody installs.

**It never imports your agent SDK.** Fields are read by name with fallbacks, so
`pip install spanix` pulls in nothing, and supporting a second runtime is just
another list of names. There are zero dependencies.

**It never keeps content.** Prompts, tool arguments and tool results carry API
keys and customer data. Only counters and tool names are stored.

## Status

`0.0.1` is the accounting core: `watch()`, in-memory `Run` records and
`summary()`. Nothing is written to disk and nothing is sent anywhere.

Next: SQLite at `~/.spanix/runs.db`, the subagent tree with cost rolled up per
node, and a panel on `localhost`.

## License

Apache-2.0
