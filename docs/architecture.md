# Architecture

## System Overview

The platform is a local-first TypeScript monorepo for auditing, modernizing, documenting, securing, and continuously improving GitHub repositories.

The system is organized into applications and internal packages. Applications consume internal packages, but packages must not depend on applications.

## Monorepo Layout

apps/
api/
dashboard/

packages/
core-types/
github-client/
repo-scanner/
stack-detector/
rule-engine/
llm-service/
modernization-planner/
cleanup-engine/
security-agent/
dependency-agent/
portfolio-agent/
pr-manager/

docs/
scope.md
architecture.md
