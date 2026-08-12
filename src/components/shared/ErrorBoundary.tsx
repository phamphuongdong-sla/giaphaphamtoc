import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in Gia Phả App:', error, errorInfo);
  }

  private handleResetCacheAndReload = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
        if ('caches' in window) {
          caches.keys().then((keys) => {
            Promise.all(keys.map((key) => caches.delete(key))).then(() => {
              window.location.reload();
            });
          });
        } else {
          window.location.reload();
        }
      });
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0c0c0c',
          color: '#f0d090',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          textAlign: 'center',
          fontFamily: "'Be Vietnam Pro', sans-serif",
          boxSizing: 'border-box'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: '#181818',
            border: '1px solid rgba(201,146,58,0.3)',
            borderRadius: '16px',
            padding: '24px 20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
          }}>
            <div style={{
              fontSize: '40px',
              marginBottom: '12px'
            }}>
              🎋
            </div>
            <h2 style={{
              margin: '0 0 8px',
              fontSize: '20px',
              fontWeight: 700,
              color: '#f0d090',
              fontFamily: "'Playfair Display', serif"
            }}>
              Gia Phả Phạm Tộc
            </h2>
            <p style={{
              margin: '0 0 16px',
              fontSize: '13px',
              color: 'rgba(242,237,216,0.7)',
              lineHeight: 1.5
            }}>
              Hệ thống vừa tự động phát hiện phiên bản bộ nhớ đệm cũ hoặc sự cố kết nối. Hãy bấm nút dưới đây để làm mới ứng dụng.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={this.handleResetCacheAndReload}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  border: '1px solid #c9923a',
                  backgroundColor: 'rgba(201,146,58,0.25)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(201,146,58,0.2)'
                }}
              >
                🔄 Xóa Cache & Khôi Phục Ngay
              </button>

              <button
                onClick={() => window.location.reload()}
                style={{
                  width: '100%',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'rgba(242,237,216,0.8)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Tải lại trang bình thường
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
