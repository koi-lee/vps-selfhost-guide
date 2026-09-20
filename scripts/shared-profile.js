// 3X-UI 统一订阅通用增强脚本 v13（2026-09-05）
// 适用：lizean、yingzi 及后续个人统一订阅。
// 安全边界：本脚本不保存 UUID、密码或订阅地址，只处理订阅已经下发的节点。
// Clash Verge 静态校验要求源码包含 function main()；真实逻辑放在 v12Main()。
// 文件末尾再把 main 指向 v12Main：即使编辑器末尾残留默认 main()，也能覆盖回来。

function v12Main(config, profileName) {
  config.ipv6 = true;

  var proxies = Array.isArray(config.proxies) ? config.proxies : [];
  var groups = Array.isArray(config['proxy-groups']) ? config['proxy-groups'] : [];

  var hy2Name = null;
  var cdnName = null;
  var tlsIpv4Name = null;
  var tlsIpv6Name = null;

  proxies.forEach(function(proxy) {
    if (proxy.type === 'hysteria2') {
      // 仅为已核验的自有 HY2 端点固定证书；证书更换后须重新核验指纹。
      // 未知订阅保留其原有 TLS 设置，不再强制关闭校验。
      if (proxy.server === '3xui.starshoreai.com' && Number(proxy.port) === 36912) {
        proxy['skip-cert-verify'] = false;
        proxy.fingerprint = '1A342545082EA5897BEFEF4E9B68ADF31045C511059BC65DE8EC322BAD3C27CA';
      }
      proxy['ip-version'] = 'ipv6-prefer';
      proxy.up = '50 Mbps';
      proxy.down = '200 Mbps';
      if (!hy2Name) hy2Name = proxy.name;
      return;
    }

    if (proxy.type !== 'vless') return;

    if (proxy.network === 'ws' || proxy.server === 'cdn.siheai.uk') {
      proxy['ip-version'] = 'ipv4';
      if (!cdnName) cdnName = proxy.name;
      return;
    }

    if (proxy.network === 'tcp' && typeof proxy.server === 'string') {
      if (proxy.server.indexOf(':') !== -1) {
        proxy['ip-version'] = 'ipv6-only';
        if (!tlsIpv6Name) tlsIpv6Name = proxy.name;
      } else {
        proxy['ip-version'] = 'ipv4';
        if (!tlsIpv4Name) tlsIpv4Name = proxy.name;
      }
    }
  });

  var fallbackNodes = [hy2Name, cdnName, tlsIpv4Name].filter(Boolean);
  if (fallbackNodes.length > 0) {
    var autoStable = {
      name: '自动切换（推荐）',
      hidden: true,
      type: 'fallback',
      proxies: fallbackNodes,
      url: 'https://www.gstatic.com/generate_204',
      interval: 30,
      timeout: 5000,
      'max-failed-times': 2,
      'expected-status': '204',
      lazy: false
    };

    groups = groups.filter(function(group) {
      return group.name !== autoStable.name && group.name !== 'AUTO-STABLE';
    });
    groups.push(autoStable);

    groups.forEach(function(group) {
      if (group.name === 'PROXY') group.name = '上网线路';
      if (Array.isArray(group.proxies)) {
        group.proxies = group.proxies.map(function(name) {
          return name === 'PROXY' ? '上网线路' : name === 'AUTO-STABLE' ? autoStable.name : name;
        });
      }
      if (group.type !== 'select' || group.name === autoStable.name) return;
      var names = Array.isArray(group.proxies) ? group.proxies : [];
      if (names.indexOf(autoStable.name) === -1) names.unshift(autoStable.name);
      if (group.name === '上网线路') {
        var ordered = [autoStable.name, hy2Name, tlsIpv6Name, cdnName, tlsIpv4Name].filter(Boolean);
        names.forEach(function(name) {
          if (name !== 'DIRECT' && ordered.indexOf(name) === -1) ordered.push(name);
        });
        ordered.push('DIRECT');
        names = ordered;
        group['default-selected'] = autoStable.name;
      }
      group.proxies = names;
    });

    config['proxy-groups'] = groups;
    if (Array.isArray(config.rules)) {
      config.rules = config.rules.map(function(rule) {
        return rule.replace(/,(PROXY|AUTO-STABLE)(?=,no-resolve$|$)/, function(_, name) {
          return ',' + (name === 'PROXY' ? '上网线路' : autoStable.name);
        });
      });
    }
  }

  if (Array.isArray(config.rules)) {
    var directRules = [
      'DOMAIN-SUFFIX,workbuddy.cn,DIRECT',
      'DOMAIN-SUFFIX,codebuddy.cn,DIRECT',
      'DOMAIN-SUFFIX,tencent.com,DIRECT',
      'DOMAIN,cloud.tencent.com,DIRECT',
      'DOMAIN-SUFFIX,qq.com,DIRECT',
      'DOMAIN-SUFFIX,gtimg.cn,DIRECT',
      'DOMAIN-SUFFIX,gtimg.com,DIRECT',
      'DOMAIN-SUFFIX,v.qq.com,DIRECT',
      'DOMAIN-SUFFIX,video.qq.com,DIRECT',
      'DOMAIN-SUFFIX,bilibili.com,DIRECT',
      'DOMAIN-SUFFIX,biliapi.com,DIRECT',
      'DOMAIN-SUFFIX,biliapi.net,DIRECT',
      'DOMAIN-SUFFIX,bilivideo.com,DIRECT',
      'DOMAIN-SUFFIX,hdslb.com,DIRECT',
      'DOMAIN-REGEX,^upos-.*\\.akamaized\\.net$,DIRECT',
      'DOMAIN-SUFFIX,cnb.cool,DIRECT',
      'DOMAIN-SUFFIX,mianshiya.com,DIRECT',
      'DOMAIN,pic.code-nav.cn,DIRECT',
      'DOMAIN,3xui.starshoreai.com,DIRECT',
      'DOMAIN,cdn.siheai.uk,DIRECT',
      'DOMAIN-SUFFIX,cloudflare.com,DIRECT',
      'DOMAIN-SUFFIX,cloudflare-dns.com,DIRECT',
      'DOMAIN-SUFFIX,baidupcs.com,DIRECT',
      'DOMAIN-SUFFIX,baidubce.com,DIRECT',
      'DOMAIN-SUFFIX,bcebos.com,DIRECT',
      'DOMAIN-SUFFIX,bdstatic.com,DIRECT',
      'DOMAIN-SUFFIX,baidu.com,DIRECT',
      // 网易邮箱(2026-08-29 注册页报"您所在的地区暂无注册")
      // 覆盖 mail.163.com / passport.163.com / reg.163.com / mail.126.com 等全部子域
      'DOMAIN-SUFFIX,163.com,DIRECT',
      'DOMAIN-SUFFIX,126.com,DIRECT',
      'DOMAIN-SUFFIX,yeah.net,DIRECT',
      'DOMAIN-SUFFIX,127.net,DIRECT',
      'DOMAIN-SUFFIX,188.com,DIRECT',
      'DOMAIN-SUFFIX,126.net,DIRECT',
      'DOMAIN-SUFFIX,netease.com,DIRECT',
      'DOMAIN-SUFFIX,nos.netease.com,DIRECT',
      // 小红书直连(2026-08-29 图片/视频加载慢=国内流量走了海外 VPS)
      // 覆盖 www/edith/t2/as 等主站子域及 xhscdn CDN
      'DOMAIN-SUFFIX,xiaohongshu.com,DIRECT',
      'DOMAIN-SUFFIX,xhscdn.com,DIRECT',
      'DOMAIN-SUFFIX,xhscdn.net,DIRECT',
      'DOMAIN-SUFFIX,xhslink.com,DIRECT',
      // 字节系(抖音/今日头条/豆包) 2026-08-29
      'DOMAIN-SUFFIX,douyin.com,DIRECT',
      'DOMAIN-SUFFIX,douyinpic.com,DIRECT',
      'DOMAIN-SUFFIX,douyinvod.com,DIRECT',
      'DOMAIN-SUFFIX,douyinstatic.com,DIRECT',
      'DOMAIN-SUFFIX,iesdouyin.com,DIRECT',
      'DOMAIN-SUFFIX,amemv.com,DIRECT',
      'DOMAIN-SUFFIX,snssdk.com,DIRECT',
      'DOMAIN-SUFFIX,bytedance.com,DIRECT',
      'DOMAIN-SUFFIX,byteimg.com,DIRECT',
      'DOMAIN-SUFFIX,bytetos.com,DIRECT',
      'DOMAIN-SUFFIX,ibytedtos.com,DIRECT',
      'DOMAIN-SUFFIX,zjcdn.net,DIRECT',
      'DOMAIN-SUFFIX,pstatp.com,DIRECT',
      'DOMAIN-SUFFIX,toutiao.com,DIRECT',
      'DOMAIN-SUFFIX,doubao.com,DIRECT',
      'DOMAIN-SUFFIX,zijieapi.com,DIRECT',
      // 微博 2026-08-29
      'DOMAIN-SUFFIX,weibo.com,DIRECT',
      'DOMAIN-SUFFIX,weibo.cn,DIRECT',
      'DOMAIN-SUFFIX,weibocdn.com,DIRECT',
      'DOMAIN-SUFFIX,sina.com.cn,DIRECT',
      'DOMAIN-SUFFIX,sinaimg.cn,DIRECT',
      'DOMAIN-SUFFIX,sinajs.cn,DIRECT',
      // 知乎 2026-08-29
      'DOMAIN-SUFFIX,zhihu.com,DIRECT',
      'DOMAIN-SUFFIX,zhimg.com,DIRECT',
      // 长视频(爱奇艺/优酷/芒果TV) 2026-08-29；腾讯视频/视频号已由 qq.com 覆盖
      'DOMAIN-SUFFIX,iqiyi.com,DIRECT',
      'DOMAIN-SUFFIX,iqiyipic.com,DIRECT',
      'DOMAIN-SUFFIX,qy.net,DIRECT',
      'DOMAIN-SUFFIX,youku.com,DIRECT',
      'DOMAIN-SUFFIX,ykimg.com,DIRECT',
      'DOMAIN-SUFFIX,mgtv.com,DIRECT',
      'DOMAIN-SUFFIX,imgo.tv,DIRECT',
      // 快手 2026-08-29
      'DOMAIN-SUFFIX,kuaishou.com,DIRECT',
      'DOMAIN-SUFFIX,gifshow.com,DIRECT',
      // 微信生态补充(视频号头像/小程序，qq.com 之外的独立域) 2026-08-29
      'DOMAIN-SUFFIX,qpic.cn,DIRECT',
      'DOMAIN-SUFFIX,qlogo.cn,DIRECT',
      'DOMAIN-SUFFIX,servicewechat.com,DIRECT',
      // 电商(淘宝/天猫/京东/拼多多/闲鱼) 2026-08-29
      'DOMAIN-SUFFIX,taobao.com,DIRECT',
      'DOMAIN-SUFFIX,tmall.com,DIRECT',
      'DOMAIN-SUFFIX,alicdn.com,DIRECT',
      'DOMAIN-SUFFIX,tbcdn.cn,DIRECT',
      'DOMAIN-SUFFIX,jd.com,DIRECT',
      'DOMAIN-SUFFIX,360buyimg.com,DIRECT',
      'DOMAIN-SUFFIX,pinduoduo.com,DIRECT',
      'DOMAIN-SUFFIX,yangkeduo.com,DIRECT',
      'DOMAIN-SUFFIX,goofish.com,DIRECT',
      // 办公与其他常用(WPS/央视/小米/12306/iCloud中国) 2026-08-29
      'DOMAIN-SUFFIX,wps.cn,DIRECT',
      'DOMAIN-SUFFIX,kdocs.cn,DIRECT',
      'DOMAIN-SUFFIX,wpscdn.cn,DIRECT',
      'DOMAIN-SUFFIX,cctv.com,DIRECT',
      'DOMAIN-SUFFIX,cctv.cn,DIRECT',
      'DOMAIN-SUFFIX,mi.com,DIRECT',
      'DOMAIN-SUFFIX,xiaomi.com,DIRECT',
      'DOMAIN-SUFFIX,12306.cn,DIRECT',
      'DOMAIN-SUFFIX,icloud.com.cn,DIRECT'
    ];

    for (var i = directRules.length - 1; i >= 0; i--) {
      if (config.rules.indexOf(directRules[i]) === -1) {
        config.rules.unshift(directRules[i]);
      }
    }

    // 兜底：解析为中国 IP 的流量一律直连（含裸 IP 访问与漏配域名），置于 MATCH 之前
    if (config.rules.indexOf('GEOIP,CN,DIRECT') === -1) {
      var matchIdx = -1;
      for (var g = 0; g < config.rules.length; g++) {
        if (config.rules[g].indexOf('MATCH') === 0) {
          matchIdx = g;
          break;
        }
      }
      if (matchIdx === -1) {
        config.rules.push('GEOIP,CN,DIRECT');
      } else {
        config.rules.splice(matchIdx, 0, 'GEOIP,CN,DIRECT');
      }
    }
  }

  return config;
}

