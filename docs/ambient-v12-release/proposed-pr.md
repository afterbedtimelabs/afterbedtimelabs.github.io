# Proposed title

Integrate accepted Ambient Homepage V1.2 for release review

# Proposed description

This candidate brings the owner-accepted nighttime workshop to the public portfolio while retaining all existing URLs, articles, projects, Riku/Navi and privacy information. Tinker rests in the approved pose; rain, steam and the subtle circuit-board bulb remain animated. One persistent music player carries Window seat across portfolio navigation, with synchronized Home/interior controls and silent fresh loads.

The candidate descends from current main `05431e62db6077c302c265a7a7ede0410c0e72d6` through the approved V3.4 and Ambient V1/V1.1/V1.2 lineage. Accepted application source: `ba475f7377c7d75a315a88714c6b1658c6cec621`; owner-acceptance closeout: `d972b1dbd0d48e05b03fd5537a6a4b152603018c`. PRs #3 and #5 contain superseded Tinker implementations and are not merged by this change.

Production application/assets remain unchanged from the accepted source. Integration adds release audit/browser coverage, separate evidence output and a production-preview launcher. The dependency lockfile and validation/deployment workflows are unchanged from main. All artwork, original music and prior review evidence are preserved.

Validation: clean `npm ci`; complete `npm run validate` passed; 24 HTML documents verified; 15/15 simulated legacy controller scenarios; exact mascot/showcase assets; 67 real-browser checks each in Edge 157 and Chrome 156; all 95 built files served correctly; all 22 current indexed URLs retained. Music continuity is instrumented through persistent player identity, clock progression and absence of reload/buffering events. Integration browsers were muted; no new listening claim is made.

Keep this PR **draft** until the integrated commit passes GitHub Linux CI and release gates are resolved. Local evidence does not substitute for remote CI. Outstanding: inherited npm advisories (two high, one moderate), Pages/environment settings verification, browser support decision for untested Safari/Firefox/physical mobile, and review of existing icon provenance/notices. Main currently has no branch protection/rulesets.

This PR does not authorize publication. Deployment remains a separately authorized, manually initiated workflow on main with `site_url=https://afterbedtimelabs.dev`. Rollback is a reviewed forward revert on main followed by the same manual validation/deploy procedure. See `docs/ambient-v12-release/README.md` and `rollback.md`.

---

Prepared locally only. No remote PR was created. Substitute the final pushed commit in the PR's release decision record after authorization; do not reuse a green run from an older PR.
