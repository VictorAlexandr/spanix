"""Accounting for one agent run.

Design constraints, in order of importance:

1. **Never break the caller.** Every recording path is wrapped, and the message
   is always yielded untouched. A profiler that takes down production is a
   profiler nobody installs.
2. **Never import the agent SDK.** Fields are read positionally by name with
   ``getattr``/``__getitem__`` fallbacks, so ``pip install spanix`` does not
   drag a dependency in, and a second runtime is just another name list.
3. **Never keep content.** Prompts, tool arguments and tool results carry API
   keys and customer data. Only counters and tool names are kept.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Any

# Candidate field names. Runtimes disagree on spelling, and this file must not
# import any of them to find out, so every value is looked up across a list.
_COST = ("total_cost_usd", "cost_usd", "total_cost")
_TURNS = ("num_turns", "turns")
_IN = ("input_tokens", "prompt_tokens", "in_tokens")
_OUT = ("output_tokens", "completion_tokens", "out_tokens")
_CACHE = ("cache_read_input_tokens", "cache_creation_input_tokens", "cached_tokens")


def _dig(obj: Any, names: tuple[str, ...]) -> Any:
    """First present attribute or mapping key out of ``names``."""
    for n in names:
        v = getattr(obj, n, None)
        if v is None and isinstance(obj, dict):
            v = obj.get(n)
        if v is not None:
            return v
    return None


def _num(obj: Any, names: tuple[str, ...]) -> float:
    v = _dig(obj, names)
    return float(v) if isinstance(v, (int, float)) else 0.0


@dataclass
class Run:
    """Counters for a single agent run. No message content is ever stored."""

    name: str | None = None
    started_at: float = field(default_factory=time.time)
    ended_at: float | None = None

    messages: int = 0
    turns: int = 0
    cost_usd: float = 0.0
    in_tokens: int = 0
    out_tokens: int = 0
    cache_tokens: int = 0
    tools: dict[str, int] = field(default_factory=dict)

    @property
    def duration_s(self) -> float:
        return (self.ended_at or time.time()) - self.started_at

    @property
    def total_tokens(self) -> int:
        return self.in_tokens + self.out_tokens + self.cache_tokens

    def record(self, msg: Any) -> None:
        """Fold one streamed message into the counters."""
        self.messages += 1

        # Tool calls live inside the content blocks of an assistant message.
        blocks = _dig(msg, ("content",))
        if isinstance(blocks, (list, tuple)):
            for b in blocks:
                tipo = _dig(b, ("type",))
                nome = _dig(b, ("name",))
                if nome and (tipo in (None, "tool_use") or "ToolUse" in type(b).__name__):
                    self.tools[str(nome)] = self.tools.get(str(nome), 0) + 1

        # Cost and turn count arrive as RUN TOTALS on the terminal message, not
        # as deltas. Summing them would multiply the bill by the message count,
        # so they are folded with max().
        self.cost_usd = max(self.cost_usd, _num(msg, _COST))
        self.turns = max(self.turns, int(_num(msg, _TURNS)))

        usage = _dig(msg, ("usage",))
        if usage is not None:
            self.in_tokens = max(self.in_tokens, int(_num(usage, _IN)))
            self.out_tokens = max(self.out_tokens, int(_num(usage, _OUT)))
            self.cache_tokens = max(self.cache_tokens, int(_num(usage, _CACHE)))

    def summary(self) -> str:
        cab = f"spanix · {self.name}" if self.name else "spanix"
        linhas = [
            f"{cab}  {self.duration_s:.1f}s",
            f"  cost      ${self.cost_usd:.4f}",
            f"  tokens    {self.total_tokens:,} "
            f"(in {self.in_tokens:,} · out {self.out_tokens:,} · cache {self.cache_tokens:,})",
            f"  turns     {self.turns}",
            f"  messages  {self.messages}",
        ]
        if self.tools:
            chamadas = ", ".join(f"{k} ×{v}" for k, v in sorted(self.tools.items()))
            linhas.append(f"  tools     {chamadas}")
        return "\n".join(linhas)
