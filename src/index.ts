import {
  basekit,
  FieldType,
  field,
  FieldComponent,
  FieldCode,
  FieldContext,
} from "@lark-opdev/block-basekit-server-api";
import * as ExifReader from "exifreader";
const { t } = field;

// 标准化日志上下文信息，便于检索
function formatContext(ctx: FieldContext): string {
  const c: any = ctx as any;
  return [
    `logID=${c?.logID ?? ""}`,
    `packID=${c?.packID ?? ""}`,
    `tenantKey=${c?.tenantKey ?? ""}`,
    `baseID=${c?.baseID ?? ""}`,
    `tableID=${c?.tableID ?? ""}`,
    `baseOwnerID=${c?.baseOwnerID ?? ""}`,
    `timeZone=${c?.timeZone ?? ""}`,
    `isNeedPayPack=${c?.isNeedPayPack ?? ""}`,
    `hasQuota=${c?.hasQuota ?? ""}`,
    `baseSignature=${c?.baseSignature ?? ""}`,
  ]
    .map((kv) => `[${kv}]`)
    .join(" ");
}

basekit.addField({
  // 定义捷径的i18n语言资源
  i18n: {
    messages: {
      "zh-CN": {
        inputText: "附件字段",
        errorProcessing: "处理失败，请重试",
        parseSuccess: "EXIF信息提取成功",
        parseFailed: "EXIF信息提取失败",
        noExifData: "未找到EXIF信息",
        downloadError: "下载附件失败",
        noFieldsSelected: "请至少选择一个附件字段",
      },
      "en-US": {
        inputText: "Attachment Field",
        errorProcessing: "Processing failed, please try again",
        parseSuccess: "EXIF extraction successful",
        parseFailed: "EXIF extraction failed",
        noExifData: "No EXIF data found",
        downloadError: "Failed to download attachment",
        noFieldsSelected: "Please select at least one attachment field",
      },
      "ja-JP": {
        inputText: "添付フィールド",
        errorProcessing: "処理に失敗しました。もう一度お試しください",
        parseSuccess: "EXIF抽出成功",
        parseFailed: "EXIF抽出失敗",
        noExifData: "EXIF情報が見つかりません",
        downloadError: "添付ファイルのダウンロードに失敗しました",
        noFieldsSelected: "少なくとも1つの添付フィールドを選択してください",
      },
    },
  },

  // 定义捷径的入参
  formItems: [
    {
      key: "file",
      label: t("inputText"),
      component: FieldComponent.FieldSelect,
      props: {
        supportType: [FieldType.Attachment],
        mode: "multiple",
      },
      validator: {
        required: false,
      },
    },
  ],

  // 定义捷径的返回结果类型
  resultType: {
    type: FieldType.Text,
  },

  // 捷径处理函数
  execute: async function (
    formItemParams: {
      file: any[];
    },
    context: FieldContext
  ) {
    try {
      console.log(`${formatContext(context)} 开始执行函数`);

      // 检查必要参数
      if (!formItemParams.file || formItemParams.file.length === 0) {
        return {
          code: FieldCode.Success,
          msg: t("errorProcessing"),
          data: t("noFieldsSelected"),
        };
      }
      console.log(
        `${formatContext(context)} 用户填入文件信息:`,
        formItemParams.file
      );

      const exifResults: string[] = [];

      // 处理嵌套数组结构
      for (const fieldData of formItemParams.file) {
        const attachments = Array.isArray(fieldData) ? fieldData : [fieldData];
        
        for (const attachment of attachments) {
          if (!attachment) continue;
          
          const url = attachment?.tmp_url || attachment?.url || attachment?.link;
          const filename = attachment?.name || "unknown";
          
          if (!url) continue;

          try {
            console.log(`${formatContext(context)} 开始处理文件: ${filename}`);
            
            // 下载文件
            const response = await fetch(url);
            if (!response.ok) {
              exifResults.push(`${filename}: ${t("downloadError")} (${response.status})`);
              continue;
            }

            const buffer = await response.arrayBuffer();
            
            // 提取EXIF数据
            const tags = ExifReader.load(buffer);
            
            if (!tags || Object.keys(tags).length === 0) {
              exifResults.push(`${filename}: ${t("noExifData")}`);
              continue;
            }

            // 格式化EXIF信息
            let exifInfo = `文件: ${filename}\n`;
            
            // 获取常见的EXIF标签
            const commonTags = [
              'DateTime', 'Make', 'Model', 'ExposureTime', 'FNumber', 
              'ISO', 'Flash', 'FocalLength', 'WhiteBalance', 'ColorSpace',
              'ExifImageWidth', 'ExifImageHeight', 'Orientation'
            ];
            
            for (const tagName of commonTags) {
              if (tags[tagName]) {
                const value = tags[tagName].description || tags[tagName].value || tags[tagName];
                exifInfo += `${tagName}: ${value}\n`;
              }
            }

            // 添加GPS信息（如果存在）
            if (tags.GPSLatitude && tags.GPSLongitude) {
              const lat = tags.GPSLatitude.description || tags.GPSLatitude.value;
              const lon = tags.GPSLongitude.description || tags.GPSLongitude.value;
              exifInfo += `GPS: ${lat}, ${lon}\n`;
            }

            exifResults.push(exifInfo.trim());
            
          } catch (fileError) {
            console.error(`${formatContext(context)} 处理文件 ${filename} 时出错:`, fileError);
            const errMsg = fileError instanceof Error ? fileError.message : "未知错误";
            exifResults.push(`${filename}: ${t("parseFailed")} - ${errMsg}`);
          }
        }
      }

      if (exifResults.length === 0) {
        return {
          code: FieldCode.Success,
          data: t("noExifData"),
          msg: t("noExifData"),
        };
      }

      return {
        code: FieldCode.Success,
        data: exifResults.join('\n\n'),
        msg: t("parseSuccess"),
      };
    } catch (error) {
      console.error(`${formatContext(context)} 执行出错`, error);
      const errMsg = error instanceof Error ? error.message : "未知错误";
      return {
        code: FieldCode.Success,
        data: `${t("parseFailed")}：${errMsg}`,
        msg: `${t("parseFailed")}：${errMsg}`,
      };
    }
  },
});

export default basekit;
