// 独立分享版：仅用于本包四节点模板；不含服务器或身份信息。
function main(config) {
  const ps = config.proxies || [];
  if (!ps.length || new Set(ps.map(p => p.name)).size !== ps.length) throw new Error('需要名称唯一的节点');
  const hy = ps.filter(p => p.type === 'hysteria2');
  const ws = ps.filter(p => p.type === 'vless' && p.network === 'ws');
  const tcp = ps.filter(p => p.type === 'vless' && (!p.network || p.network === 'tcp'));
  const v6 = tcp.filter(p => p.server.includes(':'));
  const v4 = tcp.filter(p => !p.server.includes(':'));
  if ([hy, ws, v4, v6].some(a => a.length > 1)) throw new Error('每种角色最多一个节点');
  const auto = [...hy, ...ws, ...v4].map(p => p.name);
  if (!auto.length) throw new Error('缺少可自动回退的节点');
  const names = new Set(ps.map(p => p.name));
  if (['上网线路','自动切换（推荐）','DIRECT'].some(n => names.has(n))) throw new Error('节点名与代理组冲突');
  config['proxy-groups'] = [
    {name:'上网线路', type:'select', proxies:['自动切换（推荐）', ...hy.map(p=>p.name), ...v6.map(p=>p.name), ...ws.map(p=>p.name), ...v4.map(p=>p.name), ...ps.filter(p=>![...hy,...ws,...v4,...v6].includes(p)).map(p=>p.name), 'DIRECT']},
    {name:'自动切换（推荐）', type:'fallback', hidden:true, proxies:auto, url:'https://www.gstatic.com/generate_204', interval:30, timeout:5000, 'max-failed-times':2, 'expected-status':204, lazy:false}
  ];
  const directRules = [
  "DOMAIN-SUFFIX,workbuddy.cn,DIRECT",
  "DOMAIN-SUFFIX,codebuddy.cn,DIRECT",
  "DOMAIN-SUFFIX,tencent.com,DIRECT",
  "DOMAIN,cloud.tencent.com,DIRECT",
  "DOMAIN-SUFFIX,qq.com,DIRECT",
  "DOMAIN-SUFFIX,gtimg.cn,DIRECT",
  "DOMAIN-SUFFIX,gtimg.com,DIRECT",
  "DOMAIN-SUFFIX,v.qq.com,DIRECT",
  "DOMAIN-SUFFIX,video.qq.com,DIRECT",
  "DOMAIN-SUFFIX,bilibili.com,DIRECT",
  "DOMAIN-SUFFIX,biliapi.com,DIRECT",
  "DOMAIN-SUFFIX,biliapi.net,DIRECT",
  "DOMAIN-SUFFIX,bilivideo.com,DIRECT",
  "DOMAIN-SUFFIX,hdslb.com,DIRECT",
  "DOMAIN-REGEX,^upos-.*\\\\.akamaized\\\\.net$,DIRECT",
  "DOMAIN-SUFFIX,cnb.cool,DIRECT",
  "DOMAIN-SUFFIX,mianshiya.com,DIRECT",
  "DOMAIN,pic.code-nav.cn,DIRECT",
  "DOMAIN-SUFFIX,cloudflare.com,DIRECT",
  "DOMAIN-SUFFIX,cloudflare-dns.com,DIRECT",
  "DOMAIN-SUFFIX,baidupcs.com,DIRECT",
  "DOMAIN-SUFFIX,baidubce.com,DIRECT",
  "DOMAIN-SUFFIX,bcebos.com,DIRECT",
  "DOMAIN-SUFFIX,bdstatic.com,DIRECT",
  "DOMAIN-SUFFIX,baidu.com,DIRECT",
  "DOMAIN-SUFFIX,163.com,DIRECT",
  "DOMAIN-SUFFIX,126.com,DIRECT",
  "DOMAIN-SUFFIX,yeah.net,DIRECT",
  "DOMAIN-SUFFIX,127.net,DIRECT",
  "DOMAIN-SUFFIX,188.com,DIRECT",
  "DOMAIN-SUFFIX,126.net,DIRECT",
  "DOMAIN-SUFFIX,netease.com,DIRECT",
  "DOMAIN-SUFFIX,nos.netease.com,DIRECT",
  "DOMAIN-SUFFIX,xiaohongshu.com,DIRECT",
  "DOMAIN-SUFFIX,xhscdn.com,DIRECT",
  "DOMAIN-SUFFIX,xhscdn.net,DIRECT",
  "DOMAIN-SUFFIX,xhslink.com,DIRECT",
  "DOMAIN-SUFFIX,douyin.com,DIRECT",
  "DOMAIN-SUFFIX,douyinpic.com,DIRECT",
  "DOMAIN-SUFFIX,douyinvod.com,DIRECT",
  "DOMAIN-SUFFIX,douyinstatic.com,DIRECT",
  "DOMAIN-SUFFIX,iesdouyin.com,DIRECT",
  "DOMAIN-SUFFIX,amemv.com,DIRECT",
  "DOMAIN-SUFFIX,snssdk.com,DIRECT",
  "DOMAIN-SUFFIX,bytedance.com,DIRECT",
  "DOMAIN-SUFFIX,byteimg.com,DIRECT",
  "DOMAIN-SUFFIX,bytetos.com,DIRECT",
  "DOMAIN-SUFFIX,ibytedtos.com,DIRECT",
  "DOMAIN-SUFFIX,zjcdn.net,DIRECT",
  "DOMAIN-SUFFIX,pstatp.com,DIRECT",
  "DOMAIN-SUFFIX,toutiao.com,DIRECT",
  "DOMAIN-SUFFIX,doubao.com,DIRECT",
  "DOMAIN-SUFFIX,zijieapi.com,DIRECT",
  "DOMAIN-SUFFIX,weibo.com,DIRECT",
  "DOMAIN-SUFFIX,weibo.cn,DIRECT",
  "DOMAIN-SUFFIX,weibocdn.com,DIRECT",
  "DOMAIN-SUFFIX,sina.com.cn,DIRECT",
  "DOMAIN-SUFFIX,sinaimg.cn,DIRECT",
  "DOMAIN-SUFFIX,sinajs.cn,DIRECT",
  "DOMAIN-SUFFIX,zhihu.com,DIRECT",
  "DOMAIN-SUFFIX,zhimg.com,DIRECT",
  "DOMAIN-SUFFIX,iqiyi.com,DIRECT",
  "DOMAIN-SUFFIX,iqiyipic.com,DIRECT",
  "DOMAIN-SUFFIX,qy.net,DIRECT",
  "DOMAIN-SUFFIX,youku.com,DIRECT",
  "DOMAIN-SUFFIX,ykimg.com,DIRECT",
  "DOMAIN-SUFFIX,mgtv.com,DIRECT",
  "DOMAIN-SUFFIX,imgo.tv,DIRECT",
  "DOMAIN-SUFFIX,kuaishou.com,DIRECT",
  "DOMAIN-SUFFIX,gifshow.com,DIRECT",
  "DOMAIN-SUFFIX,qpic.cn,DIRECT",
  "DOMAIN-SUFFIX,qlogo.cn,DIRECT",
  "DOMAIN-SUFFIX,servicewechat.com,DIRECT",
  "DOMAIN-SUFFIX,taobao.com,DIRECT",
  "DOMAIN-SUFFIX,tmall.com,DIRECT",
  "DOMAIN-SUFFIX,alicdn.com,DIRECT",
  "DOMAIN-SUFFIX,tbcdn.cn,DIRECT",
  "DOMAIN-SUFFIX,jd.com,DIRECT",
  "DOMAIN-SUFFIX,360buyimg.com,DIRECT",
  "DOMAIN-SUFFIX,pinduoduo.com,DIRECT",
  "DOMAIN-SUFFIX,yangkeduo.com,DIRECT",
  "DOMAIN-SUFFIX,goofish.com,DIRECT",
  "DOMAIN-SUFFIX,wps.cn,DIRECT",
  "DOMAIN-SUFFIX,kdocs.cn,DIRECT",
  "DOMAIN-SUFFIX,wpscdn.cn,DIRECT",
  "DOMAIN-SUFFIX,cctv.com,DIRECT",
  "DOMAIN-SUFFIX,cctv.cn,DIRECT",
  "DOMAIN-SUFFIX,mi.com,DIRECT",
  "DOMAIN-SUFFIX,xiaomi.com,DIRECT",
  "DOMAIN-SUFFIX,12306.cn,DIRECT",
  "DOMAIN-SUFFIX,icloud.com.cn,DIRECT",
  "GEOIP,CN,DIRECT"
];
  config.rules = [...new Set(directRules.filter(r => !r.startsWith('GEOIP'))), 'GEOIP,CN,DIRECT', 'MATCH,上网线路'];
  return config;
}
