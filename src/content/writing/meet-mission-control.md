---
title: "Mission Control: keeping an eye on the experiments"
description: "From watching a Discord bot to a dashboard for my growing collection of personal AI projects."
publishDate: 2026-10-19
tags: ["Local AI", "Project introductions"]
draft: false
---

**A small command center for the things I build after everyone else goes to bed.**

Mission Control started as a way to keep an eye on my Discord bot. As that project grew into a collection of personal AI experiments, I wanted somewhere to answer three questions: what’s running, what just happened, and does anything need attention?

The dashboard brings those answers together. Service cards show uptime and resource use. An activity timeline follows starts, stops, and recoveries, while alerts flag problems and the output viewer helps explain what a service is doing. There are start, stop, and restart buttons for registered services, too.

Behind the scenes, the dashboard and Discord host share the same service manager. Hardware monitors and other components contribute observations to a shared event stream. Building those connections is the fun part: getting separate little projects to tell one understandable story.

**Work in progress:** this is a working personal dashboard, still growing alongside the experiments it watches.

These are genuine screenshots of an **isolated demo with sample data throughout**. “Navi Host” is an internal software name; Riku is the desktop companion.

<figure>
  <a href="/images/projects/showcase/mission-overview.webp" aria-label="Open full-size Mission Control dashboard screenshot">
    <img src="/images/projects/showcase/mission-overview.webp" srcset="/images/projects/showcase/mission-overview-640.webp 640w, /images/projects/showcase/mission-overview.webp 1265w" sizes="(max-width: 800px) calc(100vw - 40px), 760px" width="1265" height="712" alt="Mission Control’s overview with service totals, resource use, and host provider status, all using sample data." loading="eager" decoding="async" />
  </a>
  <figcaption>The big picture: services and their supporting pieces. Isolated demo · sample data. <a href="/images/projects/showcase/mission-overview.webp">View full size</a></figcaption>
</figure>

<figure>
  <a href="/images/projects/showcase/mission-activity.webp" aria-label="Open full-size Mission Control activity screenshot">
    <img src="/images/projects/showcase/mission-activity.webp" srcset="/images/projects/showcase/mission-activity-640.webp 640w, /images/projects/showcase/mission-activity.webp 1265w" sizes="(max-width: 800px) calc(100vw - 40px), 760px" width="1265" height="712" alt="Sample service cards beside Mission Control’s activity timeline, including a staged warning and one active alert." loading="lazy" decoding="async" />
  </a>
  <figcaption>Service activity and a staged warning share one timeline. Isolated demo · sample data. <a href="/images/projects/showcase/mission-activity.webp">View full size</a></figcaption>
</figure>

<figure>
  <a href="/images/projects/showcase/mission-output.webp" aria-label="Open full-size Mission Control service output screenshot">
    <img src="/images/projects/showcase/mission-output.webp" srcset="/images/projects/showcase/mission-output-640.webp 640w, /images/projects/showcase/mission-output.webp 1265w" sizes="(max-width: 800px) calc(100vw - 40px), 760px" width="1265" height="712" alt="The service inspector’s Output tab displays five harmless sample log lines, with service controls above." loading="lazy" decoding="async" />
  </a>
  <figcaption>A closer look at one service’s recent output. Isolated demo · sample logs. <a href="/images/projects/showcase/mission-output.webp">View full size</a></figcaption>
</figure>

[Back to Mission Control](/projects/mission-control/)
