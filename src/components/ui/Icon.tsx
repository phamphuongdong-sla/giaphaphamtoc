import { IconType } from 'react-icons';
import * as FaIcons from 'react-icons/fa6';
import * as LuIcons from 'react-icons/lu';

const iconMap: Record<string, IconType> = {
  // Lucide icons
  'search': LuIcons.LuSearch,
  'x': LuIcons.LuX,
  'chevron-up': LuIcons.LuChevronUp,
  'chevron-down': LuIcons.LuChevronDown,
  'chevron-left': LuIcons.LuChevronLeft,
  'chevron-right': LuIcons.LuChevronRight,
  'plus': LuIcons.LuPlus,
  'minus': LuIcons.LuMinus,
  'home': LuIcons.LuHouse,
  'sun': LuIcons.LuSun,
  'moon': LuIcons.LuMoon,
  'cake': LuIcons.LuCake,
  'bell-ring': LuIcons.LuBellRing,
  'door-open': LuIcons.LuDoorOpen,
  'share-2': LuIcons.LuShare2,
  'copy': LuIcons.LuCopy,
  'check': LuIcons.LuCheck,
  'check-circle': LuIcons.LuCircleCheck,
  'panel-right-open': LuIcons.LuPanelRightOpen,
  'folder-minus': LuIcons.LuFolderMinus,
  'folder-plus': LuIcons.LuFolderPlus,
  'signature': LuIcons.LuSignature,
  'layers': LuIcons.LuLayers,
  'badge-check': LuIcons.LuBadgeCheck,
  'user-round': LuIcons.LuUserRound,
  'user': LuIcons.LuUser,
  'git-branch': LuIcons.LuGitBranch,
  'route': LuIcons.LuRoute,
  'book-open': LuIcons.LuBookOpen,
  'notebook-text': LuIcons.LuNotebookText,
  'users': LuIcons.LuUsers,
  'list': LuIcons.LuList,
  'heart': LuIcons.LuHeart,
  'sparkles': LuIcons.LuSparkles,
  'info': LuIcons.LuInfo,
  'activity': LuIcons.LuActivity,
  'calendar': LuIcons.LuCalendar,
  'search-x': LuIcons.LuSearchX,
  'star': LuIcons.LuStar,
  'settings': LuIcons.LuSettings,
  'cross': FaIcons.FaCross,
  'mars': FaIcons.FaMars,
  'venus': FaIcons.FaVenus,
  'crown': LuIcons.LuCrown,
  'pie-chart': LuIcons.LuChartPie,
  'user-check': LuIcons.LuUserCheck,
  'user-x': LuIcons.LuUserX,
  'git-commit': LuIcons.LuGitCommitHorizontal,
  'award': LuIcons.LuAward,
  'arrow-up-circle': LuIcons.LuCircleArrowUp,
  'smile': LuIcons.LuSmile,
  'printer': LuIcons.LuPrinter,
  'download': LuIcons.LuDownload,
  'edit': LuIcons.LuPencil,
  'trash-2': LuIcons.LuTrash2,
  'refresh-cw': LuIcons.LuRefreshCw,
  'database': LuIcons.LuDatabase,
  'code': LuIcons.LuCode,
  'external-link': LuIcons.LuExternalLink,
  'alert-triangle': LuIcons.LuTriangleAlert,
  'file-text': LuIcons.LuFileText,
  'lock': LuIcons.LuLock,
  'key': LuIcons.LuKey,
  'eye': LuIcons.LuEye,
  'eye-off': LuIcons.LuEyeOff,
  'shield-check': LuIcons.LuShieldCheck,
  'log-out': LuIcons.LuLogOut,
  'user-plus': LuIcons.LuUserPlus,
  'calculator': LuIcons.LuCalculator,
  'git-fork': LuIcons.LuGitFork,
  'qr-code': LuIcons.LuQrCode,
  'upload': LuIcons.LuUpload,
  'file-code': LuIcons.LuFileCode,
};

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  name: keyof typeof iconMap;
  size?: number | string;
}

export const Icon = ({ name, size = 16, ...props }: IconProps) => {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return <span className="inline-block w-4 h-4" />;
  }
  return <IconComponent size={size} {...props} />;
};