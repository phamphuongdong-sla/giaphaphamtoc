import React, { useState } from 'react';
import { SHEET_ID } from '@/services/googleSheets';
import { Icon } from '@/components/ui/Icon';

interface AppsScriptGuideModalProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

const appsScriptCodeTemplate = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
    if (!sheet) {
      return responseJSON({ success: false, message: "Không tìm thấy sheet tên 'Data'" });
    }
    
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    
    if (action === "create") {
      var rowData = contents.data;
      sheet.appendRow([
        rowData.id || "",
        rowData.parentId || "",
        rowData.name || "",
        rowData.gender || "",
        rowData.birth || "",
        rowData.death || "",
        rowData.isDead || "",
        rowData.bio || "",
        rowData.title || "",
        rowData.branch || ""
      ]);
      return responseJSON({ success: true, message: "Thêm thành viên thành công!" });
    }
    
    if (action === "update") {
      var rowData = contents.data;
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === String(rowData.id).trim()) {
          sheet.getRange(i + 1, 1, 1, 10).setValues([[
            rowData.id || "",
            rowData.parentId || "",
            rowData.name || "",
            rowData.gender || "",
            rowData.birth || "",
            rowData.death || "",
            rowData.isDead || "",
            rowData.bio || "",
            rowData.title || "",
            rowData.branch || ""
          ]]);
          return responseJSON({ success: true, message: "Cập nhật thành viên thành công!" });
        }
      }
      return responseJSON({ success: false, message: "Không tìm thấy ID để cập nhật!" });
    }
    
    if (action === "delete") {
      var targetId = contents.id;
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === String(targetId).trim()) {
          sheet.deleteRow(i + 1);
          return responseJSON({ success: true, message: "Xóa thành viên thành công!" });
        }
      }
      return responseJSON({ success: false, message: "Không tìm thấy ID để xóa!" });
    }
    
    return responseJSON({ success: false, message: "Hành động không hợp lệ!" });
  } catch (err) {
    return responseJSON({ success: false, message: err.toString() });
  }
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export const AppsScriptGuideModal: React.FC<AppsScriptGuideModalProps> = ({
  isOpen,
  isMobile,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyAppsScriptCode = () => {
    navigator.clipboard.writeText(appsScriptCodeTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 720, width: isMobile ? '95%' : '92%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-head"
          style={{ borderBottom: '1px solid var(--border-gold)', paddingBottom: 10 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="font-display" style={{ fontSize: 18, color: 'var(--gold-light)', margin: 0 }}>
              Cấu Hình Google Apps Script
            </h2>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>

        <div
          style={{
            padding: '16px 20px',
            maxHeight: '70vh',
            overflowY: 'auto',
            fontSize: 13,
            color: 'var(--text-secondary)',
          }}
        >
          <p style={{ margin: '0 0 12px' }}>
            Để ứng dụng web có thể tự động <strong>Thêm / Sửa / Xóa</strong> thành viên trực tiếp vào file Google Sheets, bạn hãy làm theo các bước:
          </p>

          <ol style={{ paddingLeft: 20, margin: '0 0 16px', lineHeight: 1.6 }}>
            <li>
              Mở file Google Sheet gia tộc của bạn (<code>ID: {SHEET_ID}</code>).
            </li>
            <li>
              Vào menu <strong>Tiện ích mở rộng (Extensions)</strong> &gt; chọn <strong>Apps Script</strong>.
            </li>
            <li>
              Dán toàn bộ đoạn mã bên dưới vào file <code style={{ color: 'var(--gold)' }}>Code.gs</code> rồi bấm <strong>Lưu (Save)</strong>.
            </li>
            <li>
              Bấm <strong>Triển khai (Deploy)</strong> &gt; <strong>Triển khai dưới dạng ứng dụng web (New Deployment)</strong>:
              <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                <li>
                  <strong>Thực thi dưới danh nghĩa (Execute as):</strong> Chọn <i>Tôi (Me)</i>.
                </li>
                <li>
                  <strong>Ai có quyền truy cập (Who has access):</strong> Chọn <i>Bất kỳ ai (Anyone)</i>.
                </li>
              </ul>
            </li>
          </ol>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: 'var(--gold-mid)' }}>Mã Nguồn Code.gs:</span>
            <button
              onClick={copyAppsScriptCode}
              style={{
                background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(201,146,58,0.2)',
                border: '1px solid var(--border-gold)',
                color: copied ? '#4ade80' : 'var(--gold-light)',
                padding: '4px 12px',
                borderRadius: 'var(--r-sm)',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icon name={copied ? 'check' : 'copy'} size={13} />
              {copied ? 'Đã sao chép!' : 'Sao chép mã Code.gs'}
            </button>
          </div>

          <pre
            style={{
              background: '#090909',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--r-sm)',
              padding: 12,
              fontSize: 11,
              fontFamily: 'Consolas, Monaco, monospace',
              color: '#e2e8f0',
              overflowX: 'auto',
              maxHeight: 280,
            }}
          >
            {appsScriptCodeTemplate}
          </pre>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-glass)', textAlign: 'right' }}>
          <button
            onClick={onClose}
            className="action-button"
            style={{ padding: '6px 16px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
