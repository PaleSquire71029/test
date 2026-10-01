# VOID//RUN — 虚空回响

《回声协议》第一航程的可玩 Demo。

## GitHub Pages

项目使用纯静态 HTML / CSS / JavaScript，不依赖后端。仓库根目录包含 `index.html` 与 `.nojekyll`，并提供 GitHub Actions 自动部署工作流。

部署完成后，项目站点通常为：

`https://palesquire71029.github.io/test/`

> GitHub Pages 项目站点的默认路径包含仓库名；首次部署或更新可能需要等待一段时间。

## 当前 Demo

- 双端操作：桌面 WASD + 鼠标 / 移动端双摇杆
- 自动瞄准、自动射击、灵敏度、左手模式、低性能模式
- DASH 无敌帧与 CORE 范围技能
- 多种敌人 AI、Boss、精英压力与波次推进
- 角色等级、升级、CORE 回收与装备记录
- NPC 通讯、关键选择、隐藏房间、世界档案
- 灰潮湾 → 镜原 → NODE-03 的阶段世界观
- 本地存档、自动保存、备份回退、JSON 导入导出
- 移动端安全区与短屏布局适配
- GitHub Pages 自动部署

## 部署

仓库的 `main` 分支推送会触发 `.github/workflows/pages.yml`。如果仓库的 Pages 尚未选择 Actions 作为发布方式，请在 GitHub 的 **Settings → Pages** 中选择 GitHub Actions。

本项目不使用服务端代码，所有运行数据保存在玩家浏览器本地。
