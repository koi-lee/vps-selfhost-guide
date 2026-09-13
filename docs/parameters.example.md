# 部署参数（复制为本地私密文件后填写）

| 参数 | 待填内容 |
|---|---|
| 预算 | 首年、续费上限、可接受退款期 |
| 使用环境 | 城市、运营商、有线/Wi-Fi、设备系统 |
| VPS | 供应商/区域/系统版本；主机地址留在本地私密文件 |
| 网络 | IPv4、原生 IPv6、UDP 支持、流量额度与超额规则 |
| 入口域名 | `edge.example.com`，DNS only，A/AAAA 指向自己的 VPS |
| CDN 域名 | `cdn.example.com`，支持 WebSocket 的 CDN |
| HY2 | UDP 443，有效 TLS 证书，每用户独立密码 |
| VLESS | TCP 443，TLS + Vision，每用户独立 UUID |
| CDN 源站 | TLS WebSocket TCP 8443，路径 `/vless-ws` |
| 面板 | 仅回环监听，SSH 隧道管理；不要公开无 TLS 面板 |
| 客户端 | Clash Verge Rev 与所带 Mihomo 版本 |
| 带宽参数 | 先保留协议默认；依据实际测试再设置，不复制别人 50/200 Mbps |

`example.com`、`192.0.2.10`、`2001:db8::10` 和 REPLACE_* 均为占位符。部署生成后的文件含私密信息，只留给本人。
