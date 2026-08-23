# DevToolbox Documentation

Welcome to the DevToolbox documentation site. This documentation is built with MkDocs and the Material theme and is deployed to GitHub Pages via the .github/workflows/mkdocs.yml workflow.

This site contains architecture notes, the design system, roadmap, and current tasks for the Toolbox4Devs project.

Quick links

- [Architecture](ARCHITECTURE.md)
- [Design System](DESIGN.md)
- [Roadmap](ROADMAP.md)
- [Tasks & Backlog](TASKS.md)

How to edit

- The docs live in the docs/ directory. Edit files and push to the main branch to trigger the MkDocs deploy workflow.
- To preview locally:
  - python -m pip install --upgrade pip
  - pip install mkdocs mkdocs-material
  - mkdocs serve

If the GitHub Pages site shows a 404 after these changes, open the Actions tab and inspect the "Deploy MkDocs to GitHub Pages" workflow run for build/deploy errors.
