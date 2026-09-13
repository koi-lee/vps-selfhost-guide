# 从选购到 Clash Verge Rev

## 1. 选购与试用

Agent 先查候选供应商官方价格和条款，不固定推荐过时促销。按接收者运营商选择可试用或退款的地区，优先测试真实线路；地理距离不等于网络质量。对比续费、退款、虚拟化类型、流量配额、IPv6、UDP 支持和使用条款。小规模个人使用可从 1 vCPU/1GB RAM 级别评估，面板资源需求以所选版本为准；无需为此购买大磁盘或多台服务器。

购买由接收者确认。试用期测试晚高峰、HTTPS 成功率、丢包和小文件下载；不达标先退款或更换线路，不靠叠加付费服务补救。结果填写本地验收记录。

## 2. 系统准备

选择组件支持的 Debian/Ubuntu 稳定版。检查 `uname -m`、系统版本、时间同步、可用内存、`ss -lntup` 和现有防火墙，记录 SSH 实际端口。更新系统安全补丁；保持 SSH 可恢复访问。

准备自己的入口与 CDN 子域名；入口域名 A/AAAA 必须对应可达地址，未验证 IPv6 不发布 AAAA。用受支持的 ACME 客户端签发有效证书，配置自动续期及服务重载。DNS-01 的 API token 仅授权所需区域。

放行实际 SSH 管理入口、HY2 UDP 443、VLESS TCP 443，以及 CDN 源站 TLS 8443（仅需要 CDN 时）。不要公开数据库、无 TLS 面板、Mihomo 控制接口。

## 3. HY2 主线路与用户

新建路线先使用 [Hysteria 官方服务端](https://v2.hysteria.network/docs/getting-started/Server/)，按 [恢复执行手册](rebuild-runbook.md) 的模板部署 UDP 443、自己的有效域名证书和认证配置。模板为单密码起步版；多人独立撤销需要按所用版本实现并测试多用户认证，不能共用密码后声称每人独立。

[3X-UI](https://github.com/mhsanaei/3x-ui) 是可选管理层。采用前核对当前版本的 HY2 支持、导出与撤销能力，记录面板与内核版本；管理面板绑定回环并通过 SSH 隧道访问。功能不支持时保留独立服务，不修改面板数据库补功能。

## 4. VLESS 与 CDN 备用

使用 [Xray 官方发布](https://github.com/XTLS/Xray-core) 和 [VLESS 入站文档](https://xtls.github.io/config/inbounds/vless.html) 配置独立服务，避免面板重写其配置。

- TCP 443：VLESS + TLS，`decryption: none`，每人独立 UUID，Vision flow `xtls-rprx-vision`，证书与入口域名匹配。
- TCP 8443：VLESS + WebSocket + TLS，路径 `/vless-ws`，独立用户列表，WS 用户不要带 Vision flow。证书应覆盖 CDN 回源所用主机名。
- 出站使用正常直连出口；按官方配置文档生成配置文件，以安装版本的帮助信息确认配置检查命令，检查通过后启动 systemd 服务。
- IPv4 与 IPv6 客户端节点使用同一 TCP 443 服务和用户；IPv6 节点服务器填自己的 IPv6 地址，TLS servername 仍填入口证书域名。

CDN 使用受支持的 WebSocket/TLS 端口。以 Cloudflare 为例，使用自己的 `cdn.example.com` 橙云记录，Full (strict)，客户端和源站均用 8443；先核对 [代理端口](https://developers.cloudflare.com/fundamentals/reference/network-ports/) 与 [WebSocket 支持](https://developers.cloudflare.com/network/websockets/)。源站证书、SNI、Host 和 WS 路径必须一致。不要把 HY2 UDP 或 Vision TCP 当作普通 WebSocket 送入 CDN。本包不复制历史 Flexible/明文回源方案。

分别验证 IPv4、IPv6、CDN 真实代理 HTTPS；CDN 返回 400 只能说明入口有响应，不能代替 VLESS 认证验收。失败的可选线路不要加入已交付可用列表。

## 5. 个人订阅

每个人拥有独立密码/UUID和订阅 token。若当前面板支持外部节点聚合，用当前官方说明将 HY2 与独立 Xray 的 VLESS 节点聚合；UUID 必须已同步加入独立 Xray 服务端用户列表。撤销用户时同时撤销 HY2、独立 Xray 和订阅 token。

如果面板没有可靠的聚合导出能力，先交付每人独立的本地 YAML 配置（无需订阅服务器），不要假装已经完成订阅。需要远程更新时另行配置 HTTPS 私密分发，关闭目录列表，使用不可猜测 token，避免记录完整 URL。令牌持有者可取配置，撤销和轮换必须可执行。

## 6. Clash Verge Rev

从 [官方 Releases](https://github.com/clash-verge-rev/clash-verge-rev/releases) 安装对应系统/架构版本。导入接收者自己的订阅或填写后的 `templates/clash.example.yaml`。

将 `scripts/shared-profile.js` 完整粘贴到该配置的扩展脚本编辑器，全选覆盖旧内容后保存，重新应用该配置。不同版本按钮名称可能不同，以实际 UI 为准：更新订阅是重新拉取数据，使用/激活是应用配置；两者不要混淆。

规则模式下应显示“上网线路”，第一项“自动切换（推荐）”，内部 fallback 隐藏，顺序 HY2 → CDN → IPv4；IPv6 只供手动选择；DIRECT 放最后。先开启系统代理验证浏览器，再按需求单独验证 TUN，避免其他 VPN 冲突。

脚本只支持本包四节点角色和基础规则，不用于覆盖复杂机场分组。输入各角色最多一个节点，名称唯一；IPv6 节点使用 IPv6 字面地址。脚本保留原认证、证书和带宽字段，不修改服务端。

国内常用域名与 GEOIP,CN 走 DIRECT，其余走上网线路。GeoIP 数据必须可用且更新；异常时检查实际连接规则，不凭域名归属想当然补规则。

## 7. 性能与日常维护

保留 HY2 优先只是起点；用多个晚高峰样本决定顺序。检测小 HTTPS 204 不能衡量视频吞吐，测速结果应区分成功率、成功样本 P50/P95 和超时。IPv6 是否加入自动组必须单独长期验证。

不把别人的带宽参数、自签证书例外、运营商故障、控制 socket 路径照搬到新设备。自动回退只选后续连接的可用节点；已有失败请求可能仍需应用重试。

每阶段按 [验收与恢复](verification.md) 留结果，再交付。

配置字段参考：[Mihomo HY2](https://wiki.metacubex.one/config/proxies/hysteria2/)。本包分享脚本不设置 HY2 up/down；需要调节时按接收者实际带宽核验。
