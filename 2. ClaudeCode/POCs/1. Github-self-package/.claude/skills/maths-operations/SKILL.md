---
name: maths-operations
description: Use when performing arithmetic, algebra, unit conversions, percentages, or any numeric calculation — covers precision pitfalls, rounding rules, and which tool to use for reliable results.
---

# Maths Operations

## Overview
A reference for doing numeric calculations reliably: pick the right tool, avoid floating-point surprises, and apply correct rounding and order-of-operations.

**Core principle:** Don't do math in your head for anything non-trivial. Use a real calculator (Python, Node, or `bc`) and state the formula before computing.

## When to Use
- Arithmetic, algebra, or multi-step calculations
- Percentages, ratios, discounts, tax, interest
- Unit / currency / time conversions
- Verifying a number someone else computed

**When NOT to use:** Pure symbolic math proofs, or statistics/probability beyond basic operations (use a dedicated statistics skill or library).

## Quick Reference

| Operation | Command example (Python) |
|---|---|
| Basic arithmetic | `python -c "print(2+3*4)"` |
| Percentage of X | `python -c "print(15/100*250)"` |
| Percent change | `python -c "print((new-old)/old*100)"` |
| Rounding to N dp | `python -c "print(round(3.14159, 2))"` |
| Integer division | `python -c "print(7//2, 7%2)"` |
| Power / roots | `python -c "print(2**10, 64**0.5)"` |

## Implementation

**Step 1 — State the formula.** Write what you're computing before running it. This catches wrong-operator and order-of-operations mistakes.

**Step 2 — Use a tool, not mental math.**

```bash
# Python (preferred — decimals, fractions, math module all available)
python -c "print((250 - 200) / 200 * 100)"   # → 25.0 (percent change)

# Node
node -e "console.log((250 - 200) / 200 * 100)"

# bc (POSIX)
echo "scale=4; 2/3" | bc
```

**Step 3 — Sanity-check the result.** Is the magnitude plausible? Does the sign match expectation? Re-derive with a different method if it matters.

## Common Mistakes

| Mistake | Why it happens | Fix |
|---|---|---|
| Floating-point error (`0.1+0.2=0.30000000000000004`) | Binary floats can't represent most decimals | Use `decimal.Decimal` for money: `Decimal('0.1')+Decimal('0.2')` |
| Wrong order of operations | Reading `a+b*c` as `(a+b)*c` | Add explicit parentheses; state formula first |
| Integer division truncation | `7/2` varies by language | Python `/` is float; use `//` for int division. Watch JS: `7/2=3.5` |
| Rounding the wrong direction | `round()` uses banker's rounding in Py3 | For money use `Decimal.quantize`; never round mid-chain |
| Chaining rounded values | Each round compounds error | Round only the final output |
| Percentage base confusion | "% off" vs "% of" mixups | Label the base explicitly: `discount = price * rate` |

## Money & Precision Pattern

For anything involving currency, never use raw floats — they accumulate error:

```python
from decimal import Decimal, ROUND_HALF_UP

price = Decimal('19.99')
tax  = Decimal('0.08')
total = (price * (1 + tax)).quantize(Decimal('0.01'), ROUND_HALF_UP)
print(total)  # 21.59 — exact, no float drift
```

## Red Flags — Recompute Before Trusting
- A result that "looks round" — verify, don't assume
- Mixing `int` and `float` in one expression
- Dividing by a variable without checking for zero
- Comparing floats with `==` (use a tolerance or `math.isclose`)