---
name: radix-notification
description: "Write Radix platform notification messages for Slack. Use when: writing announcements, deprecation notices, action-needed alerts, maintenance windows, or breaking changes for Radix users."
argument-hint: "Describe the change, who is affected, and what action is needed"
---

# Radix Platform Notification Writer

## When to Use

- Announcing deprecations or breaking changes
- Requesting user action (migration, config update, firewall changes)
- Maintenance window or downtime notices
- New feature announcements that require opt-in

## Message Structure

Follow this structure. Not all sections are needed for every message — pick what applies.

### 1. Header

Always start and end with `:omniaradix:`. Use a **bold, descriptive title** that tells users what the message is about at a glance.

```
:omniaradix: **Title describing the change** :omniaradix:
```

### 2. Scope / Who Is Affected

Immediately clarify who needs to act and who can ignore the message. If most users are unaffected, say so upfront to reduce noise.

```
**No action is needed if you do not use [feature X].**
```

Or use `@channel` if everyone is affected.

### 3. Context / Why

One or two sentences explaining the reason for the change. Focus on user benefits (security, performance, cost) rather than internal reasons.

### 4. What You Need to Do

Numbered steps, kept minimal. Link to migration guides or documentation rather than inlining instructions.

```
**What you need to do:**
1. Step one
2. Step two

See the migration guide: https://www.radix.equinor.com/...
```

### 5. Consequences / Deadline (if applicable)

Use `:warning:` for consequences. Be specific about dates if there is a deadline.

```
:warning: After [date], [consequence].
```

Or for soft pressure without a hard deadline:

```
:warning: [Resource/capacity] on the legacy option will be reduced. Please migrate at your earliest convenience.
```

### 6. Temporary Fallback (if applicable)

If users can temporarily revert, tell them how — and ask them to contact the team so issues can be tracked.

```
:wrench: If you experience issues, contact the Radix team immediately. As a temporary fallback, you can [revert step] while we investigate.
```

### 7. Closing

Always end with an offer to help:

```
Don't hesitate to contact the Radix team if you have any questions.
```

## Tone Guidelines

- **Direct and clear** — lead with what matters to the reader
- **Respectful of attention** — state who is affected early so others can skip
- **Helpful, not bureaucratic** — link to guides, offer fallbacks, invite questions
- **Use emoji sparingly** — `:omniaradix:` for header, `:warning:` for consequences, `:wrench:` for fallbacks, `:muscle:` or `:hugging_face:` only for light positive notes
- **No jargon without links** — if referencing a config property or tool, link to its documentation

## Examples

See these past notifications for reference on tone and structure:

### Deprecation with migration (action needed for subset of users)

```
:omniaradix: **Action needed: Migrate to BuildKit for build secrets** :omniaradix:

Radix now defaults to using BuildKit (`useBuildKit: true`) for all builds. **No action is needed if you do not use build secrets.**

**If your application uses build secrets**, not setting `useBuildKit: true` is now **deprecated** and requires changes to your Dockerfile. The legacy build method passes secrets as `ARG`s, which is less secure. BuildKit mounts secrets as files, which is safer and allows us to implement new security features going forward. It is also faster in many cases.

**What you need to do:**
1. Set `useBuildKit: true` in the `spec.build` section of your `radixconfig.yaml`
2. Update your Dockerfile to mount build secrets as files instead of using `ARG`s

See the migration guide: https://www.radix.equinor.com/guides/build-secrets/#build-secrets-with-buildkit

:warning: Build capacity on the legacy option will be reduced for cost savings. Please migrate at your earliest convenience.

:wrench: If you experience any build issues with the new default, please contact the Radix team as soon as possible so we can investigate. As a temporary fallback, you can set `useBuildKit: false` in your `radixconfig.yaml` to revert to the legacy behavior while we resolve the issue.

Don't hesitate to contact the Radix team if you have any questions.
```

### Breaking change with hard deadline (action needed for subset of users)

```
:omniaradix: Action needed: OAuth2 Header Migration :omniaradix:
@channel

As part of Radix platform upgrade, we are migrating away from ingress-nginx. This change impacts the OAuth2 feature.

If your application uses the OAuth2 feature, and have set the setXAuthRequestHeaders property to true in radixconfig.yaml, you need to update the application.

Update to rely on the X-Forwarded-* headers instead of X-Auth-Request-*.

Deadline: February 16, 2026
After which the X-Auth-Request-* headers will be removed.

Please refer to this migration guide for more details.
Don't hesitate to contact the Radix team if you have any questions.
```

### Infrastructure change (action needed for subset of users)

```
:omniaradix: Radix Platform North Europe - Extend Egress IP ranges :omniaradix:
Important message to everyone who uses Radix Egress IP Firewall rules
Please update your incoming firewall rule to accept traffic from these networks:
[IP list]
(ref https://console.radix.equinor.com/about)
It is a good time to create Private Link to your resources instead
https://www.radix.equinor.com/guides/private-link/
If you use Private Links already...great :muscle:, you don't have to do anything :hugging_face:
```

### Short maintenance notice

```
:omniaradix: Networking Layer Reconfiguration :omniaradix:
We are reconfiguring the networking layer for Radix API and Radix Github Webhook service the next couple of hours.
This may cause a few minutes of downtime for webhook events and Radix API access in each of the clusters. This can cause dropped GitHub push events.
During this time, the Web Console and CLI might experience temporary issues.
```
