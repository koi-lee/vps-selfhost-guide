# 3X-UI：和家人、朋友共享 VPS

这条路线面向需要给家人、朋友分配独立订阅的管理员：在自己的 VPS 上安装 3X-UI，用面板统一管理 HY2、VLESS 和 CDN 入站，为每个人建立独立身份、额度与有效期。使用者只导入自己的订阅，不需要管理员账号，也不用另购 VPN。

完成路径：准备 VPS 与域名 → 安装并保护面板 → 建立三条线路 → 添加两名测试用户 → 导出各自的订阅 → 验证额度和撤销 → 再分发给实际使用者。

> 核对日期：2026-09-28。参考官方稳定版 **v3.8.5**（源码提交 `7ef22f94c950ff09f0870e2295fa65ad5968742c`），已核对该版本文档、配置字段和相关源码。本文尚未在全新 VPS 上实测，截图、实际续期、额度耗尽及跨协议停用不冒充已验证。安装时记录实际版本；版本不同时先核对字段与行为，不直接套用旧数据库补丁。

## 1. 先选择服务管理方式

| 情况 | 应走的路线 | 用户与流量管理边界 |
| --- | --- | --- |
| 新 VPS，要给多人分配订阅 | **本章：3X-UI 统一管理三条入站** | 使用面板内的一份用户记录关联多条入站，再实测统计、限额和停用 |
| 已按基础教程运行独立 Hysteria/Xray | 保留现状，先看本文迁移一节 | 面板不会自动接管进程、导入身份或统计独立服务流量 |
| 只需要自己使用，不需要面板 | [独立服务部署](deployment.md) | 使用已有模板，后续要多人共享时重新设计身份与撤销 |

面板路线下，不要再启动基础教程中的 `hysteria.service`、`xray.service` 来占用相同端口，也不要手改面板生成的内核 JSON。面板和独立服务同时抢同一监听端口，会导致启动失败。这里没有外部 VPN、日本订阅或收款系统。

### 费用、流量和网速分别约定

- **费用**：管理员和成员自行约定续费周期、分摊、退出与退款方式。面板不负责收款或结算。以实际购买时的供应商条款确认多人使用的适用范围。
- **流量**：先核对供应商计费周期、上传/下载是否双向计费、GB/GiB 单位和超额处理。面板记录不必与供应商账单逐字节一致，需保留余量并定期对账。
- **带宽**：大家共用 VPS 出口，分配流量额度不等于每个人有固定网速；一个人高负载仍可能影响其他人。

仅作算术示例：若已换算后的月度预算为 1,000 GiB，留 100 GiB 余量，4 人可各分 225 GiB。不要在三个入站上分别给同一个人 225 GiB，再声称他的总额度仍是 225 GiB。本文采用一份用户记录关联三个入站，跨协议累计与超额停用还必须实测。

## 2. 准备参数和端口

先填写 [参数表](parameters.example.md)。新增以下私密记录：成员代号、关联的入站、额度、有效期、重置周期、订阅凭据存储位置；不使用真实姓名、邮箱或手机号作为公开示例。

| 用途 | 本章示例 | 核对点 |
| --- | --- | --- |
| 管理入口 | `127.0.0.1:15432`，经 SSH 隧道 | 15432 是示例，先查占用；公网不开放面板端口 |
| HY2 | UDP 443，`edge.example.com` | DNS only；有效证书；不得经过普通 HTTP CDN |
| IPv4 VLESS | TCP 443，VLESS + TLS + Vision | 与 UDP 443 可分别监听；若已有 HTTPS 服务占用 TCP 443，先解决冲突 |
| CDN VLESS | TCP 8443，WebSocket + TLS | `cdn.example.com` 橙云；Full (strict)，路径 `/vless-ws` |
| 订阅服务 | TCP 2096，`sub.example.com` | DNS only、有效 HTTPS；与管理入口分开 |
| IPv6 | 同一 TCP 443 的可选出口地址 | 服务器与客户端网络验证可用后再启用 |

