# Agent 部署与恢复执行手册

## 路线选择

新用户先选独立 Hysteria + 独立 Xray 路线；面板是可选管理层，不假定任意 3X-UI 版本能管理全部协议。开始前填写 parameters.example.md，逐项记录所用官方发行版、架构、资产 URL、摘要、配置验证命令。价格与退款条款购买当天核对，付款由本人确认。

## 安装与文件对应

| 文件 | 目标 | 验收 |
|---|---|---|
| hysteria-server.example.yaml | /etc/hysteria/config.yaml | 替换密码，真实 UDP 代理成功 |
| 自己按对应版本官方文档生成的 Xray JSON | /etc/xray/config.json | 内核配置测试通过，再验证两条入站 |
| hysteria.service / xray.service | /etc/systemd/system/ | daemon-reload 后先单独启动，确认再 enable |
| 签发证书 | /etc/vps-tls/fullchain.pem、key.pem | 服务账户可读，域名匹配 |

服务模板是 Linux systemd 专用，不能直接用于 Mac。先建立无登录权限的 vpsproxy 系统用户；程序由 root 管理，目录和证书对 vpsproxy 只读（目录 750、文件 640）。模板使用绑定低端口所需 capability，不授予其他权限。原有服务可能占用端口，先确认监听再启动，不能覆盖安装器已有 unit。模板不是已通过真机的安装脚本。

## Xray 版本差异

当前官方 VLESS 文档与历史版本字段可能不同，例如用户列表字段。必须按实际安装版本生成 JSON，不能混用最新网页与旧内核。配置需覆盖 TCP 443 Vision、WS TLS 8443、独立 UUID 和正常出口；WS 用户不配置 Vision flow。当前不提供未经指定版本内核验证的通用 JSON，Agent 必须完成内核测试并保存生成后的私密配置。

## 证书与续期

使用自己的域名与 DNS-01 最小权限凭据。按 acme.sh 官方安装步骤建立续期任务；使用 --install-cert 将证书部署至上述运行目录，并设置 --reloadcmd 为已经验证的服务重载方式。这里的 unit 没有 ExecReload，不能盲目用 systemctl reload；受控 restart 会中断连接，需要安排窗口。

不能让服务读取 acme.sh 内部工作目录。首次先部署证书，再启动服务，最后验证续期部署钩子。检查 cron 或 timer、签发记录、有效期、运行文件权限及更新后 TLS 握手；不要频繁强制生产签发，避免限额。DNS 凭据只存私密配置。

## 多用户与订阅

本模板 HY2 是单密码起步版，不满足独立撤销多人。多人必须选择所用版本官方支持的用户认证方式或已验证面板管理，并记录客户端认证格式。不得分享同一个密码后声称每人可撤销。
VLESS 每用户独立 UUID，同步到所有相关入站。初期每人发独立 YAML；配置更新后重新发给该用户。这是手动配置分发，不是自动订阅。只有完成 HTTPS 私密分发、独立 token、更新与撤销实测后才能交付“订阅”能力。

## 换电脑

先恢复密码与仓库访问，再解密至新目录。安装对应架构 Clash Verge Rev，退出客户端后备份新机配置，按新版本配置目录选择性导入个人订阅/脚本。修正监控中的用户名、家目录、执行权限后再加载。先系统代理再 TUN；国内 DIRECT、海外 HTTPS、上传下载及自动切换按 verification.md 验收。

## 重建与回滚

先建立 SSH 和救援入口；确认系统、版本、端口与域名。安装程序但暂不启动，映射配置及证书，SQLite 恢复需停面板并备份新数据库，核对权限与版本兼容性。逐服务启动并验证，然后 enable。
防火墙和 cron 只逐条审阅后恢复；nft/iptables 不重复导入。旧数据库修复脚本不得自动运行。新 IP 更新 DNS 并验证，旧 token 按需要轮换。失败则停止本次新服务，恢复本次改动前的文件，不清空整机规则。

## 交付证据

在私密验收记录逐项填写版本、安装来源、文件映射、用户增删、证书续期、重启后可用、故障切换和回滚结果；没有实测写未完成。购机、安装、配置生成和端到端实测是不同阶段。

来源：[Hysteria](https://v2.hysteria.network/docs/getting-started/Server/)、[Xray](https://xtls.github.io/config/inbounds/vless.html)、[acme.sh](https://github.com/acmesh-official/acme.sh)。
