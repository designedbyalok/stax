"use client";

/**
 * lucide-react → HugeIcons drop-in shim.
 *
 * Each export is a component with the same name the app already imported from
 * "lucide-react", but rendered with HugeIcons. The lucide call sites keep
 * working unchanged — `className` (incl. `h-4 w-4` sizing), `strokeWidth`,
 * `color`, and other SVG props pass straight through — so the whole app
 * renders HugeIcons without touching any JSX. Default stroke is a thin 1.8 to
 * match Linear's lighter icon weight.
 *
 * Note: a few lucide glyphs map to the closest HugeIcons equivalent
 * (e.g. Monitor → Computer, Undo2 → ArrowTurnBackward).
 */

import { forwardRef } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Alert02Icon,
  TextAlignLeft01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Notification03Icon,
  Calendar03Icon,
  Camera01Icon,
  Tick02Icon,
  CheckmarkCircle02Icon,
  CheckmarkSquare02Icon,
  UnfoldMoreIcon,
  Clock01Icon,
  DashboardSquare02Icon,
  Copy01Icon,
  Download04Icon,
  Edit02Icon,
  LinkSquare02Icon,
  ViewIcon,
  File01Icon,
  File02Icon,
  FileUploadIcon,
  Globe02Icon,
  DragDropVerticalIcon,
  InboxIcon,
  InformationCircleIcon,
  LayoutTable01Icon,
  Link01Icon,
  Link02Icon,
  FilterIcon,
  Loading03Icon,
  Logout03Icon,
  Mail01Icon,
  Location01Icon,
  ComputerIcon,
  ComputerPhoneSyncIcon,
  Moon02Icon,
  MoreHorizontalIcon,
  CancelCircleIcon,
  Cancel01Icon,
  PaintBoardIcon,
  PenTool03Icon,
  Call02Icon,
  Add01Icon,
  Idea01Icon,
  PrinterIcon,
  PuzzleIcon,
  RefreshIcon,
  FloppyDiskIcon,
  Search01Icon,
  Sent02Icon,
  Settings02Icon,
  SparklesIcon,
  SquareIcon,
  StarIcon,
  Sun03Icon,
  ThumbsUpIcon,
  Delete02Icon,
  TradeUpIcon,
  ArrowTurnBackwardIcon,
  PlugSocketIcon,
  Upload04Icon,
  UserIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons";

export type IconProps = {
  size?: number | string;
  strokeWidth?: number;
  className?: string;
  color?: string;
} & Omit<React.SVGProps<SVGSVGElement>, "ref" | "color">;

function make(icon: IconSvgElement) {
  const Component = forwardRef<SVGSVGElement, IconProps>(function HIcon(
    { strokeWidth = 1.8, ...props },
    ref
  ) {
    return (
      <HugeiconsIcon ref={ref} icon={icon} strokeWidth={strokeWidth} {...props} />
    );
  });
  return Component;
}

// ── Mapped exports (lucide name → HugeIcons glyph) ──────────────────────
export const AlertCircle = make(Alert02Icon);
export const AlignLeft = make(TextAlignLeft01Icon);
export const ArrowLeft = make(ArrowLeft01Icon);
export const ArrowRight = make(ArrowRight01Icon);
export const Bell = make(Notification03Icon);
export const Calendar = make(Calendar03Icon);
export const Camera = make(Camera01Icon);
export const Check = make(Tick02Icon);
export const CheckIcon = make(Tick02Icon);
export const CheckCircle2 = make(CheckmarkCircle02Icon);
export const CircleCheckIcon = make(CheckmarkCircle02Icon);
export const CheckSquare = make(CheckmarkSquare02Icon);
export const ChevronDown = make(ArrowDown01Icon);
export const ChevronDownIcon = make(ArrowDown01Icon);
export const ChevronUp = make(ArrowUp01Icon);
export const ChevronUpIcon = make(ArrowUp01Icon);
export const ChevronRight = make(ArrowRight01Icon);
export const ChevronRightIcon = make(ArrowRight01Icon);
export const ChevronsUpDown = make(UnfoldMoreIcon);
export const Clock = make(Clock01Icon);
export const Columns3 = make(DashboardSquare02Icon);
export const Kanban = make(DashboardSquare02Icon);
export const Copy = make(Copy01Icon);
export const CornerDownRight = make(ArrowRight01Icon);
export const CornerUpLeft = make(ArrowTurnBackwardIcon);
export const Download = make(Download04Icon);
export const Edit2 = make(Edit02Icon);
export const ExternalLink = make(LinkSquare02Icon);
export const Eye = make(ViewIcon);
export const File = make(File01Icon);
export const FileText = make(File02Icon);
export const FileUp = make(FileUploadIcon);
export const Globe = make(Globe02Icon);
export const Globe2 = make(Globe02Icon);
export const GripVertical = make(DragDropVerticalIcon);
export const Inbox = make(InboxIcon);
export const Info = make(InformationCircleIcon);
export const InfoIcon = make(InformationCircleIcon);
export const LayoutTemplate = make(LayoutTable01Icon);
export const Lightbulb = make(Idea01Icon);
export const Link = make(Link01Icon);
export const Link2 = make(Link02Icon);
export const ListFilter = make(FilterIcon);
export const Loader2 = make(Loading03Icon);
export const Loader2Icon = make(Loading03Icon);
export const LogOut = make(Logout03Icon);
export const Mail = make(Mail01Icon);
export const MapPin = make(Location01Icon);
export const Monitor = make(ComputerIcon);
export const MonitorSmartphone = make(ComputerPhoneSyncIcon);
export const Moon = make(Moon02Icon);
export const MoreHorizontal = make(MoreHorizontalIcon);
export const OctagonXIcon = make(CancelCircleIcon);
export const Palette = make(PaintBoardIcon);
export const PenTool = make(PenTool03Icon);
export const Phone = make(Call02Icon);
export const Plus = make(Add01Icon);
export const Printer = make(PrinterIcon);
export const Puzzle = make(PuzzleIcon);
export const RefreshCw = make(RefreshIcon);
export const Save = make(FloppyDiskIcon);
export const Search = make(Search01Icon);
export const Send = make(Sent02Icon);
export const Settings = make(Settings02Icon);
export const Sparkles = make(SparklesIcon);
export const Square = make(SquareIcon);
export const Star = make(StarIcon);
export const Sun = make(Sun03Icon);
export const ThumbsUp = make(ThumbsUpIcon);
export const Trash2 = make(Delete02Icon);
export const TrendingUp = make(TradeUpIcon);
export const TriangleAlertIcon = make(Alert02Icon);
export const Undo2 = make(ArrowTurnBackwardIcon);
export const Unplug = make(PlugSocketIcon);
export const Upload = make(Upload04Icon);
export const User = make(UserIcon);
export const Video = make(Video01Icon);
export const XIcon = make(Cancel01Icon);
export const X = make(Cancel01Icon);