证书应覆盖实际使用的域名，可使用分别签发的证书或覆盖这些域名的证书。签发和续期沿用 [证书说明](rebuild-runbook.md)，但重启对象改为实际面板服务 `x-ui`，不能使用独立服务路线的重启命令。核对服务身份可读证书、私钥与父目录，不为省事开放全局读取权限。

在 VPS 检查系统、架构、时间、现有服务和端口：

```sh
cat /etc/os-release
uname -m
timedatectl status
ss -lntup
```

先保持 SSH 和供应商救援入口可用。全新 VPS 在安装期间只放行实际 SSH 管理入口，阻止未配置好的面板和订阅端口被公网访问；后续按表逐项开放业务端口。已有服务器不直接覆盖防火墙，先备份并记录使用的是哪一种规则管理工具。

## 3. 安装面板并完成首次登录

### 在 VPS 下载并检查安装脚本

以下针对 Linux systemd 和官方 v3.8.5。下载与审阅不等于安装；执行最后一行会安装软件和服务，必须在已授权的目标 VPS 上进行。

```sh
umask 077
curl --fail --location --proto '=https' --tlsv1.2 \
  https://raw.githubusercontent.com/MHSanaei/3x-ui/v3.8.5/install.sh \
  -o install-3x-ui-v3.8.5.sh
bash -n install-3x-ui-v3.8.5.sh
less install-3x-ui-v3.8.5.sh
# 阅读安装器及其下载来源，确认目标服务器与安装范围后执行：
sudo bash install-3x-ui-v3.8.5.sh v3.8.5
```

使用有交互能力的终端，逐项阅读安装提示；Agent 不应为了跳过问题而擅自启用无人值守安装。普通家庭规模先沿用 SQLite；不要顺带安装外部数据库、机器人或其他协议。安装器会创建服务和随机登录信息，输出可能含凭据，不贴入聊天、Issue 或公开日志。

### 收紧管理监听，再建立 SSH 隧道

官方安装目录默认是 `/usr/local/x-ui`。安装后在 VPS 核对二进制帮助、设置监听地址和未被占用的面板端口：

```sh
sudo /usr/local/x-ui/x-ui setting -h
sudo /usr/local/x-ui/x-ui setting -listenIP 127.0.0.1 -port 15432
sudo systemctl restart x-ui
sudo systemctl is-active x-ui
sudo ss -lntup
```

确认面板只监听回环地址。服务显示 active 只说明进程运行，还需登录与后续协议验证。登录信息由本人在 VPS 终端查看并存入密码管理器；官方安装器可能保存到 `/etc/x-ui/install-result.env`，也可在 `sudo x-ui` 菜单查看当前设置。不要把文件整体打印到 Agent 对话里。

在**自己的电脑**终端建立隧道，替换下列 REPLACE_* 占位值：

```sh
ssh -N -o ExitOnForwardFailure=yes \
  -L 127.0.0.1:15432:127.0.0.1:15432 \
  -p 'REPLACE_SSH_PORT' 'REPLACE_SSH_USER@REPLACE_VPS_ADDRESS'
```

若管理服务未配置 TLS，浏览器打开 `http://127.0.0.1:15432/<实际面板路径>/`；HTTP 只走本机与加密 SSH 隧道，不能因此把面板公开。

若安装器已配置 HTTPS，保留 HTTPS。例如证书覆盖 `panel.example.com`，在自己电脑的 hosts 文件添加 `127.0.0.1 panel.example.com`，保持上述隧道运行，再访问 `https://panel.example.com:15432/<实际面板路径>/`。域名替换为证书里的真实名称；已有同名 hosts 记录先备份并处理冲突，不修改公共 DNS 来指向回环地址。macOS/Linux 的 hosts 文件为 `/etc/hosts`，Windows 为 `C:\Windows\System32\drivers\etc\hosts`，编辑通常需要管理员权限。停用该访问方式后移除本次添加的映射，不忽略浏览器证书错误。端口、本地映射和协议应按实际安装结果一致配置。

