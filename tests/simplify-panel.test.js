const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function run(config) {
  const ctx = {};
  const scripts = ['shared-profile.js', 'simplify-panel.js'].map(name => fs.readFileSync(path.join(__dirname, '../scripts', name), 'utf8')).join('\n');
  vm.runInNewContext(scripts, ctx);
  return JSON.parse(JSON.stringify(ctx.main(config)));
}
function fixture() { return {proxies:[{name:'primary',type:'hysteria2',server:'example.com'}], 'proxy-providers':{'japan-primary':{}},rules:[]}; }
test('optional panel presents purposes and retains failover and domestic rules', () => {
  const result = run(fixture());
  assert.deepEqual(result['proxy-groups'].filter(g=>!g.hidden).map(g=>g.name), ['上网方式','全部节点列表']);
  assert.deepEqual(result['proxy-groups'][0].proxies, ['自动上网（推荐）','日本上网（自动测速）','切换到手动节点','直连上网（不经代理）']);
  const fallback = result['proxy-groups'].find(g=>g.type==='fallback');
  assert.deepEqual(fallback.proxies,['primary','日本上网（自动测速）']);
  assert.equal(fallback.lazy,false);
  assert.equal(result.rules.at(-1),'MATCH,上网方式');
  assert.ok(result.rules.includes('GEOSITE,cn,DIRECT'));
  assert.deepEqual(run(JSON.parse(JSON.stringify(result))), result);
});
test('without provider retains automatic, manual and direct choices', () => {
  const input=fixture();delete input['proxy-providers'];
  assert.deepEqual(run(input)['proxy-groups'][0].proxies,['自动上网（推荐）','切换到手动节点','直连上网（不经代理）']);
});
test('rejects node names that collide with option names', () => {
  const input=fixture();input.proxies[0].name='上网方式';
  assert.throws(()=>run(input),/冲突/);
});
