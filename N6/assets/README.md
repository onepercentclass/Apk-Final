# assets/

Static files only. Anything the browser needs at runtime that is not code or
stylesheet lives here.

## img/

Extracted from the five original single-file dashboards, which embedded every
logo as a base64 `data:` URI inside the markup, inside inline `<style>` rules
and inside JS string constants. They are now real files, referenced by a
relative path so they are cacheable and editable.

| file | original source | used by |
| --- | --- | --- |
| `logo-white.png` | `owner.html` / `admin.html` / `headcoach.html` sidebar `.brand-logo` | Owner, Admin, Head Coach |
| `logo-black.png` | same, `.logo-black` variant | Owner, Admin, Head Coach |
| `logo-report.png` | `const LOGO_DATA` in the monthly-report generator | Owner, Admin |
| `logo-report-a4.png` | `printN6Report()` A4 template | Owner, Admin |
| `logo-request-report.png` | `n6-monthly-pdf-reports` coach-request report | Owner, Admin |
| `logo-print-hc.png` | `N6_PRINT_LOGO` canvas export | Head Coach |
| `logo-manual-program.png` | manual program builder export | Head Coach |
| `logo-print-pace.png` | `PACE_PRINT_LOGO` pace calculator export | Head Coach |
| `logo-client-header.png` | `const CLIENT_HEADER_LOGO` | Client |
| `logo-client-print.png` | `const LOGO_B64` (A3 summary JPG) | Client |

Add future imagery to `img/` and reference it from `css/` or `js/`, never as an
inline `data:` URI.