登录后保存强密码、开启可用的双因素认证并保管恢复方式。家人朋友不需要面板管理员账号；“客户端用户”和“面板管理员”是两种身份。下一步先在面板暂时关闭尚未配置 TLS 的订阅服务，完成第 6 节后再对公网开放。

## 4. 在面板建立三条入站

在 **Inbounds / 入站 → Add / 添加** 分别建立下表条目，逐条保存。此时不接入独立 Hysteria/Xray；证书、端口和防火墙必须与第 2 节对应。

| 入站标识 | 协议与传输 | 安全与关键字段 |
| --- | --- | --- |
| `HY2-main` | `hysteria`，版本 **2**，Hysteria/QUIC 传输；UDP 443 | TLS；证书覆盖 `edge.example.com`；使用每个客户端自己的 Auth；不随意开启混淆、端口跳跃或复制带宽值 |
| `VLESS-IPv4` | VLESS，TCP/Raw；TCP 443 | TLS；`decryption: none`；Vision 使用 `xtls-rprx-vision`；证书覆盖 `edge.example.com` |
| `VLESS-CDN` | VLESS，WebSocket；TCP 8443 | TLS；WS 路径 `/vless-ws`，Host/SNI 使用 `cdn.example.com`；不使用 Vision flow |

面板将 Hysteria2 显示为 `hysteria` 并通过版本 2 生成 `hysteria2://` 链接，不要选成 Hysteria v1。VLESS 的加密、传输字段按该版本 UI 核对，本章不额外开启其他加密或实验选项。TCP Vision 与 WS 的 flow 必须分别检查生成配置；共享用户身份不代表所有入站都能带相同 flow。

### 把对外地址与入站对应起来

面板监听地址可为 `0.0.0.0`，但导出的客户端不能连接 `0.0.0.0` 或回环地址。v3.8.5 的 **Hosts / 主机** 管理可为入站指定对外地址；它设置的是订阅里展示的连接端点，并不会替你创建 DNS 或监听端口。

创建或编辑 Host，选择单个对应入站，填写 Address、Port、TLS/SNI 与唯一备注：

| 对应入站 | 客户端地址 | 端口 | SNI |
| --- | --- | --- | --- |
| `HY2-main` | `edge.example.com`，DNS only | 443 | `edge.example.com` |
| `VLESS-IPv4` | VPS 公网 IPv4 | 443 | `edge.example.com` |
| `VLESS-CDN` | `cdn.example.com`，橙云 | 8443 | `cdn.example.com` |
| 可选 IPv6 Host，关联 TCP VLESS 入站 | 已验证 IPv6 字面地址 | 443 | `edge.example.com` |

保持证书校验，VLESS 的客户端指纹可用与模板一致的 `chrome`；HY2 不套用 VLESS 的指纹选项。不要把所有 Host 批量关联到所有入站，避免导出多份重复角色。开启 IPv6 时检查实际监听与防火墙，不能仅添加 AAAA 或 Host 就视为服务可达。

在 Cloudflare 中将 CDN 子域名指向自己的 VPS，开启代理并使用 Full (strict)，客户端与源站均使用 TLS 8443。确认回源证书有效且覆盖所用主机名、WebSocket 路径一致；入口域名和订阅域名保持 DNS only。本方案不使用 Flexible，不把 HY2 放进 HTTP CDN。逐条完成真实请求后才保留在日常自动组。

## 5. 每个人建立一份用户记录

在 **Clients / 客户端** 创建 `member-a`，然后创建 `member-b`；这些是本地管理代号，不必使用真实邮箱。逐项核对：

