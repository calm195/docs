#!/usr/bin/env python3
"""Minimal local gate checks; not a semantic validator."""
from pathlib import Path
import sys
root = Path(__file__).resolve().parents[1]
checks = {
 'G1': ['requirements/original.md','requirements/baseline.md','reviews/requirements-review.md','approvals/G1.md'],
 'G2': ['approvals/G1.md','design/options.md','approvals/G2.md'],
 'G3': ['approvals/G1.md','approvals/G2.md','design/architecture.md','design/database.md','design/api.md','reviews/architecture-review.md','approvals/G3.md'],
}
if len(sys.argv)!=2 or sys.argv[1] not in checks:
 print('Usage: python3 scripts/check_gate.py G1|G2|G3');sys.exit(2)
gate=sys.argv[1]; errors=[]
for name in checks[gate]:
 p=root/name
 if not p.is_file() or not p.read_text(encoding='utf-8').strip(): errors.append(f'missing/empty: {name}')
for g in ['G1','G2','G3'][:['G1','G2','G3'].index(gate)+1]:
 p=root/f'approvals/{g}.md'
 if p.is_file() and '批准' not in p.read_text(encoding='utf-8'):errors.append(f'approval not explicit: {p.relative_to(root)}')
print(('PASS' if not errors else 'FAIL')+f' {gate} (structural check only)')
for e in errors: print(' -',e)
sys.exit(bool(errors))