function main(config, profileName) {
  return v12Main(config, profileName);
}

main = v12Main;

// v14: 本机可选的跨订阅兜底。provider 由私有 Merge 配置提供，不在脚本保存订阅凭据。
function v14Main(config, profileName) {
  config = v12Main(config, profileName);
  var groups = config['proxy-groups'] || [];
  groups = groups.filter(function(g) {
    return g.name !== '切换到手动节点（展开选择）';
  });
  var auto = groups.find(function(g) { return g.name === '自动切换（推荐）'; });
  if (!auto) return config;
  auto.hidden = false;
  auto.interval = 15;
  var providers = config['proxy-providers'] || {};
  var sources = ['日本备用-新', '日本备用-旧'].filter(function(n) { return !!providers[n]; });
  groups = groups.filter(function(g) { return g.name !== '日本低延迟（跨订阅）'; });
  if (sources.length) {
    groups.push({name: '日本低延迟（跨订阅）', type: 'url-test', use: sources,
      url: auto.url, interval: 15, timeout: 5000, 'expected-status': '204',
      lazy: false, tolerance: 50, 'empty-fallback': 'REJECT'});
    auto.proxies.push('日本低延迟（跨订阅）');
  }
  config['proxy-groups'] = groups;
  return config;
}
main = v14Main;