| 字段 | 填写方式 |
| --- | --- |
| Email / 用户标识 | 每人唯一且稳定，用于查找与流量归集；不要为同一人随意创建多个独立记录 |
| UUID、Auth | 由面板为该使用者生成独立值；不同成员不能共用；不要公开到文档或 Issue |
| 关联入站 | 同一用户关联 HY2、TCP VLESS、WS VLESS；只绑定这台自建 VPS 的入站 |
| Sub ID | 每人独立的不可猜测值；标识其订阅，不等于协议认证凭据 |
| Total / 流量额度 | 按本人预算填入；核对单位；`0` 通常表示不限量，不是禁用 |
| Expiry / 有效期 | 填清固定截止日期，核对面板时区和客户端展示 |
| Reset / 重置 | 初次先关闭自动重置，用两名测试用户核验后再配置与套餐一致的周期 |
| Group / Comment | 可用 family、friends 和续费说明；不要放明文密码或付款敏感信息 |

使用“关联/附加入站”将已有用户绑定其他入站，不给每条线路重新创建一个人。保存后分别回读三条入站的用户映射：Auth 出现在 HY2，UUID 出现在 VLESS，WS 不带 Vision flow；再检查同一用户的订阅导出结果。

先对 `member-a` 做小流量测试，再验证 `member-b`。等待面板统计刷新，确认流量归到正确使用者；不能因为 Sub ID 相同就假定跨服务计费已统一。该版本有按用户标识归集的实现依据，本文未在真实 HY2/WS/TCP 流量上替你完成这项验收。

## 6. 开启独立的 HTTPS 订阅服务

面板管理入口继续只通过 SSH 隧道访问。进入 **Subscription / 订阅设置**，使用与面板独立的订阅监听服务：

| 设置 | 本章选择 |
| --- | --- |
| `subEnable` | 证书和访问条件准备好后启用 |
| `subListen` / `subPort` | 按实际公网监听地址绑定，示例端口 2096；不能占用节点端口 |
| `subDomain` | `sub.example.com`，DNS only，指向 VPS；与请求 Host 一致 |
| `subCertFile` / `subKeyFile` | 覆盖订阅域名的有效证书与私钥运行路径 |
| `subClashEnable` | 明确开启；不假定默认已经启用 |
| `subClashPath` | 使用实际配置的 Clash 路径，记录在私密配置中 |
| `subInfoNodeEnable` | 本教程关闭，避免流量提示假节点进入基础脚本的手选列表 |
| 外部链接、外部订阅 | 留空；这条路线只导出自己的入站 |

放行 TCP 2096 前核对 TLS 已生效。不公开面板端口，不用公开 HTTP 传递订阅。直连订阅地址结构为 `https://sub.example.com:2096/<Clash路径>/<Sub-ID>`。使用面板复制的 **Clash/Mihomo** 链接；v3.8.5 还提供 `/mihomo/<Sub-ID>` 别名，但若已有路径冲突，别名可能不注册，应以实际配置和响应为准。

不要选择旧 Clash for Windows 的 legacy 输出，它不适用于这套 HY2/VLESS 组合。Base64 只是编码，不能代替 HTTPS。本文采用直连 TLS 订阅，尚未配置反向代理时不要填写一个不存在的反代地址。

在管理员自己的环境私密检查 A、B 的导出内容：每个人只包含自己的身份，默认恰好有一条 HY2、一条 WS VLESS、一条 TCP VLESS；IPv6 可选且使用字面地址。没有重复角色、外部 provider、无效占位地址、关闭证书校验或别人的 UUID/Auth。

## 7. 分发与 Clash Verge Rev 导入

