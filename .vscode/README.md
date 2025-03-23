# VS Code 设置说明

本项目已配置VS Code工作区设置，以支持保存时自动格式化代码，特别是Prisma文件。

## 必要的VS Code扩展

为了使自动格式化功能正常工作，请安装以下VS Code扩展：

1. **Prettier - Code formatter**

   - ID: `esbenp.prettier-vscode`
   - 用于一般代码格式化

2. **Prisma**
   - ID: `Prisma.prisma`
   - 用于Prisma文件的语法高亮和格式化

## 自动格式化设置

工作区已配置以下设置：

- 保存文件时自动格式化
- 使用Prettier作为默认格式化工具
- 对Prisma文件使用Prisma扩展进行格式化

这些设置存储在 `.vscode/settings.json` 文件中，当您打开此项目时会自动应用。

## 手动格式化

如果需要手动格式化文件，可以：

- 使用快捷键：`Shift + Alt + F`
- 右键菜单：选择「格式化文档」
- 命令面板：`Ctrl+Shift+P` 然后输入「Format Document」

## 项目级格式化命令

项目已配置npm脚本用于格式化所有文件：

```
pnpm format
```

此命令将使用Prettier格式化项目中的所有支持的文件。
