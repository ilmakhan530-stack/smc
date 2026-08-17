# Thekedar Work & Payment Module

Implemented in `app/thekedar/page.tsx`.

Rules:
- Thekedar records are independent from Staff/Labour salary and attendance.
- Work total = quantity × rate/piece.
- Advance and payment are separate ledger entries.
- Balance = Total Work - Advance - Payment.
- Positive balance means amount payable and carries into the running balance for the next month.
- Negative balance means extra payment/credit and also carries forward.
- Payment notes are stored and shown in Payment History.
- Paid / Unpaid / Carry Forward status is shown per thekedar.

Firebase collections used:
- `contractors`
- `thekedarWork`
- `thekedarPayments`