// v15: 在 IP 兜底前按本地域名库识别国内站点，避免国内 CDN 资源落入海外出口。
function v15Main(config, profileName) {
  config = v14Main(config, profileName);
  var rules = config.rules || [];
  // 国内域名库之外保留明确的类别补充；不把所有 .cn 或未知网站强制直连。
  var additions = [
    'DOMAIN-SUFFIX,gov.cn,DIRECT',
    // 搜索入口及常用静态资源。
    'DOMAIN-SUFFIX,sogou.com,DIRECT', 'DOMAIN-SUFFIX,sogoucdn.com,DIRECT',
    'DOMAIN-SUFFIX,so.com,DIRECT', 'DOMAIN-SUFFIX,360.cn,DIRECT',
    'DOMAIN-SUFFIX,qhupdate.com,DIRECT', 'DOMAIN-SUFFIX,sm.cn,DIRECT',
    'DOMAIN-SUFFIX,quark.cn,DIRECT', 'DOMAIN-SUFFIX,bdimg.com,DIRECT',
    'DOMAIN-SUFFIX,baidustatic.com,DIRECT',
    // 视频、直播和社区；已有 B站、腾讯、优酷、爱奇艺等规则继续保留。
    'DOMAIN-SUFFIX,cntv.cn,DIRECT', 'DOMAIN-SUFFIX,acfun.cn,DIRECT',
    'DOMAIN-SUFFIX,migu.cn,DIRECT', 'DOMAIN-SUFFIX,miguvideo.com,DIRECT',
    'DOMAIN-SUFFIX,douyu.com,DIRECT', 'DOMAIN-SUFFIX,douyucdn.cn,DIRECT',
    'DOMAIN-SUFFIX,huya.com,DIRECT', 'DOMAIN-SUFFIX,msstatic.com,DIRECT',
    'DOMAIN-SUFFIX,douban.com,DIRECT', 'DOMAIN-SUFFIX,doubanio.com,DIRECT',
    'DOMAIN-SUFFIX,jianshu.com,DIRECT', 'DOMAIN-SUFFIX,jianshu.io,DIRECT',
    'GEOSITE,private,DIRECT', 'GEOSITE,cn,DIRECT'
  ];
  rules = rules.filter(function(r) { return additions.indexOf(r) === -1; });
  var index = rules.findIndex(function(r) { return r === 'GEOIP,CN,DIRECT' || r.indexOf('MATCH,') === 0; });
  if (index < 0) index = rules.length;
  rules.splice.apply(rules, [index, 0].concat(additions));
  config.rules = rules;
  return config;
}
main = v15Main;

