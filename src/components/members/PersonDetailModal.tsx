import React, { useState, useRef, useMemo } from 'react';
import { MemberEntry, PersonNode } from '@/types';
import { cleanName, getNameRole, buildShareText, buildVietnameseRelation, checkIsSpouseNode, getSpouseLineageLabel, getFullBranchLabel } from '@/utils/genealogyUtils';
import { formatBirthDisplay, formatDeathDisplay } from '@/utils/dateUtils';
import { Icon } from '@/components/ui/Icon';
import { Toast } from '@/components/ui/Toast';
import { PersonQRModal } from './PersonQRModal';

interface PersonDetailModalProps {
  person: MemberEntry | null;
  onClose: () => void;
}

const checkIfSpouse = (nameStr: string, isSpouseFlag?: boolean): boolean => {
  if (isSpouseFlag) return true;
  return checkIsSpouseNode(nameStr);
};

export const PersonDetailModal = ({ person, onClose }: PersonDetailModalProps) => {
  const [showShare, setShowShare] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const calculatedData = useMemo(() => {
    if (!person) return null;
    const { data, parentNode, pathNodes } = person;

    const isSpouseNode = checkIfSpouse(data.name, data.isSpouse);

    let roleName = getNameRole(data.name);
    if (!roleName) {
      const upperName = data.name.toUpperCase();
      if (upperName.startsWith('CHỒNG')) roleName = 'Chồng';
      else if (upperName.startsWith('VỢ')) roleName = 'Vợ';
    }

    // Gen computation
    const nodesInOrder: PersonNode[] = [];
    if (pathNodes && pathNodes.length > 0) nodesInOrder.push(...pathNodes);
    const lastPathNode = nodesInOrder[nodesInOrder.length - 1];
    if (!lastPathNode || cleanName(lastPathNode.name) !== cleanName(data.name)) {
      nodesInOrder.push(data);
    }

    const genMap = new Map<string, number>();
    if (nodesInOrder.length > 0) {
      genMap.set(cleanName(nodesInOrder[0].name), 1);
      for (let i = 1; i < nodesInOrder.length; i++) {
        const prevNode = nodesInOrder[i - 1];
        const currentNode = nodesInOrder[i];
        const prevGen = genMap.get(cleanName(prevNode.name)) || 1;
        const currentIsSpouse = checkIfSpouse(currentNode.name, currentNode.isSpouse);
        genMap.set(cleanName(currentNode.name), currentIsSpouse ? prevGen : prevGen + 1);
      }
    }

    const displayGen = genMap.get(cleanName(data.name)) || 1;

    const relation = buildVietnameseRelation(data, parentNode, pathNodes);
    const spouseLineage = getSpouseLineageLabel(pathNodes);

    let displayChildren: PersonNode[] = [];
    if (isSpouseNode) {
      displayChildren = data.children || [];
    } else {
      const immediateChildren = data.children || [];
      const displaySpouses = immediateChildren.filter(c => checkIfSpouse(c.name, c.isSpouse));
      const childrenFromSpouses = displaySpouses.flatMap(s => s.children || []);
      const directBloodChildren = immediateChildren.filter(c => !checkIfSpouse(c.name, c.isSpouse));
      const allChildrenMap = new Map<string, PersonNode>();
      [...directBloodChildren, ...childrenFromSpouses].forEach(child => {
        allChildrenMap.set(child.name + (child.birth || ''), child);
      });
      displayChildren = Array.from(allChildrenMap.values());
    }

    const displayName = cleanName(data.name);
    const titleLabel = [...new Set([roleName, data.role].filter(Boolean))].join(' · ');
    const branchLabel = getFullBranchLabel(data, pathNodes);
    const shareText = buildShareText(data, displayName, displayGen, titleLabel, branchLabel, relation, pathNodes, displayChildren);

    return {
      displayName, relation, displayGen, titleLabel,
      branchLabel, spouseLineage, displayChildren, shareText,
      roleTags: [...new Set([data.role, data.branchRoot].filter(Boolean))],
    };
  }, [person]);

  const shareText = useMemo(() => calculatedData?.shareText || '', [calculatedData]);

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: `Gia Phả Phạm Tộc - ${calculatedData?.displayName}`,
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }
    setShowShare(true);
  };

  if (!person || !calculatedData) return null;

  const { data, pathNodes } = person;
  const { displayName, relation, displayGen, titleLabel, branchLabel, spouseLineage, displayChildren, roleTags } = calculatedData;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand('copy');
      }
    }
    setCopied(true);
    setToast('Đã sao chép thông tin!');
    setTimeout(() => setCopied(false), 2500);
  };

  const isAncestor = displayGen === 1;
  const gender = data.gender || (data.isSpouse ? 'female' : 'unknown');
  const genderClass = isAncestor ? 'root-node ancestor' : (gender === 'male' ? 'male' : (gender === 'female' ? 'female' : ''));

  const genColors: Record<number, string> = { 1:'#ca8a04', 2:'#d4943a', 3:'#3da870', 4:'#3a7fc4', 5:'#9060b8' };
  const genColor = isAncestor ? '#ca8a04' : (gender === 'female' ? '#db2777' : (gender === 'male' ? '#2563eb' : (genColors[Math.min(displayGen, 5)] || 'var(--gold-mid)')));

  return (
    <>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="modal-backdrop" onClick={onClose}>
        <div className={`modal detail-modal ${genderClass}`} onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="detail-head">
            <button className="detail-close" onClick={onClose} aria-label="Đóng">
              <Icon name="x" size={16} />
            </button>

            {/* Gen indicator line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: `linear-gradient(90deg, transparent, ${genColor} 30%, ${genColor} 70%, transparent)`,
              opacity: 0.7,
            }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              {/* Avatar placeholder */}
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: `linear-gradient(135deg, ${genColor}22, ${genColor}44)`,
                border: `1px solid ${genColor}44`,
                display: 'grid', placeItems: 'center',
              }}>
                <Icon
                  name={isAncestor ? 'crown' : (data.deceased ? 'moon' : (gender === 'female' ? 'venus' : 'mars'))}
                  size={22}
                  style={{ color: genColor, opacity: 0.9 }}
                />
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h2 className="detail-head-name font-display">{displayName}</h2>
                  {isAncestor ? (
                    <span className="gender-tag root" title="Cụ Thủy Tổ"><Icon name="crown" size={12} /></span>
                  ) : gender === 'male' ? (
                    <span className="gender-tag male" title="Nam"><Icon name="mars" size={11} /></span>
                  ) : gender === 'female' ? (
                    <span className="gender-tag female" title="Nữ"><Icon name="venus" size={11} /></span>
                  ) : null}
                </div>
                <p className="detail-subtitle">{relation}</p>
                {roleTags.length > 0 && (
                  <div className="detail-tags">
                    {roleTags.map((tag) => (
                      <span className="detail-tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="detail-body soft-edge-v">

            {/* Info grid */}
            <div className="detail-grid">
              <div className="detail-field">
                <p className="detail-label"><Icon name="signature" size={11} /> Họ tên</p>
                <p className="detail-value font-serif">{displayName}</p>
              </div>
              <div className="detail-field">
                <p className="detail-label"><Icon name="layers" size={11} /> Đời / vai vế</p>
                <p className="detail-value" style={{ color: genColor }}>
                  Đời thứ {displayGen}
                  {titleLabel ? <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '11px' }}> · {titleLabel}</span> : ''}
                </p>
              </div>
              <div className="detail-field">
                <p className="detail-label"><Icon name="sun" size={11} /> Ngày sinh</p>
                <p className="detail-value">{formatBirthDisplay(data) || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>Chưa có dữ liệu</span>}</p>
              </div>
              <div className="detail-field">
                <p className="detail-label"><Icon name="git-branch" size={11} /> Chi nhánh phả hệ</p>
                <p className="detail-value">{branchLabel}</p>
              </div>
              {spouseLineage && (
                <div className="detail-field">
                  <p className="detail-label"><Icon name="users" size={11} /> Nhánh Mẹ (Vợ thứ)</p>
                  <p className="detail-value" style={{ color: 'var(--gold-mid)', fontWeight: 600 }}>{spouseLineage}</p>
                </div>
              )}
              {data.deceased && (
                <div className="detail-field">
                  <p className="detail-label"><Icon name="moon" size={11} /> Ngày mất</p>
                  <p className="detail-value" style={{ color: 'var(--red-light)' }}>{formatDeathDisplay(data) || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>Chưa có dữ liệu</span>}</p>
                </div>
              )}
              {data.deceased && (
                <div className="detail-field">
                  <p className="detail-label"><Icon name="badge-check" size={11} /> Trạng thái</p>
                  <p className="detail-value" style={{ color: 'var(--red-light)', fontWeight: 700 }}>
                    <Icon name="moon" size={12} style={{ marginRight: 5, verticalAlign: -1 }} />
                    Đã khuất
                  </p>
                </div>
              )}
            </div>

            {/* Lineage path */}
            <div className="lineage-box">
              <p className="detail-label">
                <Icon name="route" size={11} /> Tuyến phả hệ
              </p>
              <p className="lineage-path">
                {pathNodes.map((node, idx) => {
                  const nodeName = cleanName(node.name);
                  if (idx === 0) return <span className="lineage-step" key={`${nodeName}-${idx}`}>{nodeName}</span>;
                  if (checkIfSpouse(node.name, node.isSpouse)) {
                    return (
                      <React.Fragment key={`${nodeName}-${idx}`}>
                        <span className="lineage-heart">&amp;</span>
                        <span className="lineage-step">{nodeName}</span>
                      </React.Fragment>
                    );
                  }
                  return (
                    <React.Fragment key={`${nodeName}-${idx}`}>
                      <span className="lineage-separator">›</span>
                      <span className="lineage-step">{nodeName}</span>
                    </React.Fragment>
                  );
                })}
              </p>
            </div>

            {/* Children */}
            <div className="lineage-box">
              <p className="detail-label">
                <Icon name="users" size={11} /> Con cái ({displayChildren.length})
              </p>
              {displayChildren.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 9 }}>
                  {displayChildren.map((child, idx) => {
                    const childName = cleanName(child.name);
                    const role = getNameRole(child.name) ? ` (${getNameRole(child.name)})` : '';
                    return (
                      <span key={`${child.name}-${idx}`} style={{
                        padding: '5px 10px',
                        borderRadius: 'var(--r-pill)',
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--border-gold)',
                        color: 'var(--text-secondary)',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}>
                        {childName}{role}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="lineage-path" style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>
                  Chưa có dữ liệu thế hệ sau.
                </p>
              )}
            </div>

            {/* Bio/info */}
            {data.bio && (
              <div className="lineage-box">
                <p className="detail-label">
                  <Icon name="book-open" size={11} /> Tiểu sử
                </p>
                <div className="bio-content">{data.bio}</div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ gap: 6 }}>
            <button className="share-btn" onClick={handleNativeShare}>
              <Icon name="share-2" size={13} /> Chia sẻ
            </button>
            <button
              className="action-button"
              style={{
                background: 'linear-gradient(135deg, rgba(201,146,58,0.2), rgba(139,26,26,0.25))',
                border: '1px solid var(--border-gold)',
                color: 'var(--gold-light)',
                fontWeight: 600
              }}
              onClick={() => setShowQRModal(true)}
              title="Xem và tải mã QR gia phả"
            >
              <Icon name="qr-code" size={13} /> Mã QR
            </button>
            <button className="action-button modal-close" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
              <Icon name="x" size={13} /> Đóng
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <PersonQRModal
          data={{
            id: data.id,
            name: data.name,
            displayGen,
            branch: branchLabel,
            relation,
            birth: formatBirthDisplay(data),
            death: data.deceased ? formatDeathDisplay(data) : undefined,
            isDead: data.deceased
          }}
          onClose={() => setShowQRModal(false)}
        />
      )}

      {/* Share sheet */}
      {showShare && (
        <div className="share-overlay" onClick={() => setShowShare(false)}>
          <div className="share-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="share-sheet-head">
              <span className="share-sheet-title font-display">
                <Icon name="share-2" size={14} style={{ marginRight: 7, verticalAlign: -2 }} />
                Chia sẻ thông tin
              </span>
              <button className="detail-close" style={{ position: 'static' }} onClick={() => setShowShare(false)}>
                <Icon name="x" size={15} />
              </button>
            </div>
            <div className="share-sheet-body">
              <textarea
                ref={textareaRef}
                className="share-text-box"
                value={shareText}
                readOnly
                onFocus={(e) => e.target.select()}
              />
              <p className="share-hint">
                Nhấn "Sao chép" rồi dán vào Zalo, Messenger, Facebook...
              </p>
            </div>
            <div className="share-actions">
              <button className={`share-copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
                <Icon name={copied ? 'check' : 'copy'} size={14} />
                {copied ? 'Đã sao chép!' : 'Sao chép nội dung'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};