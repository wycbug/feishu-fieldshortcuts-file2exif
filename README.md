# 快速开始

- 运行 `npm install` 安装依赖
- 运行 `npm start` 启动服务器
- 运行 `npm run dev` 测试执行函数

# 飞书附件EXIF信息提取字段插件

这是一个飞书多维表格的字段插件，用于从图片附件中提取EXIF元数据信息。用户可以选择包含图片附件的字段，插件会下载并分析图片文件，提取其中的EXIF信息并以文本格式返回。

## 功能特性

- 从图片附件中提取EXIF元数据信息
- 支持多种图片格式（JPEG、TIFF、PNG、HEIC、WebP、GIF）
- 支持选择多个附件字段，批量处理多个图片文件
- 提取常见EXIF标签：拍摄时间、相机品牌型号、曝光参数、ISO、焦距、白平衡等
- 支持GPS坐标信息提取
- 错误处理机制，单个文件失败不影响其他文件处理
- 支持多语言（中文、英文、日文）
- 丰富的日志上下文，便于检索

## 使用方法

1. 在多维表格中添加该字段插件
2. 在附件字段选择器中选择一个或多个包含图片的附件字段
3. 执行操作，插件会：
   - 下载选中字段中的所有图片文件
   - 提取每个图片的EXIF信息
   - 返回格式化的文本结果，包含文件名和对应的EXIF数据
4. 如果图片没有EXIF信息或下载失败，会显示相应的错误信息

## 支持的EXIF标签

插件会提取以下常见的EXIF标签：

- **DateTime** - 拍摄时间
- **Make** - 相机品牌
- **Model** - 相机型号
- **ExposureTime** - 曝光时间
- **FNumber** - 光圈值
- **ISO** - ISO感光度
- **Flash** - 闪光灯信息
- **FocalLength** - 焦距
- **WhiteBalance** - 白平衡
- **ColorSpace** - 色彩空间
- **ExifImageWidth/Height** - 图片尺寸
- **Orientation** - 图片方向
- **GPS坐标** - 如果图片包含位置信息

## 国际化键值说明

- `inputText` - 附件字段选择标签
- `errorProcessing` - 通用错误消息
- `parseSuccess` - EXIF信息提取成功消息
- `parseFailed` - EXIF信息提取失败消息
- `noExifData` - 未找到EXIF信息提示
- `downloadError` - 下载附件失败提示
- `noFieldsSelected` - 未选择字段时的错误提示

## 日志记录

每行日志都带有标准化的上下文字段前缀，便于跟踪和检索：

`[logID=...] [packID=...] [tenantKey=...] [baseID=...] [tableID=...] [baseOwnerID=...] [timeZone=...] [isNeedPayPack=...] [hasQuota=...] [baseSignature=...]`

## 脚本命令

- `npm start` — 使用 Basekit CLI 运行
- `npm run dev` — 本地执行测试
- `npm run build` — 构建字段包
- `npm run pack` — 创建 `output/output.zip`

# 发布

运行 `npm run pack` 创建 output/output.zip 文件