// v16: 日常只展示用途；内部健康检测和跨订阅候选继续运行。
function v16Main(config, profileName) {
  // 先还原名称，保证重复执行和旧版规则引用都能得到同一结果。
  var oldNames = {'上网方式':'上网线路', '自动上网（推荐）':'自动切换（推荐）', '日本上网（自动测速）':'日本低延迟（跨订阅）'};
  (config['proxy-groups'] || []).forEach(function(g) {
    g.name = oldNames[g.name] || g.name;
    if (g.proxies) g.proxies = g.proxies.map(function(n) { return oldNames[n] || n; });
  });
  config.rules = (config.rules || []).map(function(r) {
    return r.replace(/,(上网方式|自动上网（推荐）|日本上网（自动测速）)(?=,no-resolve$|$)/, function(_, n) { return ',' + oldNames[n]; });
  });
  config['proxy-groups'] = (config['proxy-groups'] || []).filter(function(g) { return g.name !== '直连上网（不经代理）'; });
  config = v15Main(config, profileName);
  var groups = config['proxy-groups'] || [];
  var aliases = {'上网线路':'上网方式', '自动切换（推荐）':'自动上网（推荐）', '日本低延迟（跨订阅）':'日本上网（自动测速）'};
  groups.forEach(function(g) {
    g.name = aliases[g.name] || g.name;
    if (g.proxies) g.proxies = g.proxies.map(function(n) { return aliases[n] || n; });
    if (g.type === 'fallback' || g.name === '日本上网（自动测速）') g.hidden = true;
  });
  config.rules = (config.rules || []).map(function(r) {
    return r.replace(/,(上网线路|自动切换（推荐）|日本低延迟（跨订阅）)(?=,no-resolve$|$)/, function(_, n) { return ',' + aliases[n]; });
  });
  var mainGroup = groups.find(function(g) { return g.name === '上网方式'; });
  if (mainGroup) {
    mainGroup.proxies = ['自动上网（推荐）'];
    if (groups.some(function(g) { return g.name === '日本上网（自动测速）'; })) mainGroup.proxies.push('日本上网（自动测速）');
    mainGroup.proxies.push('切换到手动节点（展开选择）');
    mainGroup.proxies.push('直连上网（不经代理）');
    mainGroup['default-selected'] = '自动上网（推荐）';
    mainGroup.hidden = false;
    groups.push({name:'直连上网（不经代理）', type:'select', proxies:['DIRECT'], hidden:true});
    groups.push({name:'切换到手动节点（展开选择）', type:'select', proxies:(config.proxies || []).map(function(p) { return p.name; }), hidden:false});
  }
  return config;
}
main = v16Main;
