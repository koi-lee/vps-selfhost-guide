// 可选面板：粘贴到 shared-profile.js 之后；不改变基础脚本的默认展示。
var standardMain = main;
//  日常只展示用途；内部健康检测和跨订阅候选继续运行。
function simplifiedMain(config, profileName) {
  var reserved = ['上网方式','自动上网（推荐）','日本上网（自动测速）','直连上网（不经代理）'];
  if ((config.proxies || []).some(function(p) { return reserved.indexOf(p.name) !== -1; })) throw new Error('节点名与简化面板选项冲突');
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
  config = standardMain(config, profileName);
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
    mainGroup.proxies.push('直连上网（不经代理）');
    mainGroup['default-selected'] = '自动上网（推荐）';
    mainGroup.hidden = false;
    groups.push({name:'直连上网（不经代理）', type:'select', proxies:['DIRECT'], hidden:true});
  }
  return config;
}
main = simplifiedMain;
