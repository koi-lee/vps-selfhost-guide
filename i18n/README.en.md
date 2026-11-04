# Self-hosted VPS proxy guide

[简体中文](../README.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md)

> Usage timeline: records confirm this setup worked on China Mobile broadband in Chengdu on 2026-08-14. By 2026-11-04, that spans 82 days (nearly three months). There were also disconnection and DNS/client-configuration issues requiring troubleshooting. This is elapsed usage history, not 82 days of uninterrupted uptime.

> Browser checks on 2026-11-04 using the existing Mac and self-hosted HY2 route: Google search returned results; a YouTube video played to about 20 seconds; the signed-in Codex workspace loaded, but no coding task was submitted. TikTok reached a login/date-of-birth flow; video browsing was not verified. Connection records confirmed these test domains used HY2. This is not a long-term stability or mobile-app test.

> The author reports using this setup successfully with a RackNerd VPS on China Mobile home broadband in Chengdu. This is one personal usage example; other networks and datacenters still need testing. The public guide has not yet been reproduced end to end on a fresh VPS.

This guide covers VPS selection, deployment, Clash Verge Rev configuration and troubleshooting. Ask your agent to read README.md and AGENTS.md, then guide setup and verification for your network and server. Use your own accounts and server; configurations are examples.

## Downloads and deployment target

[RackNerd affiliate link](https://my.racknerd.com/aff.php?aff=21220) · [Official Clash Verge Rev downloads](https://github.com/clash-verge-rev/clash-verge-rev/releases). Select a stable client release for your operating system and CPU architecture. The affiliate link may earn the author a commission; it does not guarantee an extra discount for the buyer.

The default goal is three self-hosted routes: HY2, CDN and IPv4 VLESS, with automatic fallback. Testing HY2 first is an intermediate checkpoint; continue through backup routes and failover verification. IPv6 is optional and manual. No separate VPN subscription is required. Follow the [deployment stage table](../docs/deployment.md) and record incomplete stages in the [verification checklist](../docs/verification.md).

## The VPS provider I use

I built this setup on RackNerd. Use the guide to choose a server that fits your budget and network.

**[View RackNerd and help me maintain this guide](https://my.racknerd.com/aff.php?aff=21220)**

*If you purchase through this link, I may earn a commission to support maintenance and updates to this guide. Thank you for your support!*

## Scope and status

This is a guide with placeholder templates, not a hosted proxy or a one-click installer. Offline checks pass; a complete deployment on a fresh VPS has not been reproduced. Server and domain costs are yours. No speed guarantee is provided.

This page translates the core onboarding instructions. The detailed documents linked below are currently in Chinese and are the maintained source. Ask your agent to explain them in English. Translations are AI-assisted and have not received native-speaker review.

## Start with your agent

> Read AGENTS.md, README.md and docs/ first. Explain the procedure in English. Use my own accounts and server. Ask for my budget, ISP, location, operating system, domain and IPv6 availability. Verify current official versions and prices. Obtain approval before any purchase. Back up existing services and preserve SSH access. Complete HY2, CDN and IPv4 VLESS with Clash Verge Rev automatic fallback. Test HY2 first, then continue through backup routes and failover verification using the deployment stage table; do not stop at the first working route. Do not expose credentials or change unrelated services. Report untested steps honestly.

## Family and friend sharing

For shared use, follow the [3X-UI integration guide](../docs/3x-ui-family-sharing.md): panel-managed HY2/CDN/IPv4 inbounds, one identity and HTTPS subscription per person, quotas, expiry and revocation. It references official v3.8.5 documentation and source, without claiming fresh-VPS testing. Do not run the standalone services below on the same ports. Sharing costs is a private agreement, not panel billing; traffic quotas do not reserve bandwidth. Test two users and every protocol, including old cached credentials after revocation. The deployment overview below describes the standalone route; use the linked chapter for panel-managed setup.

## Deployment sequence

For your first setup, fill in only the budget, ISP/location, computer OS, and whether you already have a VPS and domain in the [local parameter sheet](../docs/parameters.example.md). Leave unfamiliar technical fields blank until they are explained. The detailed Chinese deployment guide now includes a beginner reading order and definitions. If you are new to terminals and server administration, ask your agent to explain each step and where to run it; do not paste an entire page of commands.

If you already have a suitable VPS, reuse it. Otherwise compare plans before creating an account: for light personal use, start by evaluating KVM plans around 1 vCPU and 1 GB RAM, then check location, UDP, traffic, IPv4, initial total and renewal price. Self-hosting requires Linux maintenance; buying a VPS does not configure it. RackNerd is one candidate, not a guarantee of speed or an extra discount. Its terms provide no automatic refund after payment. Use the affiliate link above only if you decide it fits, then register and approve payment yourself. Enter account details yourself and keep credentials private. [Terms](https://www.racknerd.com/terms-of-service)

1. Compare VPS renewal price, refund terms, traffic quota, UDP and IPv6 support. Test the actual route during peak hours; distance alone does not predict speed.
2. Check architecture, ports, time and firewall. Use a valid certificate for your own domain and matching SNI. Keep administrative interfaces on loopback behind an SSH tunnel.
3. Start with the standalone Hysteria service. The supplied template has one password; independent per-user revocation requires a supported authentication design and real tests.
4. Add Xray VLESS/TLS on TCP 443 and WebSocket/TLS on 8443. For a compatible CDN, use strict origin TLS; do not send HY2 UDP or Vision TCP through a WebSocket CDN route. Generate Xray JSON for the installed version and validate it before starting.
5. Fill all REPLACE_* values in the shared template. Give each user their own credentials and YAML. Automatic subscription updates require a separately verified HTTPS distribution service with revocable tokens.
6. In Clash Verge Rev, import the configuration and paste the shared script into its extension-script editor. Save and apply the profile. Subscription refresh downloads data; profile activation applies it.
7. Test each route, domestic direct access, overseas HTTPS, uploads, restart and rollback. Test system proxy before TUN. Never disable certificate verification to suppress an error.

## What the script does

The UI keeps the shared identifiers `上网线路` (route selection) and `自动切换（推荐）` (automatic fallback, recommended). Automatic order is HY2 → CDN → IPv4; IPv6 remains manual and DIRECT is last. The internal group is visible. Health checks run every 15 seconds with a 5-second timeout. Fallback handles subsequent connections; failed requests may need application retries.

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
python3 tests/check_copy.py
python3 tests/check_i18n.py
```

[GitHub](https://github.com/koi-lee/vps-selfhost-guide) · [koi-lee](https://github.com/koi-lee)

## Feedback and updates

Please report unclear steps or errors in an Issue, including the step, expected result and actual behavior. I will improve the guide based on feedback. Remove passwords, keys, subscription links and personal information first.

[Issue](https://github.com/koi-lee/vps-selfhost-guide/issues) · [Support this guide](../SUPPORT.md#en)

Support is optional. The guide remains free, and feedback is welcome whether or not you contribute.

Self-hosted routes use priority fallback, not lowest-latency selection. A slow route that still passes health checks may remain selected. See the [client guide](../docs/client-failover.md) for domestic DNS and verification limits. All routes share the VPS; multiple protocols do not provide server-level redundancy.

Optional simplified panel: append [simplify-panel.js](../scripts/simplify-panel.js) after the main script. It offers automatic, manual and direct choices. Select a node in the lower list, then choose 「切换到手动节点」 above; return to 「自动上网（推荐）」 afterward. Without the optional panel, select a node directly in 「上网线路」. The public script rejects non-empty external `proxy-providers`; keep private extensions in a separate profile. See [second-computer setup](../docs/family-client-setup.md).
