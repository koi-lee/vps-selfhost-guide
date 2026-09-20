// 新、旧等多国订阅：只在当前订阅中选择日本节点，保留全部国家手选。
function main(config) {
  var proxies = Array.isArray(config.proxies) ? config.proxies : [];
  var japan = proxies.map(function (p) { return p.name; }).filter(function (name) {
    return /日本|Japan|\bJP\b|🇯🇵/i.test(name);
  });
  if (!japan.length) return config;
  var allNames = proxies.map(function (p) { return p.name; }).filter(function(name) {
    return !/有效期|剩余|到期|流量重置/.test(name);
  });
  var originalNames = (config['proxy-groups'] || []).map(function(g) { return g.name; });

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
    proxies: ['日本上网（自动测速）', '切换到手动节点', 'DIRECT'],
    'default-selected': '日本上网（自动测速）',
    hidden: false
  });
  groups.push({
    name: '全部国家节点列表',
    type: 'select',
    proxies: allNames,
    'default-selected': allNames[0],
    hidden: false
  });
  groups.push({name:'切换到手动节点', type:'select', proxies:['全部国家节点列表'], hidden:true});
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
    var parts = r.split(',');
    var index = parts[parts.length - 1] === 'no-resolve' ? parts.length - 2 : parts.length - 1;
    if (originalNames.indexOf(parts[index]) !== -1 && !groups.some(function(g) { return g.name === parts[index]; })) parts[index] = '上网方式';
    return parts.join(',');
  });
  rules.push('MATCH,上网方式');
  config.rules = rules;
  var directDns = ['https://doh.pub/dns-query#DIRECT', 'https://dns.alidns.com/dns-query#DIRECT'];
  config.dns = Object.assign({}, config.dns || {}, {
    'default-nameserver':['223.5.5.5','119.29.29.29'],
    'direct-nameserver':directDns, 'direct-nameserver-follow-policy':false,
    'proxy-server-nameserver':directDns,
    'nameserver-policy':Object.assign({}, (config.dns || {})['nameserver-policy'] || {}, {'geosite:cn':directDns, '+.cn':directDns})
  });
  return config;
}