1. 通过管理员与该成员之间的私密渠道，只给对方自己的订阅链接；不发送面板账号、数据库或全员配置。链接持有者可获取节点凭据，应像密码一样保管。
2. 成员安装 [Clash Verge Rev 官方稳定版](https://github.com/clash-verge-rev/clash-verge-rev/releases)，在“订阅”导入其 Mihomo 链接。
3. 在这张配置卡片绑定 [shared-profile.js](../scripts/shared-profile.js)。需要简化界面时追加 [simplify-panel.js](../scripts/simplify-panel.js)，不要装到全局脚本。
4. 更新订阅、启用配置，再核对规则模式、当前自动组和三条线路。更新是取数据，启用是应用配置；两者分别确认。
5. 逐条手选验证真实 HTTPS，再回到自动模式；同时核对国内 DIRECT 与海外代理。完整操作见 [客户端说明](client-failover.md)。

公开脚本每种节点角色最多一个，并拒绝非空 `proxy-providers`。若面板导出了重复 Host、信息节点或额外协议，先修正面板导出，不通过放宽脚本校验或随手删改成员凭据掩盖问题。订阅更新后，节点名尽量保持稳定，避免客户端保留了已失效的手选项。

## 8. 额度、续用与成员退出

| 管理动作 | 管理员操作 | 必须确认的结果 |
| --- | --- | --- |
| 调整额度 | 编辑该用户的总额度 | 明确设置的是累计总额还是增加余额；保留当前用量，避免无意清零 |
| 延长使用 | 修改截止日期，按约定处理本周期用量 | 新日期生效，其他成员不受影响 |
| 周期重置 | 先核对供应商结算周期，再设置面板重置 | 首次重置记录时间、前后用量；不能把自动重置当成自动收款 |
| 暂停或退出 | 停用该用户并核对全部关联入站 | HY2、TCP VLESS、WS VLESS 的旧凭据均不能建立新连接，B 用户仍可用 |
| 订阅链接泄露 | 更换该用户 Sub ID，并核对旧 URL 失效 | 已经下载的 UUID/Auth 不会因链接变更自动失效；同时轮换相关协议凭据 |
| 完全撤销 | 停用/删除身份，撤销订阅，再复测 | 旧订阅不能再获得有效配置，旧缓存节点也不能新建连接 |

面板可能在用户禁用或达到限额后重启内核，已有连接的处理和生效延迟需现场核对；先安排测试窗口，不能承诺对其他成员完全无影响。仅删除一条订阅卡片、只修改 Sub ID 或只撤销一条入站，不等于完整停用。

## 9. 两名测试用户的验收

以下全部由部署者实测并填入 [私密验收记录](verification.md)，没有完成的写“未验证”，再由使用者决定是否承担试用限制：

- A/B 订阅不同；用 A 的订阅看不到 B 的凭据；三条线路分别真实可用。
- A 在 HY2、TCP、WS 上依次产生少量流量，等待刷新，确认归入同一使用者的累计用量；B 没有被计入。
- 给专用测试用户设置小额度，在受控流量下触发耗尽；分别用三条旧缓存节点尝试新连接，核对都已停用。记录实际超额量和生效时间，不能用这个实验承诺严格零超额。
- 设置测试有效期并等待到期，逐条验证；再测试管理员手动停用，B 应仍可新建连接。
- 轮换 Sub ID 后旧订阅失效；轮换 UUID/Auth 后旧缓存配置失效，新配置成功。
- 自动回退 HY2 → CDN → IPv4、客户端更新/重启、VPS 重启和证书续期分别检查；不能用登录面板成功代替。

## 10. 备份、升级和已有服务迁移

通过面板支持的备份导出方式，或在维护窗口停服务后复制 SQLite 数据库，避免把运行中的数据库主文件单独复制成不一致备份。备份默认数据库 `/etc/x-ui/x-ui.db`（实际路径以安装为准）、TLS 证书与续期配置、面板设置、准确版本和本地脚本；私密加密后另存服务器之外。

升级前保存可恢复副本、软件版本和恢复步骤；测试用户先验证。回滚要同时考虑旧二进制和匹配的数据库，不能让旧程序直接读已迁移的新数据库。恢复后逐条验证登录、用户、订阅、三线路和限额；不要公开上传数据库，也不要把备份默认发送到第三方机器人。

已有独立 Hysteria/Xray 的管理员不能直接按“全新安装”覆盖：

1. 盘点进程、端口、身份、订阅、证书及正在使用的成员，备份并约定维护窗口。
2. 在隔离环境或不冲突的测试端口验证面板路线和两名测试用户；这一阶段旧服务继续由原方式管理。
3. 迁移每位用户，核对身份映射与计费口径。面板自动生成的新身份要先给用户更新配置，不能假定复用了旧密码就全部一致。
4. 获得切换授权后，停旧的相应监听服务，再启用面板正式端口；逐条验收。失败恢复原服务与配置，避免新旧服务同时启动抢端口。

面板“外部链接”功能只能把链接加入订阅，不能据此声称面板控制了独立服务的认证、用量或撤销。本文不依赖这种混合管理来实现家庭共享。

## 11. Agent 执行与问题反馈

Agent 先确认“新建面板统一管理”还是“保留既有独立服务”，把阶段、修改文件、服务归属、用户映射和验收结果记录在本地私密文件。第一名用户成功后继续第二名用户、限额和撤销，不以一条订阅能下载就宣布共享部署完成。

遇到失败先按 面板/订阅服务 → DNS/端口 → TLS → 协议认证 → 用户映射 → 流量统计 排查。版本或 UI 不符合本文时，记录差异并核对官方说明，不通过关闭 TLS 校验、删数据库或修改内核认证来跳过问题。

欢迎 [提交 Issue](https://github.com/koi-lee/vps-selfhost-guide/issues)：说明系统、3X-UI/内核/客户端版本、本文步骤编号、预期与实际结果，以及是否为新 VPS。脱敏错误信息即可，不提交真实订阅、UUID、Auth、私钥、数据库、二维码或成员身份。真实部署与限额/撤销的反馈用于补充本文证据。

## 依据与取舍

2026-09-28 核对以下官方 v3.8.5 资料后，选择“新部署统一由面板管理、已有独立服务单独迁移”。理由是减少重复维护用户和跨服务漏撤销；代价是面板及其管理的内核成为共同依赖，仍须实际验证并做好备份。

- [版本发行页](https://github.com/MHSanaei/3x-ui/releases/tag/v3.8.5)、[固定版本安装器](https://github.com/MHSanaei/3x-ui/blob/v3.8.5/install.sh)：下载来源与安装版本。
- [安装](https://github.com/MHSanaei/3x-ui/blob/v3.8.5/docs/content/docs/en/guide/installation.mdx)、[首次登录](https://github.com/MHSanaei/3x-ui/blob/v3.8.5/docs/content/docs/en/guide/first-login.mdx)、[CLI 参数](https://github.com/MHSanaei/3x-ui/blob/v3.8.5/main.go)：管理入口与监听设置。
- [入站](https://github.com/MHSanaei/3x-ui/blob/v3.8.5/docs/content/docs/en/config/inbounds.mdx)、[用户](https://github.com/MHSanaei/3x-ui/blob/v3.8.5/docs/content/docs/en/config/clients.mdx)、[Host 字段](https://github.com/MHSanaei/3x-ui/blob/v3.8.5/frontend/src/pages/hosts/HostFormModal.tsx)：入站、身份与对外地址。
- [订阅](https://github.com/MHSanaei/3x-ui/blob/v3.8.5/docs/content/docs/en/config/subscription.mdx)、[Mihomo 输出实现](https://github.com/MHSanaei/3x-ui/blob/v3.8.5/internal/sub/clash_service.go)、[按用户统计的回归用例](https://github.com/MHSanaei/3x-ui/blob/v3.8.5/internal/web/service/inbound_client_traffic_test.go)：导出与统计设计依据，不代替现场验证。
- [备份恢复](https://github.com/MHSanaei/3x-ui/blob/v3.8.5/docs/content/docs/en/operations/backup-restore.mdx)：数据库与证书恢复边界。
