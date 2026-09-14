# 翻译维护与成本

- 中文 README.md、AGENTS.md 与 docs/ 是技术维护源；i18n/ 下五份入口是核心指引，不是全量逐页翻译。
- 不增加翻译 API、网站服务器或构建插件；本次只添加 Markdown 和本地检查，无新增持续服务费。翻译与审阅仍消耗 Agent 用量和人工时间，后续技术变更需检查五份入口。
- 不自动增加更多语言：先收集这六种语言读者反馈，再按需求扩展。
- 源文更新后运行 `python3 tests/check_i18n.py`；摘要变化将提示需要检查译文。人工/Agent复核后才更新 source-sha256.json，不把刷新摘要当作完成翻译。
- 认证、安全限制、端口、故障切换语义、购买授权和未验证声明必须保持一致。共用代码与配置不翻译；UI组名保留原标识并解释。
- 尚未母语者审阅；欢迎提翻译修正。详细中文文档可由读者Agent按所选语言解释。
- GitHub渲染Markdown无需另建站点：https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes
- 如未来使用MkDocs多语言站点，需要另加i18n插件，目前没有这项依赖：https://www.mkdocs.org/user-guide/localizing-your-theme/
