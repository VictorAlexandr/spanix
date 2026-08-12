# Copyright 2026 Victor Fernandes
# SPDX-License-Identifier: Apache-2.0

"""spanix — a local profiler for AI agents.

The data already exists. An agent SDK reports cost, tokens and duration on
every message it streams, exactly once, and the caller's ``for`` loop throws it
away. spanix stops throwing it away::

    from claude_agent_sdk import query
    from spanix import watch, last_run

    stream = query(prompt=p, options=opts)

    async for msg in watch(stream, run="nightly"):
        handle(msg)

    print(last_run().summary())

The message is yielded untouched, so the loop around it does not change.
"""

from __future__ import annotations

from collections import deque
from typing import Any, AsyncIterator, Callable

from ._run import Run

__all__ = ["watch", "last_run", "runs", "Run", "__version__"]
__version__ = "0.0.2"

# Anel curto em memória. O disco (SQLite em ~/.spanix) chega na 0.1, junto com
# o painel; gravar antes disso travaria um schema em público cedo demais.
_RUNS: deque[Run] = deque(maxlen=64)


async def watch(
    stream: AsyncIterator[Any],
    run: str | None = None,
    on_end: Callable[[Run], None] | None = None,
) -> AsyncIterator[Any]:
    """Wrap an async agent stream and account for it, yielding it unchanged.

    Args:
        stream: the async iterator your agent already returns.
        run: a name for this run. Naming it is what later makes it comparable
            to the same run last week.
        on_end: called once with the finished :class:`Run`, even if the stream
            raises. Exceptions raised by it are swallowed.

    Yields:
        Every message from ``stream``, untouched and in order.
    """
    r = Run(name=run)
    try:
        async for msg in stream:
            try:
                r.record(msg)
            except Exception:
                pass  # nunca propagar: bug aqui não pode derrubar o agente
            yield msg
    finally:
        import time

        r.ended_at = time.time()
        _RUNS.append(r)
        if on_end is not None:
            try:
                on_end(r)
            except Exception:
                pass


def last_run() -> Run | None:
    """The most recently finished run, or ``None``."""
    return _RUNS[-1] if _RUNS else None


def runs() -> list[Run]:
    """Finished runs still in memory, oldest first."""
    return list(_RUNS)
