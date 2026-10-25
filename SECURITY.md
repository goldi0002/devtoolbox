# Security Policy

This project is a client-side developer utility app built with React, TypeScript, and Vite. It runs entirely in the browser and does not ship with a backend, database, or remote API layer. User input is processed locally in the browser memory, and no data is transmitted to a server by the application itself.

## Supported versions

The project currently supports the latest version on the default branch and the latest published release. Older branches, archived builds, and unmaintained versions are not actively supported for security fixes.

## Reporting a vulnerability

Please do not open a public GitHub issue for security vulnerabilities.

Instead, report the issue privately through GitHub's Security Advisories for this repository, or contact the maintainer through the repository's GitHub profile contact information if available.

When reporting, please include:
- a clear description of the issue and affected area
- steps to reproduce the problem
- the impact or security consequence
- any proof-of-concept or sample payload if available
- the browser/environment used during reproduction
- relevant file names, routes, or tool names if applicable

## Response expectations

We aim to acknowledge valid reports within 5 business days and begin triage promptly. Once confirmed, we will work to patch the issue and coordinate any required disclosure.

## Disclosure policy

We ask reporters to allow a reasonable time for a fix to be developed and released before public disclosure. In most cases, we will coordinate a fix and then publish a summary once the issue is resolved.

## Security considerations for contributors

- Keep dependencies up to date and review npm audit output regularly.
- Prefer minimal, explicit code paths and avoid introducing remote network requests or backend services.
- Validate user input and protect against unsafe DOM or browser-side execution patterns.
- Do not add analytics, tracking scripts, or third-party telemetry without explicit review.
- Ensure any new utility remains fully client-side and does not depend on hidden server infrastructure.

## Security of this project

Because this application is intentionally client-side and static, the main security concerns are:
- unsafe browser-side code introduced by new tools or dependencies
- dependency vulnerabilities in the frontend stack
- accidental inclusion of external scripts, trackers, or hidden network requests
- insecure handling of user data or credentials in browser memory

If you identify a potential risk, we encourage a responsible private report so it can be addressed before public disclosure.
