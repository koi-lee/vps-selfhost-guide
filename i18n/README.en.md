# Self-hosted VPS proxy guide

[简体中文](../README.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md)

This guide covers VPS selection, deployment, Clash Verge Rev configuration and troubleshooting. Ask your agent to read README.md and AGENTS.md, then guide setup and verification for your network and server. Use your own accounts and server; configurations are examples.

## The VPS provider I use

I built this setup on RackNerd. Use the guide to choose a server that fits your budget and network.

**[View RackNerd and help me maintain this guide](https://my.racknerd.com/aff.php?aff=21220)**

*If you purchase through this link, I may earn a commission to support maintenance and updates to this guide. Thank you for your support!*

## Scope and status

This is a guide with placeholder templates, not a hosted proxy or a one-click installer. Offline checks pass; a complete deployment on a fresh VPS has not been reproduced. Server and domain costs are yours. No speed guarantee is provided.

This page translates the core onboarding instructions. The detailed documents linked below are currently in Chinese and are the maintained source. Ask your agent to explain them in English. Translations are AI-assisted and have not received native-speaker review.

## Start with your agent

> Read AGENTS.md, README.md and docs/ first. Explain the procedure in English. Use my own accounts and server. Ask for my budget, ISP, location, operating system, domain and IPv6 availability. Verify current official versions and prices. Obtain approval before any purchase. Back up existing services and preserve SSH access. Deploy and test HY2 first, then add optional VLESS/CDN, individual configuration and Clash Verge Rev. Do not expose credentials or change unrelated services. Report untested steps honestly.

## Deployment sequence

First use the RackNerd support link above to register and sign in to your own account. Existing users can sign in directly; skip purchasing if you already have a suitable VPS. Account registration does not purchase a server. Before choosing or paying for a plan, give this repository and the agent request above to your agent. Have it compare your needs, current prices, renewal and refund terms; only then approve payment yourself and wait for provisioning. Enter account details yourself and keep credentials private.

1. Compare VPS renewal price, refund terms, traffic quota, UDP and IPv6 support. Test the actual route during peak hours; distance alone does not predict speed.
2. Check architecture, ports, time and firewall. Use a valid certificate for your own domain and matching SNI. Keep administrative interfaces on loopback behind an SSH tunnel.
3. Start with the standalone Hysteria service. The supplied template has one password; independent per-user revocation requires a supported authentication design and real tests.
4. Add Xray VLESS/TLS on TCP 443 and optional WebSocket/TLS on 8443. For a compatible CDN, use strict origin TLS; do not send HY2 UDP or Vision TCP through a WebSocket CDN route. Generate Xray JSON for the installed version and validate it before starting.
5. Fill all REPLACE_* values in the shared template. Give each user their own credentials and YAML. Automatic subscription updates require a separately verified HTTPS distribution service with revocable tokens.
6. In Clash Verge Rev, import the configuration and paste the shared script into its extension-script editor. Save and apply the profile. Subscription refresh downloads data; profile activation applies it.
7. Test each route, domestic direct access, overseas HTTPS, uploads, restart and rollback. Test system proxy before TUN. Never disable certificate verification to suppress an error.

## What the script does

The UI keeps the shared identifiers `上网线路` (route selection) and `自动切换（推荐）` (automatic fallback, recommended). Automatic order is HY2 → CDN → IPv4; IPv6 remains manual and DIRECT is last. The internal group is hidden. Health checks run every 30 seconds with a 5-second timeout. Fallback handles subsequent connections; failed requests may need application retries.

Use this script only with this repository’s basic template, not complex third-party subscriptions. It replaces groups and routing rules while retaining node credentials and TLS fields; it does not sanitize untrusted subscriptions. The routing defaults favor direct access to Chinese services; review them for your own country and network.

## Shared files and offline checks

Explicit DIRECT exceptions also include cloudflare.com and cloudflare-dns.com and their subdomains, not all sites hosted by Cloudflare. For permissions, owner-only secrets default to 600; root-managed files needed by vpsproxy use root:vpsproxy, files 640 and directories 750. Verify group membership, parent-directory traversal and readability as the service user.

- [AGENTS.md](../AGENTS.md)
- [docs/parameters.example.md](../docs/parameters.example.md)
- [docs/deployment.md](../docs/deployment.md)
- [docs/rebuild-runbook.md](../docs/rebuild-runbook.md)
- [docs/verification.md](../docs/verification.md)
- [docs/faq.md](../docs/faq.md)
- [templates/clash.example.yaml](../templates/clash.example.yaml)
- [scripts/shared-profile.js](../scripts/shared-profile.js)
- [SECURITY.md](../SECURITY.md)
- [LICENSE](../LICENSE)

Run these commands from the repository root.

```sh
node --test tests/*.test.js
python3 tests/check_docs.py
python3 tests/check_i18n.py
```

[GitHub](https://github.com/koi-lee/vps-selfhost-guide) · [koi-lee](https://github.com/koi-lee)

## Feedback and updates

Please report unclear steps or errors in an Issue, including the step, expected result and actual behavior. I will improve the guide based on feedback. Remove passwords, keys, subscription links and personal information first.

[Issue](https://github.com/koi-lee/vps-selfhost-guide/issues) · [Support this guide](../SUPPORT.md#en)

Support is optional. The guide remains free, and feedback is welcome whether or not you contribute.
