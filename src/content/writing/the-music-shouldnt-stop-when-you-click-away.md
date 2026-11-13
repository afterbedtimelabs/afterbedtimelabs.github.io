---
title: "The Music Shouldn't Stop When You Click Away"
description: "Building music that stays with you while you explore the workshop, and the small details that make it feel seamless."
publishDate: "2026-11-12"
tags: ["Studio notes","Music","Web development"]
draft: false
---

One of the little things we wanted for After Bedtime Labs was a website you could settle into.

The music is part of that. You press play, explore a project, maybe read an article, and keep listening. Nothing particularly groundbreaking, but having the song restart every time you click somewhere would ruin the atmosphere pretty quickly.

So we wanted the music to follow you around the workshop.

## Making it feel seamless

It turns out that keeping music playing between pages is a little trickier than keeping a play button on the screen.

The player itself needs to survive navigation. The song needs to keep progressing. And if you've adjusted the volume or paused playback, those choices should stay with you.

We worked through those details as part of the ambient homepage, checking that the music continued while moving between projects, articles, and other parts of the site.

The result is intentionally understated. You start a song, move around, and ideally never have to think about the player again.

## A few things we learned

One interesting discovery was that keeping a music player visible doesn't necessarily mean the browser can play its audio.

During compatibility testing, one browser test environment retained the player and its controls but couldn't decode the music format. The interface was doing its job, but the listening experience wasn't there.

That doesn't mean every browser has the same problem. There were still a few things we couldn't confirm, especially how the music would behave on Safari and actual mobile devices.

We also wanted visitors to remain in control. Music doesn't start automatically on a fresh visit, and opening a new tab or reloading the site starts a new listening session.

## It's the little things

We probably spent more time on this feature than most visitors would ever guess.

But that's part of building a place like After Bedtime Labs.

Not every improvement needs to be a big new feature. Sometimes it's making sure a small detail doesn't pull someone out of the experience.

If you find a song you like while exploring the workshop, we want you to be able to keep listening.

That's really all there is to it.
