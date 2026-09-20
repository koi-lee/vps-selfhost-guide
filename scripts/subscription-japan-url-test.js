// 旧订阅专用：默认在本订阅的日本节点中自动选择低延迟且可用的节点。
function main(config) {
  var proxies = Array.isArray(config.proxies) ? config.proxies : [];
  var japan = proxies.map(function (p) { return p.name; }).filter(function (name) {
    return /日本|Japan|\bJP\b|🇯🇵/i.test(name);
  });
  if (!japan.length) return config;
  var allNames = proxies.map(function (p) { return p.name; });

  // 旧订阅自带的 Proxy/Auto 等组会把几十个节点重新铺满页面；日常配置只保留两个必要组。
  var groups = [];
  groups.push({
    name: '日本上网（自动测速）',
    type: 'url-test',
    proxies: japan,
    url: 'https://www.gstatic.com/generate_204',
    interval: 15,
    timeout: 5000,
    'expected-status': 204,
    lazy: false,
    tolerance: 50,
    'empty-fallback': 'REJECT',
    hidden: true
  });
  groups.unshift({
    name: '上网方式',
    type: 'select',
    proxies: ['日本上网（自动测速）', '手动选择节点（全部国家）', 'DIRECT'],
    'default-selected': '日本上网（自动测速）',
    hidden: false
  });
  groups.push({
    name: '手动选择节点（全部国家）',
    type: 'select',
    proxies: allNames,
    'default-selected': allNames[0],
    hidden: false
  });
  config['proxy-groups'] = groups;

  var rules = Array.isArray(config.rules) ? config.rules : [];
  var direct = [
    'GEOSITE,private,DIRECT', 'GEOSITE,cn,DIRECT', 'GEOIP,CN,DIRECT',
    'DOMAIN-SUFFIX,gov.cn,DIRECT', 'DOMAIN-SUFFIX,baidu.com,DIRECT',
    'DOMAIN-SUFFIX,bilibili.com,DIRECT', 'DOMAIN-SUFFIX,qq.com,DIRECT',
    'DOMAIN-SUFFIX,wechat.com,DIRECT', 'DOMAIN-SUFFIX,weibo.com,DIRECT',
    'DOMAIN-SUFFIX,zhihu.com,DIRECT', 'DOMAIN-SUFFIX,douyin.com,DIRECT',
    'DOMAIN-SUFFIX,iqiyi.com,DIRECT', 'DOMAIN-SUFFIX,youku.com,DIRECT',
    'DOMAIN-SUFFIX,mgtv.com,DIRECT', 'DOMAIN-SUFFIX,sogou.com,DIRECT',
    'DOMAIN-SUFFIX,360.cn,DIRECT'
  ];
  rules = direct.concat(rules.filter(function (r) {
    return direct.indexOf(r) === -1 && !/^MATCH,/.test(r);
  })).map(function (r) {
    return r.replace(/,(Proxy|Auto)(?=,no-resolve$|$)/, ',上网方式');
  });
  rules.push('MATCH,上网方式');
  config.rules = rules;
  return config;
}
